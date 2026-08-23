import React from 'react';
import { NOOR_LOGO_URL } from '../data/initialData';
import { TabType, UserAccount, GenderPreference } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenThemeSelector: () => void;
  currentUser: UserAccount | null;
  savedCount: number;
  currentGender: GenderPreference;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenProfile,
  onOpenAuth,
  onOpenThemeSelector,
  currentUser,
  savedCount,
  currentGender
}) => {
  const themeBadges: Record<GenderPreference, { label: string; icon: string }> = {
    woman: { label: 'Pink NOOR', icon: '🌸' },
    man: { label: 'Blue NOOR', icon: '🔵' },
    'non-binary': { label: 'Neutral', icon: '⚪' },
    'prefer-not-to-say': { label: 'Classic', icon: '⚪' }
  };

  const activeThemeBadge = themeBadges[currentGender] || themeBadges.woman;

  return (
    <header className="fixed top-0 w-full z-50 bg-[var(--theme-header-bg)] backdrop-blur-md border-b border-[var(--theme-border)] transition-colors duration-300">
      <div className="h-20 max-w-[1024px] mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3.5 text-left group focus:outline-none"
        >
          <img
            alt="NOOR Brand Logo"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            src={NOOR_LOGO_URL}
          />
          <span className="font-serif text-2xl lg:text-3xl tracking-tight text-[var(--theme-heading)] italic font-light">
            NOOR <span className="font-semibold text-[var(--theme-primary)] not-italic tracking-normal">Atelier</span>
          </span>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-7 h-full">
          <button
            onClick={() => onTabChange('home')}
            className={`font-sans text-xs uppercase tracking-widest font-medium transition-all py-1 border-b-2 ${
              activeTab === 'home'
                ? 'text-[var(--theme-primary)] border-[var(--theme-accent)] font-semibold'
                : 'text-[var(--theme-body)] border-transparent hover:text-[var(--theme-primary)]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('photo')}
            className={`font-sans text-xs uppercase tracking-widest font-medium transition-all py-1 border-b-2 ${
              activeTab === 'photo'
                ? 'text-[var(--theme-primary)] border-[var(--theme-accent)] font-semibold'
                : 'text-[var(--theme-body)] border-transparent hover:text-[var(--theme-primary)]'
            }`}
          >
            Silhouette
          </button>
          <button
            onClick={() => onTabChange('closet')}
            className={`font-sans text-xs uppercase tracking-widest font-medium transition-all py-1 border-b-2 ${
              activeTab === 'closet'
                ? 'text-[var(--theme-primary)] border-[var(--theme-accent)] font-semibold'
                : 'text-[var(--theme-body)] border-transparent hover:text-[var(--theme-primary)]'
            }`}
          >
            Closet
          </button>
          <button
            onClick={() => onTabChange('style')}
            className={`font-sans text-xs uppercase tracking-widest font-medium transition-all py-1 border-b-2 ${
              activeTab === 'style' || activeTab === 'look-detail'
                ? 'text-[var(--theme-primary)] border-[var(--theme-accent)] font-semibold'
                : 'text-[var(--theme-body)] border-transparent hover:text-[var(--theme-primary)]'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => onTabChange('saved')}
            className={`font-sans text-xs uppercase tracking-widest font-medium transition-all py-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'text-[var(--theme-primary)] border-[var(--theme-accent)] font-semibold'
                : 'text-[var(--theme-body)] border-transparent hover:text-[var(--theme-primary)]'
            }`}
          >
            <span>Archives</span>
            {savedCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Theme Switcher Pill */}
          <button
            onClick={onOpenThemeSelector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] hover:border-[var(--theme-border-hover)] text-xs font-mono text-[var(--theme-heading)] shadow-[var(--theme-shadow-sm)] transition-all cursor-pointer"
            title="Change Visual Theme & Gender Calibrations"
          >
            <span>{activeThemeBadge.icon}</span>
            <span className="hidden sm:inline font-sans text-xs font-medium text-[var(--theme-heading)]">
              {activeThemeBadge.label}
            </span>
            <span className="material-symbols-outlined text-xs text-[var(--theme-muted)]">
              palette
            </span>
          </button>

          <button
            onClick={onOpenSearch}
            className="w-10 h-10 rounded-full border border-[var(--theme-border)] flex items-center justify-center bg-[var(--theme-surface)] hover:border-[var(--theme-border-hover)] hover:bg-[var(--theme-surface-subtle)] text-[var(--theme-body)] hover:text-[var(--theme-primary)] transition-colors focus:outline-none shadow-[var(--theme-shadow-sm)]"
            title="Search Archive & Closet"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] rounded-full transition-all shadow-[var(--theme-shadow-sm)] focus:outline-none"
              title="View Client Profile & Silhouette"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover border border-[var(--theme-border)]"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-serif text-[var(--theme-heading)] leading-tight font-medium">
                  {currentUser.fullName || currentUser.username}
                </span>
                <span className="text-[10px] font-sans text-[var(--theme-muted)] uppercase tracking-wider">
                  @{currentUser.username}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-xs transition-all shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)] flex items-center gap-1.5 focus:outline-none"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[var(--theme-border)] bg-[var(--theme-bg)] px-2 py-2">
        {(['home', 'photo', 'closet', 'style', 'saved'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1 text-xs uppercase tracking-wider font-mono rounded-full ${
              activeTab === tab
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-semibold shadow-[var(--theme-shadow-sm)]'
                : 'text-[var(--theme-body)] hover:bg-[var(--theme-surface)]'
            }`}
          >
            {tab === 'photo' ? 'Silhouette' : tab === 'saved' ? 'Archives' : tab}
          </button>
        ))}
      </div>
    </header>
  );
};

