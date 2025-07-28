import React from 'react';
import { TestInputMethod } from '../types';
import { DocumentTextIcon, BookOpenIcon, LightBulbIcon, ChevronRightIcon } from './Icons';
import { APP_NAME } from '../constants';
import Button from './Button'; 

interface HomeViewProps {
  onNavigateToSetup: (method: TestInputMethod) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateToSetup }) => {
  const buttonOptions = [
    { 
      method: TestInputMethod.DOCUMENT, 
      label: "Extract from Document", 
      description: "PDF, Image, or TXT file",
      icon: <DocumentTextIcon className="w-6 h-6" />
    },
    { 
      method: TestInputMethod.SYLLABUS, 
      label: "Generate from Syllabus", 
      description: "Paste text or upload PDF/TXT",
      icon: <BookOpenIcon className="w-6 h-6" />
    },
    { 
      method: TestInputMethod.TOPIC, 
      label: "Generate from Topic(s)", 
      description: "Provide keywords or subjects",
      icon: <LightBulbIcon className="w-6 h-6" />
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background relative">
      <div className="bg-card border border-border p-8 sm:p-10 md:p-12 rounded-xl shadow-2xl w-full max-w-lg text-center">
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 py-1">
            Welcome to {APP_NAME}!
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 text-lg">
          How would you like to create your test?
        </p>
        
        <div className="space-y-4">
          {buttonOptions.map((btnInfo) => (
            <button
              key={btnInfo.method}
              onClick={() => onNavigateToSetup(btnInfo.method)}
              className="w-full text-left p-4 border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              aria-label={`${btnInfo.label}: ${btnInfo.description}`}
            >
              <div className="flex items-center">
                <div className="mr-4 text-primary bg-primary/10 p-2 rounded-lg">
                    {btnInfo.icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{btnInfo.label}</p>
                  <p className="text-sm text-muted-foreground">{btnInfo.description}</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 ml-auto text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>
      <footer className="absolute bottom-4 text-center w-full text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Powered by AI.
      </footer>
    </div>
  );
};