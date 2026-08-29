import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'gradient' | 'outline';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'glass',
  hoverEffect = true,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-6 relative overflow-hidden transition-all duration-300';

  const variantStyles = {
    glass: 'bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40',
    solid: 'bg-slate-900 border border-slate-800 shadow-lg',
    gradient: 'bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5',
    outline: 'bg-transparent border border-slate-800 hover:border-slate-700',
  };

  const hoverStyles = hoverEffect ? 'hover:border-cyan-500/30 hover:shadow-cyan-500/10 hover:-translate-y-0.5' : '';

  return (
    <div className={cn(baseStyles, variantStyles[variant], hoverStyles, className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('flex items-center justify-between mb-4 pb-3 border-b border-white/5', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-slate-100 tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-slate-400 mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('text-slate-200', className)} {...props}>
    {children}
  </div>
);
