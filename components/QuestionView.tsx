import React from 'react';
import { Question } from '../types';

interface QuestionViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (optionIndex: number) => void;
  onAnswerInput: (answerText: string) => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ question, questionNumber, totalQuestions, onAnswerSelect, onAnswerInput }) => {
  if (!question) {
    return <div className="p-4 text-center text-muted-foreground">No question to display.</div>;
  }
  
  const isTITA = !question.options || question.options.length === 0;

  // Heuristic to detect "Match the Following" questions for special option layout.
  // This is based on the expectation that the AI will include "match" in the text and a <table> for formatting.
  const isMatchQuestion = !isTITA && /match/i.test(question.questionText) && /<table/i.test(question.questionText);

  return (
    <div className="p-6 bg-card border border-border shadow-lg rounded-lg">
      <h2 className="text-lg sm:text-xl font-semibold mb-1 text-foreground">
        Question {questionNumber} <span className="text-sm font-normal text-muted-foreground">of {totalQuestions}</span>
      </h2>
      
      {question.passageText && (
        <div 
          className="rendered-html-table mb-4 p-4 border border-border rounded-md bg-secondary text-secondary-foreground whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ __html: question.passageText }}
        />
      )}

      <div 
        className="rendered-html-table mb-6 text-foreground whitespace-pre-wrap leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />
      
      {isTITA ? (
        <div>
          <label htmlFor={`tita-answer-${question.id}`} className="block text-sm font-medium text-foreground mb-2">Your Answer:</label>
          <input
            id={`tita-answer-${question.id}`}
            type="text"
            value={question.userAnswerText || ''}
            onChange={(e) => onAnswerInput(e.target.value)}
            placeholder="Type your answer here..."
            className="block w-full rounded-md border-input bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3"
            aria-label="Your answer for the question"
          />
        </div>
      ) : (
        <div className={isMatchQuestion ? "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3" : "space-y-3"}>
          {question.options?.map((option, index) => (
            <label
              key={index}
              className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out has-[:checked]:ring-2 has-[:checked]:ring-primary
                          ${question.userAnswerIndex === index 
                            ? 'bg-primary/10 border-primary' 
                            : 'bg-secondary/50 border-border hover:bg-accent hover:border-primary/50'}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={question.userAnswerIndex === index}
                onChange={() => onAnswerSelect(index)}
                className="h-4 w-4 text-primary border-muted-foreground bg-card focus:ring-primary focus:ring-offset-card mr-3 mt-1" 
              />
              <span className="text-foreground align-middle whitespace-pre-wrap flex-1">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionView;