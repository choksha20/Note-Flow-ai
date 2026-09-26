import React from 'react';
import { AlertOctagon, X, Trash2 } from 'lucide-react';

export const ConfirmDeleteModal = ({ isOpen, title = 'Confirm Action', message, confirmText = 'Delete', onConfirm, onCancel, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-indigo-950/50">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 text-red-400">
          <div className="rounded-full bg-red-500/10 p-2.5 border border-red-500/20">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        </div>

        <p className="mt-4 text-sm text-slate-300 leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isLoading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
