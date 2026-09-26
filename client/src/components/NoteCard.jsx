import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ArrowRight, Trash2, Edit3, CheckSquare, ListChecks, AlertCircle } from 'lucide-react';

export const NoteCard = ({ note, onDelete }) => {
  const { id, title, raw_text, summary, decisions = [], status, created_at, archived } = note;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'processed':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
            <Sparkles className="h-3 w-3" />
            <span>Processed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/40 animate-pulse">
            <Sparkles className="h-3 w-3 animate-spin" />
            <span>AI Processing...</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 border border-red-500/30">
            <AlertCircle className="h-3 w-3" />
            <span>AI Failed</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-700">
            <span>Draft</span>
          </span>
        );
    }
  };

  const decisionCount = Array.isArray(decisions) ? decisions.length : 0;
  const previewText = summary || raw_text;

  return (
    <div className="glass-card flex flex-col justify-between rounded-2xl p-6 border border-slate-800/80 bg-slate-900/60 transition-all hover:border-indigo-500/40">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1 hover:text-indigo-300 transition-colors">
            <Link to={`/notes/${id}`}>{title}</Link>
          </h3>
          <div className="flex-shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Date & Meta */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span>{formatDate(created_at)}</span>
        </div>

        {/* Text Preview */}
        <p className="text-sm text-slate-300/90 line-clamp-3 leading-relaxed mb-4">
          {previewText}
        </p>

        {/* Badges / Metrics */}
        {status === 'processed' && (
          <div className="flex items-center space-x-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 mb-4">
            <div className="flex items-center space-x-1.5 text-indigo-400 font-medium">
              <ListChecks className="h-4 w-4" />
              <span>{decisionCount} Decisions</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Link
            to={`/notes/${id}/edit`}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Edit Note"
          >
            <Edit3 className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(id, title)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
            title="Archive or Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <Link
          to={`/notes/${id}`}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group"
        >
          <span>View Note</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default NoteCard;
