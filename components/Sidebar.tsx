import React from 'react';
import { Question, QuestionStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon } from './Icons';

interface SidebarProps {
  questions: Question[];
  currentQuestionIndex: number;
  onNavigate: (index: number) => void;
  reviewMode?: boolean;
  onSaveAndExit?: () => void;
}

const getReviewStatusStylesAndIcon = (question: Question) => {
    let styles = '';
    let icon = null;
    let textColorClass = 'text-foreground';

    const isAttempted = typeof question.userAnswerIndex === 'number';
    const isCorrect = isAttempted && question.userAnswerIndex === question.correctAnswerIndex;

    if (isAttempted) {
        if (isCorrect) {
            styles = 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20';
            icon = <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            textColorClass = 'text-green-600 dark:text-green-400';
        } else {
            styles = 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20';
            icon = <XCircleIcon className="w-4 h-4 text-red-500" />;
            textColorClass = 'text-red-600 dark:text-red-400';
        }
    } else { // Not attempted
        styles = 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20';
        icon = <MinusCircleIcon className="w-4 h-4 text-yellow-500" />;
        textColorClass = 'text-yellow-600 dark:text-yellow-400';
    }
    
    return { styles, icon, textColorClass };
};

const getTestStatusStylesAndIcon = (question: Question) => {
    let styles = 'bg-secondary border-border hover:bg-accent';
    let icon = <MinusCircleIcon className="w-4 h-4 text-muted-foreground" />;
    let textColorClass = 'text-muted-foreground';

    switch (question.status) {
        case QuestionStatus.ATTEMPTED:
            styles = 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20';
            icon = <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            textColorClass = 'text-green-600 dark:text-green-400';
            break;
        case QuestionStatus.SKIPPED:
            styles = 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20';
            icon = <XCircleIcon className="w-4 h-4 text-red-500" />;
            textColorClass = 'text-red-600 dark:text-red-400';
            break;
        case QuestionStatus.UNVISITED:
        default:
            break;
    }

    if (question.isMarkedForReview) {
        styles = 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20';
        textColorClass = 'text-purple-600 dark:text-purple-400';
    }
    
    return { styles, icon, textColorClass };
};

const Sidebar: React.FC<SidebarProps> = ({ questions, currentQuestionIndex, onNavigate, reviewMode = false, }) => {

  const summary = React.useMemo(() => {
    if (reviewMode) return null;
    return {
      answered: { count: questions.filter(q => q.status === QuestionStatus.ATTEMPTED).length, color: 'bg-green-500' },
      notAnswered: { count: questions.filter(q => q.status === QuestionStatus.SKIPPED).length, color: 'bg-red-500' },
      markedForReview: { count: questions.filter(q => q.isMarkedForReview).length, color: 'bg-purple-500' },
      notVisited: { count: questions.filter(q => q.status === QuestionStatus.UNVISITED).length, color: 'bg-muted-foreground' },
    };
  }, [questions, reviewMode]);

  return (
    <aside className="w-full p-4 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Question Palette</h3>
      
      {summary && (
        <div className="mb-6 p-3 bg-secondary rounded-lg border border-border space-y-2">
           <h4 className="text-sm font-semibold text-foreground mb-2">Summary</h4>
           <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-2">
               <span className={`w-3 h-3 rounded-full ${summary.answered.color}`}></span>
               <span className="text-muted-foreground">Answered</span>
             </div>
             <span className="font-medium text-foreground">{summary.answered.count}</span>
           </div>
           <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-2">
               <span className={`w-3 h-3 rounded-full ${summary.notAnswered.color}`}></span>
               <span className="text-muted-foreground">Not Answered</span>
             </div>
             <span className="font-medium text-foreground">{summary.notAnswered.count}</span>
           </div>
            <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-2">
               <span className={`w-3 h-3 rounded-full ${summary.markedForReview.color}`}></span>
               <span className="text-muted-foreground">Marked for Review</span>
             </div>
             <span className="font-medium text-foreground">{summary.markedForReview.count}</span>
           </div>
           <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-2">
               <span className={`w-3 h-3 rounded-full ${summary.notVisited.color}`}></span>
               <span className="text-muted-foreground">Not Visited</span>
             </div>
             <span className="font-medium text-foreground">{summary.notVisited.count}</span>
           </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => {
          const { styles, icon, textColorClass } = reviewMode
            ? getReviewStatusStylesAndIcon(question)
            : getTestStatusStylesAndIcon(question);

          const isCurrent = index === currentQuestionIndex;
          const currentStyles = isCurrent ? 'ring-2 ring-primary bg-primary/20' : '';

          return (
            <button
              key={question.id}
              onClick={() => onNavigate(index)}
              className={`flex flex-col items-center justify-center p-2 border rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary dark:focus-visible:ring-offset-zinc-900 aspect-square ${styles} ${currentStyles}`}
              aria-label={`Go to question ${index + 1}`}
              title={`Question ${index + 1}`}
            >
              <span className={`text-sm font-bold ${isCurrent ? 'text-primary' : textColorClass}`}>{index + 1}</span>
              {icon}
            </button>
          );
        })}
      </div>

     
    </aside>
  );
};

export default Sidebar;