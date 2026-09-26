import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ErrorBanner = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="mb-6 flex items-start justify-between rounded-xl border border-red-500/30 bg-red-950/40 p-4 backdrop-blur-md shadow-lg shadow-red-950/20">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
        <div>
          <h4 className="text-sm font-semibold text-red-300">An Error Occurred</h4>
          <p className="mt-1 text-sm text-red-200/90 leading-relaxed">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-red-400 hover:bg-red-900/50 hover:text-red-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
