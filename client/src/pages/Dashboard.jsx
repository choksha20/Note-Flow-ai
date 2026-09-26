import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardStats from '../components/DashboardStats';
import NoteList from '../components/NoteList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Plus, Sparkles } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({});
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('recent');
  const [showArchived, setShowArchived] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch stats
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data.stats);

      // Fetch notes with query params
      const notesRes = await api.get('/notes', {
        params: {
          search,
          status: statusFilter,
          sort,
          archived: showArchived
        }
      });
      setNotes(notesRes.data.notes);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to fetch notes and stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search, statusFilter, sort, showArchived]);

  const handleDeleteClick = (id, title) => {
    setNoteToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/notes/${noteToDelete.id}?permanent=${showArchived}`);
      setDeleteModalOpen(false);
      setNoteToDelete(null);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete note.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back, {user?.name || user?.email?.split('@')[0]}
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your meeting transcripts, raw notes, and extracted action items.
          </p>
        </div>

        <Link
          to="/notes/new"
          className="gradient-border-btn inline-flex items-center justify-center space-x-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </Link>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />

      {/* Stats Bar */}
      <DashboardStats stats={stats} />

      {/* Notes List with Filters */}
      {loading ? (
        <LoadingSpinner label="Loading your notes..." size="lg" />
      ) : (
        <NoteList
          notes={notes}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sort={sort}
          onSortChange={setSort}
          showArchived={showArchived}
          onShowArchivedToggle={() => setShowArchived(!showArchived)}
          onDeleteNote={handleDeleteClick}
          isLoading={loading}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title={showArchived ? 'Delete Note Permanently' : 'Archive Note'}
        message={
          showArchived
            ? `Are you sure you want to permanently delete "${noteToDelete?.title}"? All associated action items will also be removed.`
            : `Are you sure you want to archive "${noteToDelete?.title}"? You can view archived notes anytime by toggling 'Show Archived'.`
        }
        confirmText={showArchived ? 'Delete Permanently' : 'Archive Note'}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setNoteToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
