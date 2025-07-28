import React from 'react';
import Button from './Button';
import { ClockIcon } from './Icons';

interface ResumeTestBannerProps {
  onResume: () => void;
  onCancel: () => void;
  testName: string;
}

export const ResumeTestBanner: React.FC<ResumeTestBannerProps> = ({ onResume, onCancel, testName }) => {
  return (
    <div className="bg-primary/10 border-b-2 border-primary/20 p-3 w-full shadow-lg">
      <div className="container mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <ClockIcon className="w-6 h-6 text-primary animate-pulse flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-primary">You have a test in progress!</h3>
            <p className="text-sm text-primary/80 truncate" title={testName}>
              "{testName}"
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <Button onClick={onCancel} variant="outline" size="sm">
                Cancel
            </Button>
            <Button onClick={onResume} variant="default" size="sm">
                Resume Test
            </Button>
        </div>
      </div>
    </div>
  );
};