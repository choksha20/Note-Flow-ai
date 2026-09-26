import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import ActionItemRow from '../components/ActionItemRow';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { 
  Sparkles, ArrowLeft, Edit3, Trash2, Calendar, FileText, 
  CheckCircle2, ListChecks, CheckSquare, RefreshCw, AlertCircle 
} from 'lucide-react';

export const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'raw'
  
  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNoteDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/notes/${id}`);
      setNote(res.data.note);
      setActionItems(res.data.action_items || []);
    } catch (err) {
      console.error('Failed to load note detail:', err);
      setError(err.response?.data?.error || 'Failed to load note details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoteDetail();
  }, [id]);

  // Process / Reprocess with AI
  const handleProcess = async () => {
    setProcessing(true);
    setError('');
    try {
      const res = await api.post(`/notes/${id}/process`);
      setNote(res.data.note);
      setActionItems(res.data.action_items || []);
    } catch (err) {
      console.error('AI Processing error:', err);
      setError(err.response?.data?.error || 'AI processing failed. Please try again.');
      // Refresh to get updated note state (e.g. status: 'failed')
      fetchNoteDetail();
    } finally {
      setProcessing(false);
    }
  };

  // Action Item Handlers
  const handleToggleItemStatus = async (itemId, newStatus) => {
    try {
      const res = await api.patch(`/action-items/${itemId}`, { status: newStatus });
      setActionItems(prev => prev.map(item => item.id === itemId ? res.data.action_item : item));
    } catch (err) {
      setError('Failed to update action item status.');
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    try {
      const res = await api.patch(`/action-items/${itemId}`, updates);
      setActionItems(prev => prev.map(item => item.id === itemId ? res.data.action_item : item));
    } catch (err) {
      setError('Failed to update action item details.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/action-items/${itemId}`);
      setActionItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError('Failed to delete action item.');
    }
  };

  // Confirm Delete Note
  const handleConfirmDeleteNote = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/notes/${id}?permanent=false`);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete note.');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <LoadingSpinner label="Loading note details..." size="lg" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ErrorBanner message={error || 'Note not found.'} />
        <Link to="/dashboard" className="text-indigo-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { title, raw_text, summary, decisions = [], status, created_at } = note;
  const decisionsList = Array.isArray(decisions) ? decisions : [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Nav & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to={`/notes/${id}/edit`}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors inline-flex items-center space-x-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Text</span>
          </Link>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
            title="Archive Note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />

      {/* Main Title & Process Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 bg-slate-900/60 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h1>
              {status === 'processed' && (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 inline-flex items-center space-x-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Processed</span>
                </span>
              )}
              {status === 'failed' && (
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/30 inline-flex items-center space-x-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Failed</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Created {new Date(created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          <button
            onClick={handleProcess}
            disabled={processing}
            className="gradient-border-btn inline-flex items-center justify-center space-x-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 disabled:opacity-50 flex-shrink-0"
          >
            <Sparkles className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
            <span>
              {processing 
                ? 'Processing Gemini AI...' 
                : status === 'processed' 
                ? 'Reprocess with AI' 
                : 'Process with AI'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-4 mb-6 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'insights'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Summary & Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'raw'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Raw Unstructured Text</span>
        </button>
      </div>

      {/* TAB CONTENT: INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-8">
          
          {status === 'draft' && !summary && (
            <div className="glass-card rounded-3xl p-8 text-center border border-indigo-500/20 bg-indigo-950/20">
              <Sparkles className="mx-auto h-10 w-10 text-indigo-400 mb-3 animate-pulse" />
              <h3 className="text-lg font-bold text-white">This note is currently unprocessed</h3>
              <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
                Click "Process with AI" to extract structured summary, key decisions, and action items automatically.
              </p>
              <button
                onClick={handleProcess}
                disabled={processing}
                className="gradient-border-btn mt-5 inline-flex items-center space-x-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                <span>Process with AI Now</span>
              </button>
            </div>
          )}

          {/* Executive Summary */}
          {summary && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 bg-slate-900/60 shadow-xl">
              <div className="flex items-center space-x-3 text-indigo-400 mb-3">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-lg font-bold text-slate-100">Executive Summary</h3>
              </div>
              <p className="text-base text-slate-200 leading-relaxed font-sans">
                {summary}
              </p>
            </div>
          )}

          {/* Key Decisions */}
          {decisionsList.length > 0 && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 bg-slate-900/60 shadow-xl">
              <div className="flex items-center space-x-3 text-violet-400 mb-4">
                <ListChecks className="h-5 w-5" />
                <h3 className="text-lg font-bold text-slate-100">Key Decisions Made</h3>
              </div>
              <ul className="space-y-3">
                {decisionsList.map((dec, idx) => (
                  <li key={idx} className="flex items-start space-x-3 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-200 leading-normal">{dec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-emerald-400">
                <CheckSquare className="h-5 w-5" />
                <h3 className="text-lg font-bold text-slate-100">
                  Action Items ({actionItems.length})
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {actionItems.filter(i => i.status === 'done').length} of {actionItems.length} completed
              </span>
            </div>

            {actionItems.length > 0 ? (
              <div className="space-y-3">
                {actionItems.map(item => (
                  <ActionItemRow
                    key={item.id}
                    item={item}
                    onToggleStatus={handleToggleItemStatus}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                    showNoteTitle={false}
                  />
                ))}
              </div>
            ) : status === 'processed' ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
                No actionable items were identified in this note.
              </div>
            ) : null}
          </div>

        </div>
      )}

      {/* TAB CONTENT: RAW TEXT */}
      {activeTab === 'raw' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Raw Text Content</h3>
            <span className="text-xs text-slate-500 font-mono">{raw_text.length} characters</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {raw_text}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Archive Note"
        message={`Are you sure you want to archive "${title}"?`}
        confirmText="Archive Note"
        onConfirm={handleConfirmDeleteNote}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={isDeleting}
      />

    </div>
  );
};

export default NoteDetail;
