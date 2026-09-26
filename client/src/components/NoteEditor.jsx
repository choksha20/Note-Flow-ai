import React, { useState, useRef } from 'react';
import { Plus, X, FileUp, FileText, Link as LinkIcon, Sparkles, Save } from 'lucide-react';

export const NoteEditor = ({
  title,
  setTitle,
  rawText,
  setRawText,
  onSaveDraft,
  onSubmitProcess,
  isSaving = false,
  isProcessing = false,
  submitButtonText = 'Process with AI',
  showDraftButton = true
}) => {
  const [attachedFile, setAttachedFile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const triggerFileUpload = () => {
    setIsMenuOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
    // Reset file input value so re-selecting the same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Optional Title Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Note Title <span className="text-slate-500 font-normal lowercase">(optional — auto-suggested if left blank)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q4 Product Roadmap & Sprint Sync"
          className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Raw Text Composer Container with Attachment Chip & Plus Button */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Raw Text <span className="text-red-400">*</span>
          </label>
          <span className={`text-xs font-medium ${
            rawText.length < 20 ? 'text-amber-400' : rawText.length > 9000 ? 'text-red-400' : 'text-slate-400'
          }`}>
            {rawText.length} / 10,000 characters (min 20)
          </span>
        </div>

        {/* Outer Composer Container */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950/90 p-4 transition-all focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/50 shadow-inner">
          
          {/* Attachment Preview Chip */}
          {attachedFile && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-950/50 px-3.5 py-2 text-xs text-indigo-200 w-fit max-w-full gap-3 animate-fade-in shadow-sm">
              <div className="flex items-center space-x-2 truncate">
                <FileText className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <span className="font-semibold truncate">{attachedFile.name}</span>
                <span className="text-slate-400 text-[11px] flex-shrink-0">
                  ({(attachedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="rounded-md p-1 text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-colors flex-shrink-0"
                title="Remove attachment"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={10}
            required
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your unstructured meeting transcript, email thread, or rough notes here...&#10;&#10;Example:&#10;Meeting on Monday regarding mobile app launch. Alex agreed to finalize UI designs by Friday. Sarah will set up test database by Nov 1. We decided to delay the marketing campaign until Q2."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono leading-relaxed resize-y min-h-[160px]"
          />

          {/* Hidden File Input for Native File Picker */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.docx,.txt,.csv,.pptx"
            className="hidden"
          />

          {/* Bottom Toolbar inside Composer Container */}
          <div className="mt-3 flex flex-wrap items-center justify-between pt-3 border-t border-slate-800/80 gap-3">
            
            {/* Left: Plus (+) Button with Attachment Popup Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                  isMenuOpen || attachedFile
                    ? 'border-indigo-500/60 bg-indigo-950/80 text-indigo-300 shadow-md shadow-indigo-950/50'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title="Add attachment"
              >
                <Plus className={`h-4 w-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-45' : ''}`} />
              </button>

              {/* Popup Menu */}
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setIsMenuOpen(false)} 
                  />
                  
                  <div className="absolute bottom-12 left-0 z-30 w-48 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in">
                    <button
                      type="button"
                      onClick={triggerFileUpload}
                      className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <FileUp className="h-4 w-4 text-indigo-400" />
                      <span>Upload from PC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (textareaRef.current) textareaRef.current.focus();
                      }}
                      className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <FileText className="h-4 w-4 text-violet-400" />
                      <span>Add Text</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        alert('URL attachments feature coming soon!');
                      }}
                      className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <LinkIcon className="h-4 w-4 text-cyan-400" />
                      <span>Add URL</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-3 ml-auto">
              {showDraftButton && (
                <button
                  type="button"
                  disabled={isSaving || isProcessing}
                  onClick={onSaveDraft}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
                >
                  <span className="flex items-center space-x-1.5">
                    <Save className="h-3.5 w-3.5" />
                    <span>{isSaving ? 'Saving Draft...' : 'Save as Draft'}</span>
                  </span>
                </button>
              )}

              <button
                type="button"
                disabled={isSaving || isProcessing}
                onClick={onSubmitProcess}
                className="gradient-border-btn inline-flex items-center space-x-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isProcessing ? 'Processing with AI...' : submitButtonText}</span>
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default NoteEditor;
