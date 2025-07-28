import React, { useState } from 'react';
import { Question } from '../types';
import QuestionView from './QuestionView';
import Sidebar from './Sidebar';
import Timer from './Timer';
import Button from './Button';
import { ChevronLeftIcon, ChevronRightIcon, MenuIcon, XIcon } from './Icons'; 

interface TestInterfaceProps {
  questions: Question[];
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  onSelectMcqOption: (questionIndex: number, optionIndex: number) => void;
  onInputTitaAnswer: (questionIndex: number, answerText: string) => void;
  onNavigateQuestion: (index: number) => void;
  onSubmitTest: () => void;
  onMarkForReview: (questionIndex: number) => void;
  onClearSelection: (questionIndex: number) => void;
  onSaveAndExit?: () => void;
}

const TestInterface: React.FC<TestInterfaceProps> = ({
  questions,
  currentQuestionIndex,
  timeRemainingSeconds,
  onSelectMcqOption,
  onInputTitaAnswer,
  onNavigateQuestion,
  onSubmitTest,
  onMarkForReview,
  onClearSelection,
  onSaveAndExit,
}) => {
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      onNavigateQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      onNavigateQuestion(currentQuestionIndex + 1);
    }
  };

  const toggleMobilePalette = () => setIsMobilePaletteOpen(!isMobilePaletteOpen);

  const navigateAndClosePalette = (index: number) => {
    onNavigateQuestion(index);
    setIsMobilePaletteOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4.5rem)] bg-secondary">

      <div className="flex-1 flex flex-col overflow-hidden">
        
        <main className="flex-1 overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-secondary border-b border-border">
                <div className="max-w-4xl mx-auto p-4 md:px-6">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                    <Timer timeRemainingSeconds={timeRemainingSeconds} />
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button onClick={onSubmitTest} variant="destructive" size="sm">
                            Submit Test
                        </Button>
                        <div className="md:hidden">
                        <Button 
                            onClick={toggleMobilePalette} 
                            variant="ghost" 
                            size="icon" 
                            aria-label="Toggle question palette"
                            title="Toggle question palette"
                        >
                            <MenuIcon className="w-5 h-5" />
                        </Button>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="max-w-4xl mx-auto p-4 md:p-6">
              {currentQuestion && (
              <QuestionView
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  onAnswerSelect={(optionIndex) => onSelectMcqOption(currentQuestionIndex, optionIndex)}
                  onAnswerInput={(answerText) => onInputTitaAnswer(currentQuestionIndex, answerText)}
              />
              )}
          </div>
        </main>
        
        <footer className="w-full border-t border-border bg-card shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center">
              <Button 
                onClick={handlePrev} 
                disabled={currentQuestionIndex === 0}
                leftIcon={<ChevronLeftIcon className="w-5 h-5" />}
                variant="outline"
              >
                Previous
              </Button>
              
              <div className="mt-4 pt-4 border-t border-border flex justify-center items-center flex-wrap gap-2 md:border-none md:pt-0 md:mt-0">
                <Button onClick={() => onClearSelection(currentQuestionIndex)} disabled={currentQuestion?.userAnswerIndex === undefined && !currentQuestion?.userAnswerText} variant="secondary">
                    Clear Response
                </Button>
                <Button 
                  onClick={() => onMarkForReview(currentQuestionIndex)} 
                  variant="outline" 
                  className={currentQuestion?.isMarkedForReview 
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400 dark:border-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
                    : ''
                  }
                >
                    {currentQuestion?.isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}
                </Button>
              </div>

              <Button 
                onClick={handleNext} 
                disabled={currentQuestionIndex === questions.length - 1}
                rightIcon={<ChevronRightIcon className="w-5 h-5" />}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </footer>
      </div>
      
      <aside className="hidden md:block md:w-72 lg:w-80 border-l border-border h-full overflow-y-auto bg-card">
         <Sidebar
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            onNavigate={onNavigateQuestion}
            onSaveAndExit={onSaveAndExit}
          />
      </aside>

      {isMobilePaletteOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden" 
          onClick={toggleMobilePalette} 
          aria-hidden="true"
        ></div>
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-card shadow-xl z-40 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col
                    ${isMobilePaletteOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-palette-title"
      >
        <div className="p-4 flex justify-between items-center border-b border-border">
            <h3 id="mobile-palette-title" className="text-lg font-semibold text-foreground">Questions</h3>
            <Button 
                onClick={toggleMobilePalette} 
                variant="ghost" 
                size="icon" 
                aria-label="Close question palette"
                title="Close question palette"
            >
                <XIcon className="w-5 h-5" />
            </Button>
        </div>
        <div className="flex-grow overflow-y-auto">
            <Sidebar
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                onNavigate={navigateAndClosePalette}
                onSaveAndExit={onSaveAndExit}
            />
        </div>
      </div>
    </div>
  );
};

export default TestInterface;