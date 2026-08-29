import React from 'react';
import { cn } from '../../utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 stroke-[3]',
    md: 'w-6 h-6 stroke-[3]',
    lg: 'w-10 h-10 stroke-[2.5]',
    xl: 'w-16 h-16 stroke-[2]',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative flex items-center justify-center">
        <svg
          className={cn('animate-spin text-cyan-400', sizeClasses[size])}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-20 stroke-slate-700"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
          />
          <path
            className="opacity-90"
            fill="none"
            stroke="url(#spinnerGrad)"
            strokeLinecap="round"
            d="M4 12a8 8 0 018-8"
          />
          <defs>
            <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/20 animate-pulse pointer-events-none" />
      </div>
      {label && <p className="text-xs text-slate-400 font-medium animate-pulse">{label}</p>}
    </div>
  );
};
