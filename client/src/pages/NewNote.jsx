import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ErrorBanner from '../components/ErrorBanner';
import NoteEditor from '../components/NoteEditor';
import { ArrowLeft } from 'lucide-react';

export const NewNote = () => {
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();

  const handleCreate = async (shouldProcess = false) => {
    setError('');

    if (rawText.trim().length < 20) {
      setError('Raw text must be at least 20 characters long.');
      return;
    }

    if (rawText.length > 10000) {
      setError('Raw text exceeds maximum length of 10,000 characters.');
      return;
    }

    try {
      if (shouldProcess) {
        setIsProcessing(true);
      } else {
        setIsSaving(true);
      }

      // 1. Create note
      const createRes = await api.post('/notes', {
        title: title.trim() || undefined,
        raw_text: rawText
      });

      const newNoteId = createRes.data.note.id;

      // 2. Process with AI if requested
      if (shouldProcess) {
        try {
          await api.post(`/notes/${newNoteId}/process`);
        } catch (procErr) {
          console.error('Initial AI processing error:', procErr);
        }
      }

      navigate(`/notes/${newNoteId}`);

    } catch (err) {
      console.error('Failed to create note:', err);
      setError(err.response?.data?.error || 'Failed to save note. Please check your text.');
    } finally {
      setIsSaving(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back button & Page Header */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create New Note</h1>
        <p className="mt-1 text-sm text-slate-400">
          Paste meeting transcripts, rough ideas, or raw notes. Process now or save as draft.
        </p>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 bg-slate-900/60 shadow-2xl">
        <NoteEditor
          title={title}
          setTitle={setTitle}
          rawText={rawText}
          setRawText={setRawText}
          onSaveDraft={() => handleCreate(false)}
          onSubmitProcess={() => handleCreate(true)}
          isSaving={isSaving}
          isProcessing={isProcessing}
          submitButtonText="Save & Process with AI"
          showDraftButton={true}
        />
      </div>
    </div>
  );
};

export default NewNote;
