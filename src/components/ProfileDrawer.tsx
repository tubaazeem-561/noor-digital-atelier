import React, { useState } from 'react';
import { UserSilhouette, UserAccount, GenderPreference } from '../types';
import { getStoredAccounts } from '../services/authService';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  userSilhouette: UserSilhouette;
  currentGender: GenderPreference;
  onUpdateSilhouette: (updated: Partial<UserSilhouette>) => void;
  onChangeGenderPreference: (gender: GenderPreference, shouldApplyPresetWardrobe: boolean) => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onSwitchAccount: (user: UserAccount) => void;
  onLogout: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  userSilhouette,
  currentGender,
  onUpdateSilhouette,
  onChangeGenderPreference,
  onOpenAuthModal,
  onSwitchAccount,
  onLogout
}) => {
  const [userName, setUserName] = useState(userSilhouette.name);
  const [isEditing, setIsEditing] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSilhouette({ name: userName });
    setIsEditing(false);
  };

  const allAccounts = getStoredAccounts();

  const themeList: { id: GenderPreference; label: string; icon: string; desc: string; colors: string[] }[] = [
    {
      id: 'woman',
      label: 'Woman (Pink NOOR)',
      icon: '🌸',
      desc: 'Blush pink canvas × Wine burgundy luxury',
      colors: ['#FCF2F5', '#C86D8B', '#4A0E2E']
    },
    {
      id: 'man',
      label: 'Man (Blue NOOR)',
      icon: '🔵',
      desc: 'Powder blue canvas × Midnight navy tailoring',
      colors: ['#EEF4FA', '#456F97', '#0D1F38']
    },
    {
      id: 'non-binary',
      label: 'Non-binary (Neutral)',
      icon: '⚪',
      desc: 'Alabaster ivory × Graphite charcoal drape',
      colors: ['#F6F5F2', '#9C856C', '#1C1C1E']
    },
    {
      id: 'prefer-not-to-say',
      label: 'Prefer not to say',
      icon: '⚪',
      desc: 'Warm off-white × Universal balance',
      colors: ['#FAF9F7', '#9C856C', '#18181A']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[var(--theme-surface)] w-full max-w-md h-full border-l border-[var(--theme-border)] shadow-[var(--theme-shadow-lg)] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto transition-colors duration-300">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-accent)]"></span>
              <span className="font-sans text-xs text-[var(--theme-primary)] uppercase tracking-widest font-semibold">
                Client Profile & Atelier
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface-hover)] flex items-center justify-center text-[var(--theme-heading)] transition-colors border border-[var(--theme-border)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* User Account Banner */}
          {currentUser ? (
            <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-3 shadow-[var(--theme-shadow-sm)]">
              <div className="flex items-center gap-4">
                <img
                  src={currentUser.avatarUrl || userSilhouette.photoUrl}
                  alt={currentUser.fullName || currentUser.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)]"
                />
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-2 py-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded text-sm font-serif outline-none text-[var(--theme-heading)]"
                      />
                      <button
                        onClick={handleSave}
                        className="px-2.5 py-1 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-xs rounded transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl text-[var(--theme-heading)] truncate">
                          {currentUser.fullName || currentUser.username}
                        </h3>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-xs font-sans text-[var(--theme-muted)] hover:text-[var(--theme-heading)] underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <span className="text-xs font-mono text-[var(--theme-accent)] block">
                        @{currentUser.username}
                      </span>
                      <span className="text-[11px] font-sans text-[var(--theme-body)]">
                        Personalized Wardrobe & Theme Active
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Quick Actions */}
              <div className="pt-2 border-t border-[var(--theme-border)] flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                  className="text-xs font-sans font-semibold text-[var(--theme-primary)] hover:text-[var(--theme-primary-hover)] flex items-center gap-1 py-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-[var(--theme-accent)]">
                    swap_horiz
                  </span>
                  <span>Switch Account ({allAccounts.length})</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs font-sans font-semibold text-rose-700 hover:underline flex items-center gap-1 py-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    logout
                  </span>
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Switch Account Drawer Menu */}
              {showSwitchMenu && (
                <div className="pt-2 border-t border-[var(--theme-border)] space-y-2 animate-fadeIn">
                  <span className="text-[11px] font-sans uppercase tracking-wider text-[var(--theme-muted)] block font-semibold">
                    Saved Atelier Accounts:
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {allAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                          acc.id === currentUser.id
                            ? 'bg-[var(--theme-surface)] border border-[var(--theme-primary)] text-[var(--theme-heading)] font-medium shadow-[var(--theme-shadow-sm)]'
                            : 'bg-[var(--theme-surface)]/70 hover:bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-body)] cursor-pointer'
                        }`}
                        onClick={() => {
                          if (acc.id !== currentUser.id) {
                            onSwitchAccount(acc);
                            setShowSwitchMenu(false);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={acc.avatarUrl}
                            alt={acc.username}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="truncate text-[var(--theme-heading)]">
                            {acc.fullName} (@{acc.username})
                          </span>
                        </div>
                        {acc.id === currentUser.id && (
                          <span className="text-[10px] font-mono text-[var(--theme-primary)] font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      onOpenAuthModal('signup');
                      setShowSwitchMenu(false);
                    }}
                    className="w-full py-1.5 text-xs font-sans text-[var(--theme-primary)] hover:underline border border-dashed border-[var(--theme-border)] rounded-xl text-center block mt-2 cursor-pointer"
                  >
                    + Create Another Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] text-center space-y-3 shadow-[var(--theme-shadow-sm)]">
              <span className="material-symbols-outlined text-3xl text-[var(--theme-primary)]">
                account_circle
              </span>
              <div>
                <h3 className="font-serif text-lg text-[var(--theme-heading)]">
                  Guest Session
                </h3>
                <p className="text-xs font-sans text-[var(--theme-body)] mt-1">
                  Sign in or create an account to save custom looks and manage your private wardrobe.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] rounded-full font-serif text-xs shadow-[var(--theme-shadow-sm)] cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="px-4 py-2 bg-[var(--theme-surface)] text-[var(--theme-heading)] border border-[var(--theme-border)] rounded-full font-serif text-xs cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* Visual Theme / Gender Calibration Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans text-[var(--theme-primary)] uppercase tracking-wider font-semibold block">
                Visual Identity & Theme
              </span>
              <span className="text-[10px] font-mono text-[var(--theme-muted)]">
                Active: {currentGender}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {themeList.map((item) => {
                const isActive = currentGender === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeGenderPreference(item.id, false)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] ring-1 ring-[var(--theme-primary)]/30'
                        : 'border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <span className="text-xs font-serif font-medium text-[var(--theme-heading)] block leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-sans text-[var(--theme-body)] block">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.colors.map((c, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spatial Calibration Metrics */}
          <div className="space-y-3">
            <span className="text-xs font-sans text-[var(--theme-muted)] uppercase tracking-wider font-semibold block">
              Spatial Calibration Metrics
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-[var(--theme-surface-subtle)] rounded-xl border border-[var(--theme-border)] space-y-1">
                <span className="text-[10px] font-sans text-[var(--theme-muted)]">FIT SCORE</span>
                <p className="font-serif text-lg text-[var(--theme-heading)]">
                  {userSilhouette.aestheticScore}% Optimal
                </p>
              </div>
              <div className="p-3.5 bg-[var(--theme-surface-subtle)] rounded-xl border border-[var(--theme-border)] space-y-1">
                <span className="text-[10px] font-sans text-[var(--theme-muted)]">STATUS</span>
                <p className="font-serif text-lg text-[var(--theme-primary)] font-medium">
                  {userSilhouette.status}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] space-y-1.5 shadow-[var(--theme-shadow-sm)]">
              <span className="text-xs font-sans text-[var(--theme-primary)] uppercase font-semibold tracking-wider">
                Anatomical Drape Index
              </span>
              <p className="text-xs font-sans text-[var(--theme-body)] leading-relaxed">
                {userSilhouette.proportionsAnalysis}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--theme-border)] text-center">
          <p className="text-xs font-sans text-[var(--theme-muted)] uppercase tracking-wider">
            NOOR DIGITAL ATELIER • HAUTE COUTURE
          </p>
        </div>
      </div>
    </div>
  );
};

