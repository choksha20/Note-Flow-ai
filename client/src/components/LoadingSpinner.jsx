import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-400">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-500`} />
      {label && <p className="text-sm font-medium tracking-wide text-slate-300">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
