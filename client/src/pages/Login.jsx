import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/ErrorBanner';
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@noteflow.ai');
    setPassword('demopassword123');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 shadow-xl shadow-indigo-500/30 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-400">Sign in to your NoteFlow AI workspace</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 border border-slate-800/80 bg-slate-900/60 shadow-2xl shadow-indigo-950/40">
          
          <ErrorBanner message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="gradient-border-btn w-full inline-flex items-center justify-center space-x-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-800/40 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Fill Demo Credentials</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
            Register for free
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
