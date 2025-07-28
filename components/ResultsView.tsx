import React, { useState, useEffect } from 'react';
import { Question, QuestionStatus, AnswerKeyEntry, NegativeMarkingSettings, TestInputMethod } from '../types';
import Button from './Button';
import { EditIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon } from './Icons';

interface ResultsViewProps {
  questions: Question[];
  negativeMarkingSettings: NegativeMarkingSettings | null;
  onStartNewTest: () => void;
  onReviewAnswers: () => void;
  inputMethod: TestInputMethod | null;
  isHistoryViewMode?: boolean;
  onBackToHistory?: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ 
  questions: initialQuestions, 
  negativeMarkingSettings,
  onStartNewTest, 
  onReviewAnswers,
  inputMethod,
  isHistoryViewMode = false,
  onBackToHistory,
}) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [error, setError] = useState<string | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  const {
    totalQuestions,
    attemptedQuestionsCount,
    correctAnswersCount,
    incorrectAnswersDisplayCount,
    notAttemptedCount,
    finalScorePercentage,
    rawScorePercentage,
  } = React.useMemo(() => {
    const total = initialQuestions.length;
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;

    initialQuestions.forEach(q => {
      const isAttempted = q.status === QuestionStatus.ATTEMPTED;
      if (isAttempted) {
        attempted++;
        const isMCQ = q.options && q.options.length > 0;
        let isCorrect = false;
        if (isMCQ) {
          isCorrect = q.userAnswerIndex === q.correctAnswerIndex;
        } else {
          isCorrect = q.userAnswerText?.trim().toLowerCase() === q.correctAnswerText?.trim().toLowerCase();
        }
        
        if(isCorrect) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const notAttempted = total - attempted;
    const rawScore = total > 0 ? (correct / total) * 100 : 0;
    
    let finalScore = rawScore;
    if (negativeMarkingSettings?.enabled && total > 0) {
      const penalty = incorrect * negativeMarkingSettings.marksPerQuestion;
      const marksObtained = correct - penalty;
      finalScore = (marksObtained / total) * 100;
      finalScore = Math.max(0, finalScore);
    }

    return {
      totalQuestions: total,
      attemptedQuestionsCount: attempted,
      correctAnswersCount: correct,
      incorrectAnswersDisplayCount: incorrect,
      notAttemptedCount: notAttempted,
      finalScorePercentage: finalScore,
      rawScorePercentage: rawScore,
    };
  }, [initialQuestions, negativeMarkingSettings]);


  useEffect(() => {
    const animation = requestAnimationFrame(() => {
        setAnimatedScore(finalScorePercentage);
    });
    return () => cancelAnimationFrame(animation);
  }, [finalScorePercentage]);

  const handleAnswerKeyUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      if (file.type !== 'application/json') {
        setError('Invalid file type. Please upload a JSON file for the answer key.');
        return;
      }
      try {
        const fileContent = await file.text();
        const parsedKey = JSON.parse(fileContent) as AnswerKeyEntry[];
        if (!Array.isArray(parsedKey) || !parsedKey.every(entry => typeof entry.questionIndex === 'number' && typeof entry.correctAnswerIndex === 'number')) {
          setError('Invalid answer key format. Expected an array of {questionIndex: number, correctAnswerIndex: number}.');
          return;
        }

        setQuestions(prevQs => {
          const updatedQs = [...prevQs];
          parsedKey.forEach(keyEntry => {
            if (updatedQs[keyEntry.questionIndex]) {
              updatedQs[keyEntry.questionIndex].correctAnswerIndex = keyEntry.correctAnswerIndex;
              updatedQs[keyEntry.questionIndex].explanation = undefined; 
            }
          });
          return updatedQs;
        });
        alert('Answer key applied successfully! Scores and review details have been updated.');

      } catch (err) {
        console.error("Error processing answer key:", err);
        setError("Failed to process answer key. Ensure it's a valid JSON file.");
      } finally {
        event.target.value = ''; 
      }
    }
  };
  
  const StatCard = ({ icon, label, value, colorClass }: { icon: React.ReactNode, label: string, value: string | number, colorClass: string }) => (
    <div className={`p-4 bg-card border-l-4 rounded-r-lg shadow-sm ${colorClass}`}>
        <div className="flex items-center">
            <div className="mr-3">{icon}</div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto bg-background my-8">
      <div className="bg-card border border-border p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Test Results</h2>
        
        {error && <div className="p-3 mb-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-secondary"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="2.5" />
                    <path className="text-primary"
                        strokeDasharray={`${animatedScore}, 100`}
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        style={{transition: 'stroke-dasharray 0.5s ease-in-out'}}/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl sm:text-5xl font-bold text-foreground" aria-live="polite">
                        {finalScorePercentage.toFixed(1)}<span className="text-2xl sm:text-3xl">%</span>
                    </span>
                    <p className="text-sm text-muted-foreground">Final Score</p>
                </div>
            </div>

            <div className="space-y-4">
                <StatCard icon={<CheckCircleIcon className="w-8 h-8 text-green-500"/>} label="Correct" value={correctAnswersCount} colorClass="border-green-500" />
                <StatCard icon={<XCircleIcon className="w-8 h-8 text-red-500"/>} label="Incorrect" value={incorrectAnswersDisplayCount} colorClass="border-red-500" />
                <StatCard icon={<MinusCircleIcon className="w-8 h-8 text-yellow-500"/>} label="Not Attempted" value={notAttemptedCount} colorClass="border-yellow-500" />
            </div>
        </div>

        {negativeMarkingSettings?.enabled && totalQuestions > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-6">
                (Raw score: {rawScorePercentage.toFixed(1)}%. Negative marking applied: {negativeMarkingSettings.marksPerQuestion} per incorrect.)
            </p>
        )}
        
        {inputMethod === TestInputMethod.DOCUMENT && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Official Answer Key (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              If you have a JSON answer key from the source document, upload it here to re-score your test.
            </p>
            <input
              type="file" id="answerKeyUpload" aria-label="Upload official answer key" accept=".json" onChange={handleAnswerKeyUpload}
              className="block w-full text-sm text-muted-foreground focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
          <Button onClick={onReviewAnswers} variant="default" size="lg" leftIcon={<EditIcon className="w-5 h-5"/>}>
            Review Answers & Explanations
          </Button>
          {isHistoryViewMode && onBackToHistory ? (
            <Button onClick={onBackToHistory} variant="secondary" size="lg">
              Back to History
            </Button>
          ) : (
            <Button onClick={onStartNewTest} variant="secondary" size="lg">
              Start New Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsView;