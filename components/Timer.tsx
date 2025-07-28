import React from 'react';
import { ClockIcon } from './Icons';

interface TimerProps {
  timeRemainingSeconds: number;
}

const Timer: React.FC<TimerProps> = ({ timeRemainingSeconds }) => {
  const isUntimed = timeRemainingSeconds === Number.POSITIVE_INFINITY;
  
  const baseClasses = "flex items-center space-x-2 py-2 px-4 rounded-full shadow-sm text-sm";
  
  if (isUntimed) {
    return (
      <div className={`${baseClasses} bg-green-500 text-white`}>
        <ClockIcon className="h-5 w-5" />
        <span className="font-semibold">
          Unlimited
        </span>
      </div>
    );
  }

  const isLowTime = timeRemainingSeconds <= 60;
  const timeColorClass = isLowTime 
    ? "bg-destructive/10 text-destructive"
    : "bg-secondary text-secondary-foreground";

  const hours = Math.floor(timeRemainingSeconds / 3600);
  const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
  const seconds = timeRemainingSeconds % 60;

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  return (
    <div className={`${baseClasses} ${timeColorClass}`}>
      <ClockIcon className="h-5 w-5" />
      <span className="font-mono font-semibold tracking-wider">
        {hours > 0 && `${formatTime(hours)}:`}
        {formatTime(minutes)}:{formatTime(seconds)}
      </span>
    </div>
  );
};

export default Timer;