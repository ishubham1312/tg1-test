
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Question, GeneratedQuestionPayload, QuestionStatus, TestInputMethod, LanguageOption } from "../types";
import { GEMINI_TEXT_MODEL, NUM_QUESTIONS_AI_DECIDES, DEFAULT_NUM_QUESTIONS } from "../constants";

// Read keys from environment variable, expecting a comma-separated string
const apiKeys = (process.env.API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

let currentKeyIndex = 0;

if (apiKeys.length === 0) {
  console.error("API_KEY environment variable not set or is empty.");
}

const getAi = (): GoogleGenAI => {
  if (apiKeys.length === 0) {
    throw new Error("API_KEY environment variable not set or is empty. Please configure it with one or more comma-separated keys.");
  }
  const apiKey = apiKeys[currentKeyIndex];
  return new GoogleGenAI({ apiKey });
};

const rotateApiKey = () => {
  if (apiKeys.length > 1) {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.log(`Rotated to API key index ${currentKeyIndex}.`);
  }
};

const handleApiError = (error: Error) => {
  // Check for common rate limit/overload error status codes or messages
  if (error.message.includes("429") || error.message.toLowerCase().includes("overloaded") || error.message.toLowerCase().includes("rate limit")) {
    rotateApiKey();
  }
};

const parseJsonFromMarkdown = <T,>(text: string): T | null => {
  try {
    let jsonStr = text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    jsonStr = jsonStr.replace(/\]\s*"/g, '], "');
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    console.error("Raw text:", text);
    return null;
  }
};


export const generateQuestionsFromContent = async (
  inputType: TestInputMethod, 
  content: string,
  numQuestions: number, 
  language?: LanguageOption,
  difficultyLevel?: number,
  customInstructions?: string,
  titaEnabled: boolean = false
): Promise<Question[]> => {
  
  let prompt: string;
  let languageSpecificInstructions = "";
  let targetLanguage = language || "the source document's primary language";
  let difficultyInstruction = "";
  let userProvidedInstructions = ""; 

  if (language) {
    languageSpecificInstructions = `
      - Language Focus: Generate questions *strictly* in **${language}**. All passageText, questionText, and options must be in **${language}**.
    `;
    targetLanguage = language;
  }

  if (difficultyLevel && (inputType === TestInputMethod.SYLLABUS || inputType === TestInputMethod.TOPIC)) {
    difficultyInstruction = `\n- Difficulty Level: **${difficultyLevel}** on a scale of 1 to 5.`;
  }

  if (customInstructions && (inputType === TestInputMethod.SYLLABUS || inputType === TestInputMethod.TOPIC)) {
    userProvidedInstructions = `\n- User-Provided Custom Instructions: ${customInstructions}`;
  }


  let documentProcessingInstructions = "";
  if (inputType === TestInputMethod.DOCUMENT) {
    documentProcessingInstructions = `
    The provided content is from a document.
    Your tasks are:
      - Identify passages/contexts and place them in 'passageText'. The 'questionText' should then contain the actual question. If no passage, omit 'passageText'.
      - Identify actual questions. These can be Multiple-Choice (MCQ) or Type-In-The-Answer (TITA).
      - Ignore non-question content like instructions or cover pages.
    ${languageSpecificInstructions}
    `;
  } else {
    documentProcessingInstructions = `
    Identify passages/contexts and place them in 'passageText'. The 'questionText' should then contain the actual question. If no passage, omit 'passageText'.
    ${languageSpecificInstructions}${difficultyInstruction}${userProvidedInstructions}
    `;
  }

  const jsonStructureNote = `
    The response MUST be a valid JSON array of objects. Each object represents one question and must have ONE of the following structures:

    1. For Multiple-Choice Questions (MCQ):
    {
      "passageText": "Optional. Text passage preceding the question in ${targetLanguage}. Can contain simple HTML.",
      "questionText": "The question in ${targetLanguage}. Can contain simple HTML like <table>.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0
    }

    2. For Type-In-The-Answer (TITA) / Fill-in-the-blanks Questions:
    {
      "passageText": "Optional. Text passage preceding the question in ${targetLanguage}.",
      "questionText": "The question with a blank, like 'The capital of France is ___.' in ${targetLanguage}.",
      "correctAnswerText": "Paris"
    }

    CRITICAL JSON RULES:
    1. For MCQs, 'options' array MUST have 4 distinct string elements and 'correctAnswerIndex' must be a number (0-3).
    2. For TITA questions, 'options' and 'correctAnswerIndex' MUST be omitted.
    3. For "Match the Following" questions, use a valid HTML <table> inside 'questionText' and treat it as an MCQ.
    4. All strings must be in double quotes.
  `;

  if (numQuestions === NUM_QUESTIONS_AI_DECIDES && inputType === TestInputMethod.DOCUMENT) {
    prompt = `
    You are an expert multilingual test creator. Based on the document content:
    ---
    ${content}
    ---
    ${documentProcessingInstructions}
    Extract ALL identifiable unique questions (${titaEnabled ? 'both MCQ and TITA' : 'only MCQ'}) from the document in ${targetLanguage}.
    ${jsonStructureNote}
  `;
  } else {
    prompt = `
    You are an expert multilingual test creator. Based on the ${inputType} content:
    ---
    ${content}
    ---
    ${documentProcessingInstructions}
    Generate EXACTLY ${numQuestions > 0 ? numQuestions : DEFAULT_NUM_QUESTIONS} unique questions (${titaEnabled ? 'can be a mix of MCQ and TITA' : 'only MCQ'}).
    ${!titaEnabled ? '\nIMPORTANT: Do NOT generate any TITA (Type-In-The-Answer) or fill-in-the-blank questions. Only generate MCQs with 4 options and a correct answer index.' : ''}
    ${jsonStructureNote}
  `;
  }

  try {
    const aiInstance = getAi();
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3, 
      },
    });

    const generatedPayload = parseJsonFromMarkdown<GeneratedQuestionPayload[]>(response.text);

    if (!generatedPayload || !Array.isArray(generatedPayload)) {
      throw new Error("AI did not return valid question data. The response was not a JSON array.");
    }
    
    if (generatedPayload.length === 0 && (numQuestions > 0 || numQuestions === NUM_QUESTIONS_AI_DECIDES) ) { 
       throw new Error(`AI returned an empty list of questions. This might be because no questions were identifiable, no content matched the selected language (${targetLanguage}), or the combination of topic/syllabus and difficulty yielded no results.`);
    }

    return generatedPayload.map((q, index) => ({
      id: `q-${Date.now()}-${index}`,
      passageText: q.passageText,
      questionText: q.questionText,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      correctAnswerText: q.correctAnswerText,
      status: QuestionStatus.UNVISITED,
    }));

  } catch (error) {
    console.error("Error generating questions:", error);
    if (error instanceof Error) {
        handleApiError(error);
        throw new Error(`Failed to generate questions: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating questions.");
  }
};

export const extractTextFromInlineData = async (base64Data: string, mimeType: string): Promise<string> => {
  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Data,
    },
  };
  const textPart = {
    text: "Extract all text from this document/image. Respond with only the extracted text. If the document is primarily in a non-English language (e.g., Hindi), extract the text in that language."
  };

  try {
    const aiInstance = getAi();
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: GEMINI_TEXT_MODEL, 
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error extracting text from inline data:", error);
    if (error instanceof Error) {
        handleApiError(error);
        if (error.message.includes('400 Bad Request')) {
          throw new Error("The uploaded file could not be processed. It might be corrupted or an unsupported format.");
        }
        throw new Error(`Failed to extract text: ${error.message}`);
    }
    throw new Error("Failed to extract text using AI.");
  }
};

export const generateExplanationForQuestion = async (question: Question): Promise<string> => {
  const isTITA = !question.options || question.options.length === 0;

  const prompt = `
    You are an expert tutor. For the following question:
    ---
    ${question.passageText ? `Passage:\n${question.passageText}\n---\n` : ''}
    Question: ${question.questionText}
    ${isTITA 
        ? `Correct Answer: ${question.correctAnswerText}`
        : `Options: ${question.options?.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join(' | ')}
           Correct Answer: ${String.fromCharCode(65 + (question.correctAnswerIndex ?? 0))}. ${question.options?.[question.correctAnswerIndex ?? 0]}`
    }
    ${isTITA
        ? (question.userAnswerText !== undefined ? `User's Answer: ${question.userAnswerText}` : "")
        : (question.userAnswerIndex !== undefined ? `User's Answer: ${String.fromCharCode(65 + question.userAnswerIndex)}. ${question.options?.[question.userAnswerIndex]}` : "")
    }
    ---
    Provide a concise explanation for why the correct answer is correct. If the user answered incorrectly, also explain why their choice is wrong (if applicable for MCQ).
    Be helpful and educational. Keep it to a few sentences. Do not repeat the question or options.
    The explanation should be in the same language as the question if possible.
  `;

  try {
    const aiInstance = getAi();
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating explanation:", error);
     if (error instanceof Error) {
        handleApiError(error);
        throw new Error(`Failed to generate explanation: ${error.message}`);
    }
    throw new Error("Failed to generate explanation using AI.");
  }
};


export const getGeminiFollowUpChat = (question: Question, explanation?: string): Chat => {
  const aiInstance = getAi();
  const explanationText = explanation
    ? `Explanation: ${explanation}`
    : "An official explanation has not been provided. Based on the question and correct answer, please assist the user.";

  const isTITA = !question.options || question.options.length === 0;

  const questionContext = isTITA
    ? `
      Question: ${question.questionText}
      Correct Answer: ${question.correctAnswerText}
    `
    : `
      Question: ${question.questionText}
      Options:
      ${question.options?.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}
      Correct Answer: ${String.fromCharCode(65 + (question.correctAnswerIndex ?? 0))}. ${question.options?.[question.correctAnswerIndex ?? 0]}
    `;

  const history = [
    {
      role: "user",
      parts: [{text: `
        Context for AI: The user is asking about the following question. Your persona is Elsa.
        ---
        ${question.passageText ? `Passage:\n${question.passageText}\n---\n` : ''}
        ${questionContext}
        ${explanationText}
        ---
        The user's next message is their actual question.
      `}]
    },
    {
      role: "model",
      parts: [{text: "Context understood. I am ready to answer the user's follow-up question as Elsa."}]
    }
  ];

  const chat: Chat = aiInstance.chats.create({
    model: GEMINI_TEXT_MODEL,
    history: history,
    config: {
      temperature: 0.5,
      systemInstruction: `You are Elsa, a helpful AI assistant.
      Your personality is razor-sharp, clear, and composed. You value truth and elegance.
      When answering, provide clear, concise, and accurate responses.
      - Use markdown for formatting (**bold**, *italics*, lists with '*'). Each list item must be on a new line.
      - Stick to the context of the question.
      - Keep responses brief.
      - Do not offer to change the correct answer.
      `
    }
  });
  return chat;
};