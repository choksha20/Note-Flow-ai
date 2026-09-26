import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import NoteEditor from '../components/NoteEditor';
import { ArrowLeft } from 'lucide-react';

export const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/notes/${id}`);
        setTitle(res.data.note.title || '');
        setRawText(res.data.note.raw_text || '');
      } catch (err) {
        setError('Failed to fetch note for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleSubmit = async () => {
    setError('');

    if (rawText.trim().length < 20) {
      setError('Raw text must be at least 20 characters long.');
      return;
    }

    if (rawText.length > 10000) {
      setError('Raw text exceeds maximum length of 10,000 characters.');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/notes/${id}`, {
        title: title.trim() || undefined,
        raw_text: rawText
      });
      navigate(`/notes/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update note.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <LoadingSpinner label="Fetching note for editing..." size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="mb-6">
        <Link
          to={`/notes/${id}`}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Cancel & Return</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Note</h1>
        <p className="mt-1 text-sm text-slate-400">
          Update the raw text or title of your note.
        </p>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 bg-slate-900/60 shadow-2xl">
        <NoteEditor
          title={title}
          setTitle={setTitle}
          rawText={rawText}
          setRawText={setRawText}
          onSubmitProcess={handleSubmit}
          isSaving={saving}
          submitButtonText="Save Updates"
          showDraftButton={false}
        />
      </div>

    </div>
  );
};

export default EditNote;
