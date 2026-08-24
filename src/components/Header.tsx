import React from 'react';
import { NOOR_LOGO_URL, THEME_PRESETS } from '../data/initialData';
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
    others: { label: 'Others', icon: '⚪' }
  };

  const activeThemeBadge = themeBadges[currentGender] || themeBadges.woman;
  const currentPreset = THEME_PRESETS[currentGender] || THEME_PRESETS.woman;
  const { bg: headerBg, border: headerBorder, mobileBg } = currentPreset.headerColors;

  return (
    <header
      style={{ backgroundColor: headerBg, borderColor: headerBorder }}
      className="fixed top-0 w-full z-50 backdrop-blur-md border-b transition-colors duration-300 shadow-md"
    >
      <div className="h-20 max-w-[1024px] mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3.5 text-left group focus:outline-none cursor-pointer"
        >
          <img
            alt="NOOR Brand Logo"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 brightness-200"
            src={NOOR_LOGO_URL}
          />
          <span className="font-serif text-2xl lg:text-3xl tracking-tight text-white italic font-light">
            NOOR <span className="font-semibold text-rose-200 not-italic tracking-normal">Atelier</span>
          </span>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-7 h-full">
          <button
            onClick={() => onTabChange('home')}
            className={`font-sans text-xs uppercase tracking-widest transition-all py-1 border-b-2 cursor-pointer ${
              activeTab === 'home'
                ? 'text-white border-white font-bold'
                : 'text-white/75 border-transparent hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('closet')}
            className={`font-sans text-xs uppercase tracking-widest transition-all py-1 border-b-2 cursor-pointer ${
              activeTab === 'closet'
                ? 'text-white border-white font-bold'
                : 'text-white/75 border-transparent hover:text-white'
            }`}
          >
            Closet
          </button>
          <button
            onClick={() => onTabChange('style')}
            className={`font-sans text-xs uppercase tracking-widest transition-all py-1 border-b-2 cursor-pointer ${
              activeTab === 'style' || activeTab === 'look-detail'
                ? 'text-white border-white font-bold'
                : 'text-white/75 border-transparent hover:text-white'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => onTabChange('fit-check')}
            className={`font-sans text-xs uppercase tracking-widest transition-all py-1 border-b-2 cursor-pointer ${
              activeTab === 'fit-check'
                ? 'text-white border-white font-bold'
                : 'text-white/75 border-transparent hover:text-white'
            }`}
          >
            Fit Check
          </button>
          <button
            onClick={() => onTabChange('saved')}
            className={`font-sans text-xs uppercase tracking-widest transition-all py-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'saved'
                ? 'text-white border-white font-bold'
                : 'text-white/75 border-transparent hover:text-white'
            }`}
          >
            <span>Archives</span>
            {savedCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white/20 text-white rounded-full font-bold">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-all cursor-pointer"
            title="Change Visual Theme & Gender Calibrations"
          >
            <span>{activeThemeBadge.icon}</span>
            <span className="hidden sm:inline font-sans text-xs font-medium text-white">
              {activeThemeBadge.label}
            </span>
            <span className="material-symbols-outlined text-xs text-white/70">
              palette
            </span>
          </button>

          <button
            onClick={onOpenSearch}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none cursor-pointer"
            title="Search Archive & Closet"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white focus:outline-none cursor-pointer"
              title="View Client Profile & Silhouette"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover border border-white/30"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-serif text-white leading-tight font-medium">
                  {currentUser.fullName || currentUser.username}
                </span>
                <span className="text-[10px] font-sans text-white/70 uppercase tracking-wider">
                  @{currentUser.username}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 bg-white text-[var(--theme-primary)] hover:bg-white/90 font-semibold rounded-full font-serif text-xs transition-all shadow-sm flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div
        style={{ backgroundColor: mobileBg }}
        className="md:hidden flex items-center justify-around border-t border-white/15 px-2 py-2 text-white transition-colors duration-300"
      >
        {(['home', 'closet', 'style', 'fit-check', 'saved'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1 text-xs uppercase tracking-wider font-mono rounded-full ${
              activeTab === tab
                ? 'bg-white text-[#4A0E2E] font-bold'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            {tab === 'saved' ? 'Archives' : tab === 'fit-check' ? 'Fit Check' : tab}
          </button>
        ))}
      </div>
    </header>
  );
};
