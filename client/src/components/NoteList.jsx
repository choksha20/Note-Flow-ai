import React from 'react';
import NoteCard from './NoteCard';
import { Search, Filter, Plus, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NoteList = ({
  notes,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
  showArchived,
  onShowArchivedToggle,
  onDeleteNote,
  isLoading
}) => {
  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 bg-slate-900/60 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, decisions, or text..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="processed">Processed</option>
              <option value="draft">Drafts</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Archived Toggle */}
          <button
            onClick={onShowArchivedToggle}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              showArchived 
                ? 'border-indigo-500/50 bg-indigo-950/60 text-indigo-300' 
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showArchived ? 'Showing Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Grid of Notes */}
      {notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={onDeleteNote} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800/80 bg-slate-900/40 my-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-400 mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">No notes found</h3>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            {search || statusFilter || showArchived
              ? 'No notes match your current filters or search queries. Try clearing search filters.'
              : 'You haven’t created any notes yet. Paste your first meeting transcript or raw text to get started!'}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/notes/new"
              className="gradient-border-btn inline-flex items-center space-x-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Note</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteList;
