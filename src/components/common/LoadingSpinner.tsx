import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Yuklanmoqda..." }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 gap-3">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <div className="absolute inset-0 blur-lg bg-indigo-500/20 rounded-full -z-10" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        {message}
      </p>
    </div>
  );
};
