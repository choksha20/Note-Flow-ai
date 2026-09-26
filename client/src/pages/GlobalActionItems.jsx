import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ActionItemRow from '../components/ActionItemRow';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import { CheckSquare, Search, Filter, ListTodo, AlertCircle, CheckCircle2 } from 'lucide-react';

export const GlobalActionItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('open'); // 'open' | 'done' | 'all'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'high' | 'medium' | 'low' | 'all'
  const [search, setSearch] = useState('');

  const fetchActionItems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/action-items', {
        params: {
          status: statusFilter,
          priority: priorityFilter,
          search
        }
      });
      setItems(res.data.action_items || []);
    } catch (err) {
      console.error('Failed to fetch action items:', err);
      setError(err.response?.data?.error || 'Failed to load action items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionItems();
  }, [statusFilter, priorityFilter, search]);

  const handleToggleStatus = async (itemId, newStatus) => {
    try {
      const res = await api.patch(`/action-items/${itemId}`, { status: newStatus });
      setItems(prev => prev.map(item => item.id === itemId ? { ...res.data.action_item, note_title: item.note_title } : item));
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    try {
      const res = await api.patch(`/action-items/${itemId}`, updates);
      setItems(prev => prev.map(item => item.id === itemId ? { ...res.data.action_item, note_title: item.note_title } : item));
    } catch (err) {
      setError('Failed to update task.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/action-items/${itemId}`);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  const openCount = items.filter(i => i.status === 'open').length;
  const doneCount = items.filter(i => i.status === 'done').length;
  const highPriorityCount = items.filter(i => i.priority === 'high' && i.status === 'open').length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-emerald-400" />
            <span>Global Action Items</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Track and manage all extracted task items across all your meeting notes.
          </p>
        </div>

        {/* Quick Counters */}
        <div className="flex items-center space-x-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300">
            <span className="text-amber-400 font-bold text-sm mr-1.5">{openCount}</span> Open
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300">
            <span className="text-emerald-400 font-bold text-sm mr-1.5">{doneCount}</span> Done
          </div>
          {highPriorityCount > 0 && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2 text-xs font-semibold text-red-300">
              <span className="text-red-400 font-bold text-sm mr-1.5">{highPriorityCount}</span> High Priority
            </div>
          )}
        </div>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />

      {/* Filter Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 bg-slate-900/60 shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or owners..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="open">Open Tasks</option>
              <option value="done">Completed Tasks</option>
              <option value="all">All Tasks</option>
            </select>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSpinner label="Loading action items..." size="lg" />
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map(item => (
            <ActionItemRow
              key={item.id}
              item={item}
              onToggleStatus={handleToggleStatus}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              showNoteTitle={true}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800/80 bg-slate-900/40">
          <CheckCircle2 className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-xl font-bold text-slate-100">No Action Items Found</h3>
          <p className="mt-1 text-sm text-slate-400">
            {search || priorityFilter !== 'all' || statusFilter !== 'all'
              ? 'Try clearing your filters or search terms.'
              : 'Process a note with AI to extract action items here!'}
          </p>
        </div>
      )}

    </div>
  );
};

export default GlobalActionItems;
