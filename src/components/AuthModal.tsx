import React, { useState } from 'react';
import {
  authLoginWithEmail,
  authSignupWithEmail,
  authLoginWithGoogle,
  authLoginLocalFallback,
  authSignupLocalFallback,
  getStoredAccounts
} from '../services/authService';
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
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await authLoginWithEmail(emailOrUsername, password);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user, `Welcome back, ${res.user.fullName || res.user.username}`);
        onClose();
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
      }
    } else {
      const res = await authSignupWithEmail(emailOrUsername, password, fullName, selectedAvatar);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user, `Atelier account created for ${res.user.fullName}`);
        onClose();
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check details.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    const res = await authLoginWithGoogle();
    setIsSubmitting(false);
    if (res.success && res.user) {
      onAuthSuccess(res.user, `Signed in with Google as ${res.user.fullName}`);
      onClose();
    } else {
      setErrorMessage(res.error || 'Google sign in was unsuccessful.');
    }
  };

  const handleQuickDemoLogin = () => {
    setErrorMessage(null);
    const res = authLoginLocalFallback('sarah', 'atelier');
    if (res.success && res.user) {
      onAuthSuccess(res.user, `Logged in as ${res.user.fullName} (Demo Pass)`);
      onClose();
    } else {
      const signupRes = authSignupLocalFallback('sarah', 'atelier', 'Sarah Jenkins', PRESET_AVATARS[0]);
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
                Firebase Identity Pass
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

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-3 bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 rounded-full text-sm font-sans font-medium flex items-center justify-center gap-3 transition-colors shadow-sm cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--theme-border)] w-full"></div>
          <span className="bg-[var(--theme-surface)] px-3 text-xs text-[var(--theme-body)] font-sans uppercase tracking-wider">
            or with email
          </span>
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
              Email or Username *
            </label>
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="e.g. client@atelier.com or sarah"
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
                {isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to Atelier' : 'Create Atelier Account'}
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
                <span>One-Click Demo Pass (Sarah / atelier)</span>
              </button>
            )}
          </div>
        </form>

        {/* Existing Accounts List */}
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
                    setEmailOrUsername(acc.username);
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
            NOOR DIGITAL ATELIER • FIREBASE AUTH & ENCRYPTION
          </p>
        </div>
      </div>
    </div>
  );
};
