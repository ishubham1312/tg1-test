

import React, { useState, useEffect } from 'react';
import { TestInputMethod, TimeSettings, LanguageOption, NegativeMarkingSettings, PendingTestConfig } from '../types';
import { 
  DEFAULT_NUM_QUESTIONS, MAX_QUESTIONS, MIN_QUESTIONS, MAX_FILE_SIZE_MB, 
  SUPPORTED_IMAGE_TYPES, SUPPORTED_TEXT_TYPES, SUPPORTED_PDF_MIME_TYPE, 
  NUM_QUESTIONS_AI_DECIDES, DEFAULT_LANGUAGE_OPTION,
  DEFAULT_NEGATIVE_MARKS, MIN_NEGATIVE_MARKS
} from '../constants';
import Button from './Button';
import { ArrowUpTrayIcon, DocumentTextIcon, ChevronLeftIcon, XCircleIcon, PhotoIcon } from './Icons';
import { extractTextFromInlineData } from '../services/geminiService'; 

const difficultyLevelMap: { [key: number]: string } = {
  1: 'Foundation',
  2: 'Growth',
  3: 'Proficient',
  4: 'Achiever',
  5: 'Mastery',
};

interface TestSetupFormProps {
  onStartGenerationProcess: ( 
    inputMethod: TestInputMethod,
    content: string, 
    numQuestions: number,
    timeSettings: TimeSettings,
    negativeMarking: NegativeMarkingSettings,
    mimeType?: string,
    originalFileName?: string,
    selectedLanguage?: LanguageOption,
    difficultyLevel?: number,
    customInstructions?: string
  ) => void;
  isLoading: boolean; 
  initialInputMethod: TestInputMethod;
  initialConfig?: PendingTestConfig | null; 
  onBackToHome: () => void;
  isRetakeMode?: boolean;
}

const getInputMethodLabel = (method: TestInputMethod | null, isRetake: boolean): string => {
  if (isRetake) return "Retake Test: Adjust Settings";
  if (!method) return "Setup Test";
  switch (method) {
    case TestInputMethod.DOCUMENT: return "Extract from Document/PDF/Image";
    case TestInputMethod.SYLLABUS: return "Generate from Syllabus/Text";
    case TestInputMethod.TOPIC: return "Generate from Topic";
    default: return "Setup Test";
  }
};

export const TestSetupForm: React.FC<TestSetupFormProps> = ({ 
  onStartGenerationProcess, 
  isLoading, 
  initialInputMethod, 
  initialConfig,
  onBackToHome,
  isRetakeMode = false
}) => {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [syllabusText, setSyllabusText] = useState<string>(initialConfig?.inputMethod === TestInputMethod.SYLLABUS ? initialConfig.content : '');
  const [topicText, setTopicText] = useState<string>(initialConfig?.inputMethod === TestInputMethod.TOPIC ? initialConfig.content : '');
  
  const [numQuestions, setNumQuestions] = useState<string>(() => 
    initialConfig?.numQuestions != null ? String(initialConfig.numQuestions) : ''
  );
  
  const [isTimedTest, setIsTimedTest] = useState<boolean>(() => {
    return initialConfig?.timeSettings?.type === 'timed';
  });

  const [manualHours, setManualHours] = useState<string>(() => {
    if (initialConfig?.timeSettings?.type === 'timed') {
      return String(Math.floor(initialConfig.timeSettings.totalSeconds / 3600));
    }
    return ''; 
  });

  const [manualMinutes, setManualMinutes] = useState<string>(() => {
    if (initialConfig?.timeSettings?.type === 'timed') {
      return String(Math.floor((initialConfig.timeSettings.totalSeconds % 3600) / 60));
    }
    return ''; 
  });

  const [isNegativeMarkingEnabled, setIsNegativeMarkingEnabled] = useState<boolean>(initialConfig?.negativeMarking.enabled ?? false);
  const [negativeMarksPerQuestion, setNegativeMarksPerQuestion] = useState<string>(() => 
    initialConfig?.negativeMarking.marksPerQuestion != null ? String(initialConfig.negativeMarking.marksPerQuestion) : ''
  );

  const [difficultyLevel, setDifficultyLevel] = useState<number>(initialConfig?.difficultyLevel ?? 3);
  const [customInstructions, setCustomInstructions] = useState<string>(initialConfig?.customInstructions ?? ''); 
  const [titaEnabled, setTitaEnabled] = useState<boolean>(initialConfig?.titaEnabled ?? false);


  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>(initialConfig?.inputMethod === TestInputMethod.DOCUMENT ? initialConfig.originalFileName || '' : 
                                               (initialConfig?.inputMethod === TestInputMethod.SYLLABUS ? initialConfig.originalFileName || '' : ''));
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(initialConfig?.selectedLanguage ?? DEFAULT_LANGUAGE_OPTION);
  const [syllabusLoading, setSyllabusLoading] = useState<boolean>(false);

  useEffect(() => {
    setError(null); 
    
    if (initialConfig) {
        setSyllabusText(initialConfig.inputMethod === TestInputMethod.SYLLABUS ? initialConfig.content : '');
        setTopicText(initialConfig.inputMethod === TestInputMethod.TOPIC ? initialConfig.content : '');
        setNumQuestions(initialConfig.numQuestions != null ? String(initialConfig.numQuestions) : '');
        
        const newIsTimedTest = initialConfig.timeSettings.type === 'timed';
        setIsTimedTest(newIsTimedTest);
        if (initialConfig.timeSettings.type === 'timed') {
            setManualHours(String(Math.floor(initialConfig.timeSettings.totalSeconds / 3600)));
            setManualMinutes(String(Math.floor((initialConfig.timeSettings.totalSeconds % 3600) / 60)));
        } else {
            setManualHours('');
            setManualMinutes('');
        }
        
        const newIsNegativeMarkingEnabled = initialConfig.negativeMarking.enabled ?? false;
        setIsNegativeMarkingEnabled(newIsNegativeMarkingEnabled);
        setNegativeMarksPerQuestion(initialConfig.negativeMarking.marksPerQuestion != null ? String(initialConfig.negativeMarking.marksPerQuestion) : '');

        setDifficultyLevel(initialConfig.difficultyLevel ?? 3);
        setCustomInstructions(initialConfig.customInstructions ?? ''); 
        setSelectedLanguage(initialConfig.selectedLanguage ?? DEFAULT_LANGUAGE_OPTION);
        setTitaEnabled(initialConfig.titaEnabled ?? false);

        if (initialConfig.inputMethod === TestInputMethod.DOCUMENT || initialConfig.inputMethod === TestInputMethod.SYLLABUS) {
            if (initialConfig.originalFileName) {
                setFileName(initialConfig.originalFileName);
            } else {
                 setFileName('');
            }
        } else {
            setFileName(''); 
        }
    } else { // Reset if no initialConfig (e.g. new test setup)
        setSyllabusText('');
        setTopicText('');
        setNumQuestions('');
        setIsTimedTest(false);
        setManualHours('');
        setManualMinutes('');
        setIsNegativeMarkingEnabled(false);
        setNegativeMarksPerQuestion('');
        setDifficultyLevel(3);
        setCustomInstructions(''); 
        setFileName('');
        setSelectedLanguage(DEFAULT_LANGUAGE_OPTION);
        setTitaEnabled(false);
    }
    
  }, [initialInputMethod, initialConfig, isRetakeMode]);


  const isPdfDocumentUpload = (initialInputMethod === TestInputMethod.DOCUMENT && (documentFile?.type === SUPPORTED_PDF_MIME_TYPE || initialConfig?.mimeType === SUPPORTED_PDF_MIME_TYPE)) && !isRetakeMode;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'syllabus') => {
    if (isRetakeMode) return; 

    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
        if (type === 'document') setDocumentFile(null); 
        setFileName('');
        return;
      }
      
      const isSupportedDocumentType = SUPPORTED_IMAGE_TYPES.includes(file.type) || 
                                      SUPPORTED_TEXT_TYPES.includes(file.type) || 
                                      file.type === SUPPORTED_PDF_MIME_TYPE;

      const isSupportedSyllabusType = SUPPORTED_TEXT_TYPES.includes(file.type) || 
                                      file.type === SUPPORTED_PDF_MIME_TYPE ||
                                      SUPPORTED_IMAGE_TYPES.includes(file.type);

      const isSupportedType = 
        (type === 'document' && isSupportedDocumentType) ||
        (type === 'syllabus' && isSupportedSyllabusType);

      if (!isSupportedType) {
        setError(`Unsupported file type for ${type} input. Supported: ${type === 'document' ? 'PDF, TXT, PNG, JPG, WEBP' : 'TXT, PDF, Images'}.`);
        if (type === 'document') setDocumentFile(null); 
        setFileName('');
        return;
      }
      
      setError(null);
      if (type === 'document') {
        setDocumentFile(file); 
        setFileName(file.name);
        if (file.type !== SUPPORTED_PDF_MIME_TYPE) { 
            setSelectedLanguage(DEFAULT_LANGUAGE_OPTION);
        }
      } else if (type === 'syllabus') {
        setFileName(file.name); 
        setDocumentFile(null); 
        
        if (SUPPORTED_TEXT_TYPES.includes(file.type)) {
          setSelectedLanguage(DEFAULT_LANGUAGE_OPTION); 
          const reader = new FileReader();
          reader.onload = (e) => {
            setSyllabusText(e.target?.result as string);
          };
          reader.readAsText(file);
        } else if (file.type === SUPPORTED_PDF_MIME_TYPE || SUPPORTED_IMAGE_TYPES.includes(file.type)) {
          setSelectedLanguage(DEFAULT_LANGUAGE_OPTION);
          setSyllabusLoading(true);
          const fileTypeName = file.type.startsWith('image') ? 'image' : 'PDF';
          setSyllabusText(`Extracting text from ${fileTypeName}...`);
          try {
            const base64Data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const extractedText = await extractTextFromInlineData(base64Data, file.type);
            setSyllabusText(extractedText);
            if (!extractedText.trim()) {
              setError(`Could not extract any text from the syllabus ${fileTypeName}. Please try a different file or paste the text manually.`);
              setSyllabusText(""); 
            }
          } catch (err) {
            console.error(`Error extracting text from syllabus ${fileTypeName}:`, err);
            setError(err instanceof Error ? `Error extracting from ${fileTypeName}: ${err.message}` : `Failed to extract text from ${fileTypeName}.`);
            setSyllabusText(""); 
          } finally {
            setSyllabusLoading(false);
          }
        }
      }
    } else { 
        if (type === 'document') {
            setDocumentFile(null);
            setFileName('');
            setSelectedLanguage(DEFAULT_LANGUAGE_OPTION);
        }
         if (type === 'syllabus' && !syllabusText) { 
            setFileName('');
        }
    }
  };

  const handleRemoveDocumentFile = () => {
    if (isRetakeMode) return;
    setDocumentFile(null); 
    setFileName(''); 
    setError(null);
    setSelectedLanguage(DEFAULT_LANGUAGE_OPTION);
    const fileInput = document.getElementById('documentFile-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveSyllabusFile = () => {
    if (isRetakeMode) return;
    setSyllabusText('');
    setFileName('');
    setError(null);
    const syllabusFileInput = document.getElementById('syllabusFile') as HTMLInputElement;
    if (syllabusFileInput) {
      syllabusFileInput.value = '';
    }
  };
  
  const getFileIcon = () => {
    const fileToConsider = documentFile; 
    let typeToConsider = fileToConsider ? fileToConsider.type : initialConfig?.mimeType;

    if (initialInputMethod === TestInputMethod.SYLLABUS && fileName) {
        const lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith('.pdf')) {
            return <DocumentTextIcon className="w-10 h-10 text-red-500" />;
        }
        if (lowerFileName.endsWith('.txt')) {
            return <DocumentTextIcon className="w-10 h-10 text-blue-500" />;
        }
        if (lowerFileName.endsWith('.png') || lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg') || lowerFileName.endsWith('.webp')) {
            return <PhotoIcon className="w-10 h-10 text-green-500" />;
        }
    }

    if (!typeToConsider && !fileName) return null;

    if (typeToConsider === SUPPORTED_PDF_MIME_TYPE) {
      return <DocumentTextIcon className="w-10 h-10 text-red-500" />;
    }
    if (typeToConsider && SUPPORTED_TEXT_TYPES.includes(typeToConsider)) {
      return <DocumentTextIcon className="w-10 h-10 text-blue-500" />;
    }
    if (typeToConsider && SUPPORTED_IMAGE_TYPES.includes(typeToConsider)) {
      return <PhotoIcon className="w-10 h-10 text-green-500" />;
    }
    return <DocumentTextIcon className="w-10 h-10 text-muted-foreground" />;
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    let contentToSubmit = '';
    let mimeTypeToSubmit: string | undefined = undefined;
    let originalFileNameToSubmit: string | undefined = fileName || undefined;
    let numQuestionsToSubmit: number;

    if (isRetakeMode && initialConfig) {
      contentToSubmit = initialConfig.content;
      mimeTypeToSubmit = initialConfig.mimeType;
      originalFileNameToSubmit = initialConfig.originalFileName;
      numQuestionsToSubmit = initialConfig.numQuestions;
    } else {
      if (initialInputMethod === TestInputMethod.DOCUMENT) {
          numQuestionsToSubmit = NUM_QUESTIONS_AI_DECIDES;
      } else {
          if (numQuestions.trim() === '') {
              setError(`Number of questions is required. Please enter a value between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}.`);
              return;
          }
          const parsedNQ = parseInt(numQuestions);
          if (isNaN(parsedNQ) || parsedNQ < MIN_QUESTIONS || parsedNQ > MAX_QUESTIONS) {
              setError(`Number of questions must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}.`);
              return;
          }
          numQuestionsToSubmit = parsedNQ;
      }

      try {
        if (initialInputMethod === TestInputMethod.DOCUMENT) {
          if (documentFile) { 
            mimeTypeToSubmit = documentFile.type;
            originalFileNameToSubmit = documentFile.name; 
            if (SUPPORTED_IMAGE_TYPES.includes(documentFile.type) || documentFile.type === SUPPORTED_PDF_MIME_TYPE) {
              contentToSubmit = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]); 
                reader.onerror = reject;
                reader.readAsDataURL(documentFile);
              });
            } else if (SUPPORTED_TEXT_TYPES.includes(documentFile.type)) {
              contentToSubmit = await documentFile.text();
            } else {
               setError('Unsupported file type for document input. Please use PDF, TXT, PNG, JPG, or WEBP.');
               return;
            }
          } else if (initialConfig?.inputMethod === TestInputMethod.DOCUMENT && initialConfig.content) {
            contentToSubmit = initialConfig.content;
            mimeTypeToSubmit = initialConfig.mimeType;
            originalFileNameToSubmit = initialConfig.originalFileName; 
          } else {
            setError('Please upload a document, PDF, or image file.');
            return;
          }
        } else if (initialInputMethod === TestInputMethod.SYLLABUS) {
          if (!syllabusText.trim() || syllabusLoading) {
            setError(syllabusLoading ? 'Syllabus content is still processing.' : 'Please enter or upload syllabus text/PDF/image.');
            return;
          }
          contentToSubmit = syllabusText;
            if (fileName) {
                const lowerFileName = fileName.toLowerCase();
                if (lowerFileName.endsWith('.pdf')) mimeTypeToSubmit = SUPPORTED_PDF_MIME_TYPE;
                else if (lowerFileName.endsWith('.txt')) mimeTypeToSubmit = 'text/plain';
                else if (lowerFileName.endsWith('.png')) mimeTypeToSubmit = 'image/png';
                else if (lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg')) mimeTypeToSubmit = 'image/jpeg';
                else if (lowerFileName.endsWith('.webp')) mimeTypeToSubmit = 'image/webp';
            }
          originalFileNameToSubmit = fileName || initialConfig?.originalFileName;
        } else if (initialInputMethod === TestInputMethod.TOPIC) {
          if (!topicText.trim()) {
            setError('Please enter topics or keywords.');
            return;
          }
          contentToSubmit = topicText;
        }
      } catch (err) {
        console.error("Error preparing test data:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred during content preparation.");
        return;
      }
    }


    let timeSettingsValue: TimeSettings;
    if (isTimedTest) {
      const h = parseInt(manualHours) || 0;
      const m = parseInt(manualMinutes) || 0;

      if (manualHours.trim() === '' && manualMinutes.trim() === '' && (h === 0 && m === 0)) {
           setError('For a timed test, please specify a duration for hours or minutes (e.g., 0 hours and 30 minutes).');
           return;
      }
      const totalSeconds = h * 3600 + m * 60;
      if (totalSeconds <= 0) {
          setError('Timed test duration must be greater than 0 seconds.');
          return;
      }
      timeSettingsValue = { type: 'timed', totalSeconds };
    } else {
      timeSettingsValue = { type: 'untimed' };
    }

    let negativeMarkingSettingsValue: NegativeMarkingSettings;
    if (isNegativeMarkingEnabled) {
      if (negativeMarksPerQuestion.trim() === '') {
          setError(`Negative marks per question is required when enabled. Please enter a value (e.g., ${DEFAULT_NEGATIVE_MARKS}).`);
          return;
      }
      const parsedNM = parseFloat(negativeMarksPerQuestion);
      if (isNaN(parsedNM) || parsedNM < MIN_NEGATIVE_MARKS) {
          setError(`Negative marks per question must be a number and at least ${MIN_NEGATIVE_MARKS}.`);
          return;
      }
      negativeMarkingSettingsValue = { enabled: true, marksPerQuestion: parsedNM };
    } else {
      negativeMarkingSettingsValue = { enabled: false, marksPerQuestion: 0 };
    }
    
    const langToPass = isRetakeMode && initialConfig ? initialConfig.selectedLanguage : 
                       ((initialInputMethod === TestInputMethod.DOCUMENT && (documentFile?.type === SUPPORTED_PDF_MIME_TYPE || initialConfig?.mimeType === SUPPORTED_PDF_MIME_TYPE))
                       ? selectedLanguage 
                       : undefined);
    
    const difficultyToPass = isRetakeMode && initialConfig ? initialConfig.difficultyLevel :
                             ((initialInputMethod === TestInputMethod.SYLLABUS || initialInputMethod === TestInputMethod.TOPIC)
                             ? difficultyLevel
                             : undefined);
    
    const instructionsToPass = isRetakeMode && initialConfig ? initialConfig.customInstructions :
                               ((initialInputMethod === TestInputMethod.SYLLABUS || initialInputMethod === TestInputMethod.TOPIC)
                             ? customInstructions.trim() || undefined
                             : undefined);

    onStartGenerationProcess(
      isRetakeMode && initialConfig ? initialConfig.inputMethod : initialInputMethod, 
      contentToSubmit, 
      numQuestionsToSubmit, 
      timeSettingsValue, 
      negativeMarkingSettingsValue, 
      mimeTypeToSubmit, 
      originalFileNameToSubmit,
      langToPass,
      difficultyToPass,
      instructionsToPass,
      titaEnabled // Pass the new flag
    );
  };

  const displayFileName = fileName || 
                        (initialConfig?.inputMethod === TestInputMethod.DOCUMENT ? initialConfig?.originalFileName : 
                         (initialConfig?.inputMethod === TestInputMethod.SYLLABUS ? initialConfig?.originalFileName : ''));

  const displayFileSize = documentFile ? (documentFile.size / 1024 / 1024).toFixed(2) + " MB" : 
                        (initialConfig?.inputMethod === TestInputMethod.DOCUMENT && initialConfig.mimeType ? "Loaded" : 
                         (initialConfig?.inputMethod === TestInputMethod.SYLLABUS && initialConfig?.originalFileName ? "Loaded" : ""));


    const getDisplayFileType = () => {
        if (documentFile) return documentFile.type;
        if (initialInputMethod === TestInputMethod.DOCUMENT && initialConfig?.mimeType) return initialConfig.mimeType;
        if (initialInputMethod === TestInputMethod.SYLLABUS && fileName) {
            const lowerFileName = fileName.toLowerCase();
            if (lowerFileName.endsWith('.pdf')) return SUPPORTED_PDF_MIME_TYPE;
            if (lowerFileName.endsWith('.txt')) return 'text/plain';
            if (lowerFileName.endsWith('.png')) return 'image/png';
            if (lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg')) return 'image/jpeg';
            if (lowerFileName.endsWith('.webp')) return 'image/webp';
        }
        if (initialInputMethod === TestInputMethod.SYLLABUS && initialConfig?.mimeType) return initialConfig.mimeType;
        return "";
    };
    const displayFileType = getDisplayFileType();

  const handleTimedTestToggle = () => {
    const newIsTimedTest = !isTimedTest;
    setIsTimedTest(newIsTimedTest);
    if (!newIsTimedTest) { 
      setManualHours(''); 
      setManualMinutes(''); 
    }
  };

  const handleNegativeMarkingToggle = () => {
    const newIsEnabled = !isNegativeMarkingEnabled;
    setIsNegativeMarkingEnabled(newIsEnabled);
    if (!newIsEnabled) { 
      setNegativeMarksPerQuestion(''); 
    }
  };

  const formTitle = getInputMethodLabel(initialConfig?.inputMethod || initialInputMethod, isRetakeMode);
  const submitButtonText = isRetakeMode ? "Confirm Retake Settings" : "Generate Test & Confirm";

  const formInputStyle = "block w-full rounded-md border-input bg-background shadow-sm focus:border-primary focus:ring-0 sm:text-sm p-2 disabled:opacity-70 disabled:bg-muted/50";
  const formSelectStyle = `${formInputStyle} pr-8`;
  const formTextareaStyle = `${formInputStyle} resize-y`;
  const formLabelStyle = "block text-sm font-medium text-foreground";

  return (
    <form id="test-setup-form" onSubmit={handleSubmit} className="space-y-10 p-4 sm:p-6 md:p-8 bg-card shadow-lg border border-border rounded-lg">
      <div className="flex flex-col items-start">
        <div className="mb-4">
            <Button 
                type="button" 
                onClick={onBackToHome} 
                variant="outline" 
                size="sm" 
                leftIcon={<ChevronLeftIcon className="w-4 h-4" />}
            >
                Back to Home
            </Button>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          {formTitle}
        </h2>
        {isRetakeMode && initialConfig && (
            <p className="text-sm text-muted-foreground mt-1">
                Original test: "{initialConfig.testName}". Questions and core content settings are locked. You can adjust time and negative marking.
            </p>
        )}
      </div>
      
      {error && <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">{error}</div>}
      
      {/* Content Input Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Content Input</h3>
          {initialInputMethod === TestInputMethod.TOPIC && (
            <div>
              <label htmlFor="topicText" className={formLabelStyle}>Enter Topics/Keywords (comma-separated):</label>
              <textarea
                id="topicText"
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
                rows={4}
                className={`mt-1 ${formTextareaStyle}`}
                placeholder="e.g., React Hooks, State Management, Photosynthesis"
                aria-required="true"
                disabled={isRetakeMode}
              />
            </div>
          )}

          {initialInputMethod === TestInputMethod.SYLLABUS && (
            <div>
              <label htmlFor="syllabusText" className={formLabelStyle}>Paste Syllabus or Text Content:</label>
              <textarea
                id="syllabusText"
                value={syllabusText}
                onChange={(e) => {
                    setSyllabusText(e.target.value);
                    if (fileName) setFileName(''); 
                }}
                rows={8}
                className={`mt-1 ${formTextareaStyle}`}
                placeholder="Paste your syllabus here, or text from a DOCX file. You can also upload a TXT, PDF or Image file below."
                aria-required="true"
                disabled={syllabusLoading || isRetakeMode}
              />
              <div className="mt-4 text-sm text-muted-foreground">
                Alternatively, upload a .txt, .pdf, or image file for syllabus:
                {syllabusLoading && <span className="italic ml-2 text-primary">Processing...</span>}
              </div>
              <input
                type="file"
                id="syllabusFile"
                accept=".txt,.pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => handleFileChange(e, 'syllabus')}
                className="mt-1 block w-full text-sm text-muted-foreground focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-70"
                disabled={syllabusLoading || isRetakeMode}
              />
               {fileName && initialInputMethod === TestInputMethod.SYLLABUS && (
                 <div className="mt-2 p-3 border border-border rounded-md bg-muted/50">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">{getFileIcon()}</div>
                        <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium text-foreground truncate" title={displayFileName}>
                            {displayFileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Type: {displayFileType || "N/A"}
                        </p>
                        </div>
                        {!isRetakeMode && (
                            <Button
                            type="button" variant="ghost" size="sm" onClick={handleRemoveSyllabusFile}
                            aria-label="Remove syllabus file"
                            className="text-destructive hover:bg-destructive/10"
                            leftIcon={<XCircleIcon className="w-4 h-4" />}
                            >
                            Remove
                            </Button>
                        )}
                    </div>
                 </div>
               )}
            </div>
          )}

          {initialInputMethod === TestInputMethod.DOCUMENT && (
            <div>
              <label htmlFor="documentFile-input" className={`${formLabelStyle} mb-1`}>
                {displayFileName ? "Uploaded File:" : "Upload Document (.pdf, .txt) or Image (.png, .jpg, .webp):"}
              </label>
              {!displayFileName && !documentFile && !isRetakeMode ? ( 
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <label
                        htmlFor="documentFile-input"
                        className="relative cursor-pointer rounded-md bg-card font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                      >
                        <span>Upload a file</span>
                        <input id="documentFile-input" name="documentFile-input" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'document')} accept=".txt,.png,.jpg,.jpeg,.webp,.pdf" aria-required={!initialConfig?.content} disabled={isRetakeMode} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground/80">PDF, TXT, PNG, JPG, WEBP up to {MAX_FILE_SIZE_MB}MB</p>
                  </div>
                </div>
              ) : ( (displayFileName || documentFile || (isRetakeMode && initialConfig?.originalFileName)) &&
                <div className="mt-2 p-4 border border-border rounded-md bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">{getFileIcon()}</div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={displayFileName}>{displayFileName}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: {displayFileType || "N/A"}, Size: {displayFileSize || "N/A"}
                      </p>
                    </div>
                    {!isRetakeMode && (
                        <Button
                        type="button" variant="ghost" size="sm" onClick={handleRemoveDocumentFile}
                        aria-label="Remove file"
                        className="text-destructive hover:bg-destructive/10"
                        leftIcon={<XCircleIcon className="w-4 h-4" />}
                        >
                        Remove
                        </Button>
                    )}
                  </div>
                </div>
              )}
              {(isPdfDocumentUpload || (initialConfig?.inputMethod === TestInputMethod.DOCUMENT && initialConfig.mimeType === SUPPORTED_PDF_MIME_TYPE)) && (displayFileName || documentFile || (isRetakeMode && initialConfig?.mimeType === SUPPORTED_PDF_MIME_TYPE)) && ( 
                <div className="mt-4">
                  <label htmlFor="languageSelect" className={formLabelStyle}>Select Language for PDF Content:</label>
                  <select
                    id="languageSelect"
                    name="languageSelect"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as LanguageOption)}
                    className={`mt-1 max-w-xs ${formSelectStyle}`}
                    disabled={isRetakeMode}
                  >
                    <option value={LanguageOption.ENGLISH}>English</option>
                    <option value={LanguageOption.HINDI}>Hindi</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">AI will try to generate questions only in the selected language from PDF.</p>
                </div>
              )}
            </div>
          )}
      </div>

       {/* Question Settings Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Question Settings</h3>
        {initialInputMethod !== TestInputMethod.DOCUMENT && (
            <div>
            <label htmlFor="numQuestions" className={formLabelStyle}>Number of Questions ({MIN_QUESTIONS} - {MAX_QUESTIONS}):</label>
            <input
                type="number" id="numQuestions" value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                min={MIN_QUESTIONS} max={MAX_QUESTIONS} placeholder={`e.g., ${DEFAULT_NUM_QUESTIONS}`}
                className={`mt-1 max-w-xs ${formInputStyle}`}
                aria-describedby="numQuestionsHelp" disabled={isRetakeMode}
            />
            <p id="numQuestionsHelp" className="mt-1 text-xs text-muted-foreground">Field is required.</p>
            </div>
        )}
        {initialInputMethod === TestInputMethod.DOCUMENT && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                <p className="text-sm text-primary">
                    The number of questions will be automatically determined from the document content
                    {((isPdfDocumentUpload || (initialConfig?.mimeType === SUPPORTED_PDF_MIME_TYPE && initialInputMethod === TestInputMethod.DOCUMENT))) && !isRetakeMode ? ` in the selected language.` : 
                    (isRetakeMode && initialConfig?.mimeType === SUPPORTED_PDF_MIME_TYPE ? ` in ${initialConfig.selectedLanguage}.` : '.')}
                </p>
            </div>
        )}

        {(initialInputMethod === TestInputMethod.SYLLABUS || initialInputMethod === TestInputMethod.TOPIC) && (
            <>
            <div>
              <label htmlFor="difficultyLevel" className={formLabelStyle}>Difficulty Level</label>
              <select
                id="difficultyLevel"
                name="difficultyLevel"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(parseInt(e.target.value, 10))}
                className={`mt-1 max-w-xs ${formSelectStyle}`}
                disabled={isRetakeMode}
              >
                {Object.entries(difficultyLevelMap).map(([level, name]) => (
                  <option key={level} value={level}>
                    Level {level}: {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
                <label htmlFor="customInstructions" className={formLabelStyle}>Custom Instructions for AI (Optional):</label>
                <textarea
                id="customInstructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3} className={`mt-1 ${formTextareaStyle}`}
                placeholder="e.g., Focus on conceptual questions, include questions about specific sub-topics..."
                aria-describedby="customInstructionsHelp" disabled={isRetakeMode}
                />
                <p id="customInstructionsHelp" className="mt-1 text-xs text-muted-foreground">Provide specific guidelines for the AI on how to design the questions.</p>
            </div>
            </>
        )}
      </div>

       {/* Test Configuration Section */}
      <div className="space-y-8">
        <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Test Configuration</h3>
        <div>
            <label className={`${formLabelStyle} mb-2`}>Timer Settings:</label>
            <div className="flex items-center space-x-3">
                <label htmlFor="isTimedTestToggle" className="flex items-center cursor-pointer focus-within:outline-none">
                    <div className="relative">
                    <input type="checkbox" id="isTimedTestToggle" className="sr-only" checked={isTimedTest} onChange={handleTimedTestToggle} aria-describedby="timerStatusMessage" />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${isTimedTest ? 'bg-primary' : 'bg-muted'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isTimedTest ? 'translate-x-full' : ''}`}></div>
                    </div>
                    <span id="timerStatusMessage" className="ml-3 text-sm text-foreground">{isTimedTest ? "Timer Enabled" : "Timer Disabled (Untimed Test)"}</span>
                </label>
            </div>
            {isTimedTest && (
            <div className="mt-3 grid grid-cols-2 gap-4 max-w-sm">
                <div>
                    <label htmlFor="manualHours" className="text-xs text-muted-foreground">Hours:</label>
                    <input type="number" id="manualHours" value={manualHours} min="0" onChange={(e) => setManualHours(e.target.value)} placeholder="0" className={`mt-1 ${formInputStyle}`} />
                </div>
                <div>
                    <label htmlFor="manualMinutes" className="text-xs text-muted-foreground">Minutes:</label>
                    <input type="number" id="manualMinutes" value={manualMinutes} min="0" max="59" onChange={(e) => setManualMinutes(e.target.value)} placeholder="00" className={`mt-1 ${formInputStyle}`} />
                </div>
            </div>
            )}
        </div>

        <div>
            <label className={`${formLabelStyle} mb-2`}>Negative Marking:</label>
            <div className="flex items-center space-x-3 mb-3">
            <label htmlFor="isNegativeMarkingEnabledToggle" className="flex items-center cursor-pointer focus-within:outline-none">
                <div className="relative">
                <input type="checkbox" id="isNegativeMarkingEnabledToggle" className="sr-only" checked={isNegativeMarkingEnabled} onChange={handleNegativeMarkingToggle} aria-describedby="negativeMarkingStatusMessage" />
                <div className={`block w-10 h-6 rounded-full transition-colors ${isNegativeMarkingEnabled ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isNegativeMarkingEnabled ? 'translate-x-full' : ''}`}></div>
                </div>
                <span id="negativeMarkingStatusMessage" className="ml-3 text-sm text-foreground">{isNegativeMarkingEnabled ? "Negative Marking Enabled" : "Negative Marking Disabled"}</span>
            </label>
            </div>
            {isNegativeMarkingEnabled && (
            <div>
                <label htmlFor="negativeMarksPerQuestion" className="text-xs text-muted-foreground">Marks deducted per incorrect answer:</label>
                <input
                type="number" id="negativeMarksPerQuestion" value={negativeMarksPerQuestion} min={MIN_NEGATIVE_MARKS.toString()} step="0.01" onChange={(e) => setNegativeMarksPerQuestion(e.target.value)}
                placeholder={`e.g., ${DEFAULT_NEGATIVE_MARKS}`} className={`mt-1 max-w-xs ${formInputStyle}`} aria-describedby="negativeMarksHelp"
                />
                <p id="negativeMarksHelp" className="mt-1 text-xs text-muted-foreground">Minimum {MIN_NEGATIVE_MARKS}. Field is required if enabled.</p>
            </div>
            )}
        </div>
      </div>

      {((initialInputMethod === TestInputMethod.SYLLABUS || initialInputMethod === TestInputMethod.TOPIC)) && (
        <div>
          <label className={formLabelStyle + ' mb-2'}>Enable TITA Questions:</label>
          <div className="flex items-center space-x-3 mb-3">
            <label htmlFor="titaEnabledToggle" className="flex items-center cursor-pointer focus-within:outline-none">
              <div className="relative">
                <input type="checkbox" id="titaEnabledToggle" className="sr-only" checked={titaEnabled} onChange={() => setTitaEnabled(v => !v)} aria-describedby="titaStatusMessage" />
                <div className={`block w-10 h-6 rounded-full transition-colors ${titaEnabled ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${titaEnabled ? 'translate-x-full' : ''}`}></div>
              </div>
              <span id="titaStatusMessage" className="ml-3 text-sm text-foreground">{titaEnabled ? "TITA (Type In The Answer) Enabled" : "TITA Disabled (Only MCQ)"}</span>
            </label>
          </div>
        </div>
      )}


      <Button type="submit" size="lg" className="w-full mt-8" isLoading={isLoading || syllabusLoading}>
        {isLoading || syllabusLoading ? "Processing..." : submitButtonText}
      </Button>
    </form>
  );
};