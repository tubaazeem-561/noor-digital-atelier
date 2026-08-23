import React, { useState } from 'react';
import { authLogin, authSignup, getStoredAccounts } from '../services/authService';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount, message: string) => void;
  initialMode?: 'login' | 'signup';
}

const PRESET_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDLGVYez4OuPobVronhYYLJivUxyhtyDbrf4tsnenaZOhgJRJFSrJjJ6gU-QN0mNSnoX91iMQSFt99ccZG3wGu04LEtVBRoAxpUFOHnY_bCPKHpd2R4iPgrrE3Kg-tfzcx2GoQzpQ9roCpwatjxBz46NucvCYqDdR3WT04_XM4P3SMQv6wXipbYEzsVHpBesQUFJ5YICMFTttNy08FCLfMkdQbgrTiUNeU0yi_ntTY_GDu-8u58Ohy6',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = authLogin(username, password);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user, `Welcome back, ${res.user.fullName || res.user.username}`);
        onClose();
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
      }
    } else {
      const res = authSignup(username, password, fullName, selectedAvatar);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user, `Atelier account created for ${res.user.fullName}`);
        onClose();
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check details.');
      }
    }
  };

  const handleQuickDemoLogin = () => {
    setErrorMessage(null);
    const res = authLogin('sarah', 'atelier');
    if (res.success && res.user) {
      onAuthSuccess(res.user, `Logged in as ${res.user.fullName} (Demo Account)`);
      onClose();
    } else {
      const signupRes = authSignup('sarah', 'atelier', 'Sarah Jenkins', PRESET_AVATARS[0]);
      if (signupRes.success && signupRes.user) {
        onAuthSuccess(signupRes.user, `Logged in as ${signupRes.user.fullName}`);
        onClose();
      }
    }
  };

  const existingAccounts = getStoredAccounts();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--theme-surface)] w-full max-w-md rounded-3xl p-6 sm:p-8 border border-[var(--theme-border)] shadow-[var(--theme-shadow-lg)] space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--theme-border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)]"></span>
              <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[var(--theme-primary)]">
                NOOR Atelier Pass
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[var(--theme-heading)] mt-1">
              {mode === 'login' ? 'Client Sign In' : 'Create Atelier Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] text-[var(--theme-heading)] flex items-center justify-center transition-colors focus:outline-none border border-[var(--theme-border)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[var(--theme-surface-subtle)] rounded-xl border border-[var(--theme-border)]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-sans uppercase tracking-wider rounded-lg font-semibold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[var(--theme-surface)] text-[var(--theme-primary)] shadow-[var(--theme-shadow-sm)] border border-[var(--theme-border)]'
                : 'text-[var(--theme-body)] hover:text-[var(--theme-heading)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-sans uppercase tracking-wider rounded-lg font-semibold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[var(--theme-surface)] text-[var(--theme-primary)] shadow-[var(--theme-shadow-sm)] border border-[var(--theme-border)]'
                : 'text-[var(--theme-body)] hover:text-[var(--theme-heading)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-[var(--theme-surface-subtle)] border border-red-400 text-red-700 rounded-xl text-xs font-sans flex items-start gap-2.5">
            <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5 text-red-500">
              error
            </span>
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-sans uppercase tracking-wider text-[var(--theme-body)] font-semibold">
                Full Name / Client Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alexander Vance"
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] focus:border-[var(--theme-border-hover)] rounded-xl text-sm text-[var(--theme-heading)] outline-none font-sans"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-sans uppercase tracking-wider text-[var(--theme-body)] font-semibold">
              Username *
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sarah or alexander"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full px-4 py-2.5 bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] focus:border-[var(--theme-border-hover)] rounded-xl text-sm text-[var(--theme-heading)] outline-none font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-sans uppercase tracking-wider text-[var(--theme-body)] font-semibold">
                Password *
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-sans text-[var(--theme-body)] hover:text-[var(--theme-heading)] transition-colors cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full px-4 py-2.5 bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] focus:border-[var(--theme-border-hover)] rounded-xl text-sm text-[var(--theme-heading)] outline-none font-sans"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-sans uppercase tracking-wider text-[var(--theme-body)] font-semibold">
                Select Client Portrait
              </label>
              <div className="flex gap-2.5 items-center">
                {PRESET_AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedAvatar === avatar
                        ? 'border-[var(--theme-primary)] scale-105 shadow-[var(--theme-shadow-sm)] ring-2 ring-[var(--theme-accent)]/30'
                        : 'border-[var(--theme-border)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar option ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm transition-colors shadow-[var(--theme-shadow-sm)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                {mode === 'login' ? 'login' : 'how_to_reg'}
              </span>
              <span>
                {mode === 'login' ? 'Sign In to Atelier' : 'Create Atelier Account'}
              </span>
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2.5 bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] text-[var(--theme-heading)] rounded-full font-serif text-xs transition-colors border border-[var(--theme-border)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-[var(--theme-accent)]">
                  sparkles
                </span>
                <span>One-Click Demo Sign In (Sarah / atelier)</span>
              </button>
            )}
          </div>
        </form>

        {/* Existing Accounts List for quick preview/switch */}
        {existingAccounts.length > 1 && (
          <div className="pt-4 border-t border-[var(--theme-border)] space-y-2">
            <span className="text-[11px] font-sans uppercase tracking-wider text-[var(--theme-body)] font-semibold block">
              Registered Atelier Profiles:
            </span>
            <div className="flex flex-wrap gap-2">
              {existingAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setUsername(acc.username);
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="px-3 py-1 bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-full text-xs font-sans text-[var(--theme-heading)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <img
                    src={acc.avatarUrl}
                    alt={acc.username}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>@{acc.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center pt-2">
          <p className="text-[11px] font-sans text-[var(--theme-body)] text-xs">
            NOOR DIGITAL ATELIER • SECURE CLIENT ENCRYPTION
          </p>
        </div>
      </div>
    </div>
  );
};

