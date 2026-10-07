import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading intelligence data...',
  size = 'md'
}) => {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className={`${sizeMap[size]} border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4`} />
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </div>
  );
};
