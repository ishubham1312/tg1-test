
import React, { useState } from 'react';
import { TestInputMethod, TimeSettings, NegativeMarkingSettings, LanguageOption } from '../types';
import Button from './Button';
import { ChevronLeftIcon, EditIcon } from './Icons'; 

const difficultyLevelMap: { [key: number]: string } = {
  1: 'Foundation',
  2: 'Growth',
  3: 'Proficient',
  4: 'Achiever',
  5: 'Mastery',
};

interface TestConfirmationViewProps {
  initialTestName: string;
  actualNumQuestions: number;
  timeSettings: TimeSettings;
  negativeMarking: NegativeMarkingSettings;
  inputMethod: TestInputMethod;
  originalFileName?: string;
  selectedLanguage?: LanguageOption;
  difficultyLevel?: number;
  customInstructions?: string; 
  onStartTest: (finalTestName: string) => void;
  onEditSettings: () => void;
  isLoading: boolean; 
  isRetakeMode?: boolean;
}

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds === Number.POSITIVE_INFINITY || !totalSeconds) return "Untimed";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let timeString = "";
  if (hours > 0) timeString += `${hours}h `;
  if (minutes > 0) timeString += `${minutes}m `;
  if (seconds > 0 || (hours === 0 && minutes === 0)) timeString += `${seconds}s`;
  return timeString.trim() || "0s";
};

const getInputMethodLabel = (method: TestInputMethod): string => {
  switch (method) {
    case TestInputMethod.DOCUMENT: return "Document/PDF/Image";
    case TestInputMethod.SYLLABUS: return "Syllabus/Text";
    case TestInputMethod.TOPIC: return "Topic/Keywords";
    default: return "Unknown";
  }
};

export const TestConfirmationView: React.FC<TestConfirmationViewProps> = ({ 
  initialTestName,
  actualNumQuestions,
  timeSettings,
  negativeMarking,
  inputMethod,
  originalFileName,
  selectedLanguage,
  difficultyLevel,
  customInstructions, 
  onStartTest, 
  onEditSettings,
  isLoading,
  isRetakeMode = false
}) => {
  const [editableTestName, setEditableTestName] = useState(initialTestName);

  const handleStart = () => {
    onStartTest(editableTestName || `Test from ${getInputMethodLabel(inputMethod)}`);
  };

  const DetailCard = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="p-4 bg-secondary rounded-lg border border-border">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="text-md font-semibold text-foreground truncate">{value}</div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto bg-card shadow-lg border border-border rounded-lg my-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {isRetakeMode ? "Confirm Retake" : "Confirm Test"}
        </h2>
        <Button onClick={onEditSettings} variant="outline" size="sm" leftIcon={<ChevronLeftIcon className="w-4 h-4" />}>
          Edit
        </Button>
      </div>

      {isRetakeMode && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 text-primary rounded-md">
          <p className="text-sm">
            This is a retake of a previous test. Core content settings are locked. You may have adjusted time and/or negative marking.
          </p>
        </div>
      )}

      <div className="space-y-6 mb-8">
        <div>
          <label htmlFor="testName" className="flex items-center text-sm font-medium text-foreground mb-1">
            Test Name
            <EditIcon className="w-4 h-4 ml-2 text-muted-foreground" aria-hidden="true" />
          </label>
          <input
            type="text"
            id="testName"
            value={editableTestName}
            onChange={(e) => setEditableTestName(e.target.value)}
            className="block w-full rounded-md border-input bg-background shadow-sm focus:border-primary focus:ring-0 sm:text-sm p-2"
            placeholder="Enter a name for your test"
            aria-describedby="testNameHelp"
          />
          <p id="testNameHelp" className="sr-only">You can edit the name of your test here.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailCard label="Input Method" value={getInputMethodLabel(inputMethod)} />
          {originalFileName && inputMethod === TestInputMethod.DOCUMENT && (
            <DetailCard label="Original File" value={originalFileName} />
          )}
          <DetailCard label="Questions Generated" value={`${actualNumQuestions} questions`} />
          
          {(inputMethod === TestInputMethod.SYLLABUS || inputMethod === TestInputMethod.TOPIC) && difficultyLevel && (
             <DetailCard 
                label="Difficulty Level" 
                value={difficultyLevelMap[difficultyLevel] ? `${difficultyLevelMap[difficultyLevel]} (${difficultyLevel}/5)` : `${difficultyLevel}/5`}
            />
          )}

          <DetailCard label="Time Limit" value={timeSettings.type === 'timed' ? formatTime(timeSettings.totalSeconds) : "Untimed"} />
          
          <DetailCard 
            label="Negative Marking" 
            value={negativeMarking.enabled 
              ? `Enabled (${negativeMarking.marksPerQuestion} per incorrect)` 
              : "Disabled"} 
          />
          
          {inputMethod === TestInputMethod.DOCUMENT && selectedLanguage && (
            <DetailCard label="Language for PDF" value={selectedLanguage} />
          )}
        </div>

        {customInstructions && (inputMethod === TestInputMethod.SYLLABUS || inputMethod === TestInputMethod.TOPIC) && (
           <div className="p-4 bg-secondary rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted-foreground">Custom AI Instructions</h3>
            <p className="text-md text-foreground whitespace-pre-wrap mt-1">{customInstructions}</p>
          </div>
        )}
      </div>

      <Button 
        onClick={handleStart} 
        isLoading={isLoading} 
        size="lg" 
        className="w-full"
      >
        {isLoading ? "Preparing..." : (isRetakeMode ? "Start Retake" : "Start Test")}
      </Button>
    </div>
  );
};