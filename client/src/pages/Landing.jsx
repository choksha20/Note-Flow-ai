import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, FileText, ListTodo, BrainCircuit } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="relative overflow-hidden bg-slate-950 min-h-[calc(100vh-4rem)]">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/10 to-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        
        {/* Hero Banner */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-4 py-1.5 text-xs font-bold text-indigo-300 backdrop-blur-md mb-8">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Powered by Google Gemini 2.5 AI Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Turn Messy Notes Into <br />
            <span className="gradient-text">Structured Actionable Intelligence</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
            Paste raw meeting transcripts, email threads, or rough brainstorm dumps. NoteFlow AI instantly extracts concise summaries, key decisions, and trackable action items.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="gradient-border-btn w-full sm:w-auto inline-flex items-center justify-center space-x-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] transition-transform"
            >
              <span>Start Free Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
            >
              <span>Existing User Log In</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-3xl p-8 border border-slate-800/80 bg-slate-900/60">
            <div className="rounded-2xl bg-indigo-500/10 p-4 w-fit border border-indigo-500/20 text-indigo-400 mb-6">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Instant Text Summarization</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Transform multi-page transcripts or chaotic notes into clean 2-3 sentence executive summaries without losing critical details.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-slate-800/80 bg-slate-900/60">
            <div className="rounded-2xl bg-violet-500/10 p-4 w-fit border border-violet-500/20 text-violet-400 mb-6">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Key Decision Logging</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Never ask "what did we decide?" again. Automatically isolate and catalog formal agreements and decisions made during meetings.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-slate-800/80 bg-slate-900/60">
            <div className="rounded-2xl bg-emerald-500/10 p-4 w-fit border border-emerald-500/20 text-emerald-400 mb-6">
              <ListTodo className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Smart Action Checklist</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Extract concrete tasks complete with assigned owners, inferred deadlines, and urgency priorities in an interactive task board.
            </p>
          </div>
        </div>

        {/* Security & Reliability Banner */}
        <div className="mt-20 glass-panel rounded-3xl p-8 border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-emerald-500/20 p-3 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Security & Privacy First Architecture</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Your notes and data are isolated per-user with strict PostgreSQL scoping and server-side Gemini API calls.
                </p>
              </div>
            </div>

            <Link
              to="/register"
              className="gradient-border-btn flex-shrink-0 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg"
            >
              Get Started Now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;
