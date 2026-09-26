import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckSquare, Plus, User, LogOut, Sparkles, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                NoteFlow <span className="gradient-text text-sm uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/50">AI</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 text-sm font-semibold transition-colors px-3 py-2 rounded-lg ${
                  isActive('/dashboard') 
                    ? 'text-indigo-400 bg-indigo-950/50 border border-indigo-800/40' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/action-items"
                className={`flex items-center space-x-2 text-sm font-semibold transition-colors px-3 py-2 rounded-lg ${
                  isActive('/action-items')
                    ? 'text-indigo-400 bg-indigo-950/50 border border-indigo-800/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Action Items</span>
              </Link>

              <Link
                to="/notes/new"
                className="gradient-border-btn flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>New Note</span>
              </Link>

              <div className="h-5 w-[1px] bg-slate-800" />

              {/* Profile & Logout */}
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors px-3 py-2 rounded-lg border ${
                    isActive('/profile')
                      ? 'border-indigo-500/50 text-indigo-300 bg-indigo-950/60'
                      : 'border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4 text-indigo-400" />
                  <span>{user.name || user.email.split('@')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="gradient-border-btn rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          {user && (
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            <FileText className="h-5 w-5 text-indigo-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/action-items"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            <CheckSquare className="h-5 w-5 text-emerald-400" />
            <span>Action Items</span>
          </Link>
          <Link
            to="/notes/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 rounded-lg bg-indigo-600 px-3 py-2.5 text-base font-bold text-white shadow-lg shadow-indigo-600/30"
          >
            <Plus className="h-5 w-5" />
            <span>New Note</span>
          </Link>
          <div className="my-2 border-t border-slate-800" />
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            <User className="h-5 w-5 text-indigo-400" />
            <span>Profile ({user.name || user.email})</span>
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-base font-medium text-red-400 hover:bg-red-950/30"
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
