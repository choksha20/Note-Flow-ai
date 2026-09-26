import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/ErrorBanner';
import { User, Mail, Lock, Shield, CheckCircle, Save } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateProfile({
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      setSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <User className="h-8 w-8 text-indigo-400" />
          <span>User Profile & Security</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your personal details and account credentials.
        </p>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />

      {success && (
        <div className="mb-6 flex items-center space-x-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-300">
          <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 bg-slate-900/60 shadow-2xl space-y-8">
        
        {/* Read-only account overview */}
        <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xl">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name || 'User'}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5 text-indigo-400" />
              <span>{user?.email}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Member since {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span>Change Password</span>
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required only if setting a new password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="gradient-border-btn inline-flex items-center space-x-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving Changes...' : 'Save Profile Updates'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Profile;
