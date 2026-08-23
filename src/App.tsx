import React, { useState, useEffect } from 'react';
import {
  TabType,
  Garment,
  Look,
  UserSilhouette,
  UserAccount,
  GenderPreference
} from './types';
import {
  INITIAL_GARMENTS,
  INITIAL_LOOKS,
  INITIAL_USER_SILHOUETTE,
  THEME_PRESETS
} from './data/initialData';
import {
  getCurrentUser,
  getDefaultAccount,
  setActiveUserId,
  updateAccountData,
  authLogout
} from './services/authService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/HomeScreen';
import { PhotoScreen } from './components/PhotoScreen';
import { ClosetScreen } from './components/ClosetScreen';
import { StyleScreen } from './components/StyleScreen';
import { LookDetailScreen } from './components/LookDetailScreen';
import { SavedScreen } from './components/SavedScreen';
import { AddGarmentModal } from './components/AddGarmentModal';
import { GarmentDetailModal } from './components/GarmentDetailModal';
import { SearchModal } from './components/SearchModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { AtelierModals } from './components/AtelierModals';
import { AuthModal } from './components/AuthModal';
import { GenderOnboardingModal } from './components/GenderOnboardingModal';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Active User & Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getCurrentUser() || getDefaultAccount();
  });

  const [garments, setGarments] = useState<Garment[]>(() => {
    const user = getCurrentUser() || getDefaultAccount();
    return user?.garments || INITIAL_GARMENTS;
  });

  const [looks, setLooks] = useState<Look[]>(() => {
    const user = getCurrentUser() || getDefaultAccount();
    return user?.looks || INITIAL_LOOKS;
  });

  const [userSilhouette, setUserSilhouette] = useState<UserSilhouette>(() => {
    const user = getCurrentUser() || getDefaultAccount();
    return user?.silhouette || INITIAL_USER_SILHOUETTE;
  });

  const [activeLook, setActiveLook] = useState<Look>(() => {
    const user = getCurrentUser() || getDefaultAccount();
    return (user?.looks && user.looks[0]) || INITIAL_LOOKS[0];
  });

  const [studioInitialSelection, setStudioInitialSelection] = useState<string[]>([]);

  // Modals & Drawers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isAddGarmentOpen, setIsAddGarmentOpen] = useState(false);
  const [selectedGarmentForDetail, setSelectedGarmentForDetail] =
    useState<Garment | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [activeAtelierModal, setActiveAtelierModal] = useState<
    'journal' | 'sourcing' | 'fabric' | 'concierge' | 'privacy' | null
  >(null);

  // Active Gender Preference & Theme
  const currentGender: GenderPreference = currentUser?.genderPreference || 'woman';

  // Apply Theme Attribute to HTML Root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentGender);
  }, [currentGender]);

  // Check if onboarding is required (first-time login / signup without onboarding)
  const isFirstTimeOnboarding = Boolean(
    currentUser && currentUser.onboardingCompleted === false
  );

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync updates to user record in localStorage
  const syncToActiveAccount = (
    updatedGarments?: Garment[],
    updatedLooks?: Look[],
    updatedSilhouette?: UserSilhouette
  ) => {
    if (!currentUser) return;
    updateAccountData(currentUser.id, (acc) => ({
      ...acc,
      ...(updatedGarments ? { garments: updatedGarments } : {}),
      ...(updatedLooks ? { looks: updatedLooks } : {}),
      ...(updatedSilhouette ? { silhouette: updatedSilhouette } : {})
    }));
  };

  // Switch User / Auth Handlers
  const handleAuthSuccess = (user: UserAccount, message: string) => {
    setCurrentUser(user);
    const pref = user.genderPreference || 'woman';
    document.documentElement.setAttribute('data-theme', pref);

    // If user has specific wardrobe, load it, otherwise preset
    const preset = THEME_PRESETS[pref] || THEME_PRESETS.woman;
    setGarments(user.garments && user.garments.length > 0 ? user.garments : preset.garments);
    setLooks(user.looks && user.looks.length > 0 ? user.looks : preset.looks);
    setUserSilhouette(user.silhouette || preset.defaultSilhouette);
    if (user.looks && user.looks.length > 0) {
      setActiveLook(user.looks[0]);
    } else {
      setActiveLook(preset.looks[0]);
    }
    triggerToast(message);
  };

  const handleSwitchAccount = (targetUser: UserAccount) => {
    setActiveUserId(targetUser.id);
    setCurrentUser(targetUser);
    const pref = targetUser.genderPreference || 'woman';
    document.documentElement.setAttribute('data-theme', pref);

    const preset = THEME_PRESETS[pref] || THEME_PRESETS.woman;
    setGarments(targetUser.garments && targetUser.garments.length > 0 ? targetUser.garments : preset.garments);
    setLooks(targetUser.looks && targetUser.looks.length > 0 ? targetUser.looks : preset.looks);
    setUserSilhouette(targetUser.silhouette || preset.defaultSilhouette);
    if (targetUser.looks && targetUser.looks.length > 0) {
      setActiveLook(targetUser.looks[0]);
    } else {
      setActiveLook(preset.looks[0]);
    }
    triggerToast(`Switched to ${targetUser.fullName || targetUser.username}`);
  };

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
    setIsProfileOpen(false);
    document.documentElement.setAttribute('data-theme', 'woman');
    triggerToast('Logged out of NOOR Atelier.');
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Gender Theme Switcher Handler
  const handleGenderThemeSelected = (
    selectedGender: GenderPreference,
    shouldApplyPresetWardrobe: boolean
  ) => {
    const preset = THEME_PRESETS[selectedGender] || THEME_PRESETS.woman;
    document.documentElement.setAttribute('data-theme', selectedGender);

    let nextGarments = garments;
    let nextLooks = looks;
    let nextSilhouette = userSilhouette;

    if (shouldApplyPresetWardrobe) {
      nextGarments = preset.garments;
      nextLooks = preset.looks;
      nextSilhouette = {
        ...preset.defaultSilhouette,
        name: currentUser?.fullName || preset.defaultSilhouette.name
      };
      setGarments(nextGarments);
      setLooks(nextLooks);
      setUserSilhouette(nextSilhouette);
      if (nextLooks.length > 0) {
        setActiveLook(nextLooks[0]);
      }
    }

    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        genderPreference: selectedGender,
        onboardingCompleted: true,
        ...(shouldApplyPresetWardrobe
          ? {
              garments: nextGarments,
              looks: nextLooks,
              silhouette: nextSilhouette
            }
          : {})
      };
      setCurrentUser(updatedUser);
      updateAccountData(currentUser.id, () => updatedUser);
    }

    setIsThemeSelectorOpen(false);
    triggerToast(`Visual Identity updated to ${preset.name} (${preset.label})`);
  };

  // Garment Management: Add, Delete, Archive, Restore
  const handleAddGarment = (newGarment: Garment) => {
    const updated = [newGarment, ...garments];
    setGarments(updated);
    syncToActiveAccount(updated, undefined, undefined);
    triggerToast(`Added "${newGarment.name}" to your closet.`);
  };

  const handleDeleteGarment = (id: string) => {
    const updated = garments.filter((g) => g.id !== id);
    setGarments(updated);
    syncToActiveAccount(updated, undefined, undefined);
    triggerToast('Garment removed from closet.');
  };

  const handleArchiveGarment = (id: string) => {
    const updated = garments.map((g) => (g.id === id ? { ...g, isArchived: true } : g));
    setGarments(updated);
    syncToActiveAccount(updated, undefined, undefined);
    triggerToast('Item moved to Archive (hidden from styling recommendations).');
  };

  const handleRestoreGarment = (id: string) => {
    const updated = garments.map((g) => (g.id === id ? { ...g, isArchived: false } : g));
    setGarments(updated);
    syncToActiveAccount(updated, undefined, undefined);
    triggerToast('Item restored to active closet.');
  };

  const handleToggleSaveLook = (lookId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = looks.map((item) => {
      if (item.id === lookId) {
        const nextSaved = !item.isSaved;
        triggerToast(
          nextSaved
            ? `Saved "${item.title}" to Archives.`
            : `Removed "${item.title}" from Archives.`
        );
        return { ...item, isSaved: nextSaved };
      }
      return item;
    });

    setLooks(updated);
    syncToActiveAccount(undefined, updated, undefined);

    if (activeLook.id === lookId) {
      setActiveLook((prev) => ({ ...prev, isSaved: !prev.isSaved }));
    }
  };

  const handleCreateCustomLook = (customLook: Look) => {
    const updated = [customLook, ...looks];
    setLooks(updated);
    setActiveLook(customLook);
    syncToActiveAccount(undefined, updated, undefined);
    triggerToast(`Created "${customLook.title}".`);
  };

  const handleUpdateSilhouette = (updated: Partial<UserSilhouette>) => {
    const newSilhouette = { ...userSilhouette, ...updated };
    setUserSilhouette(newSilhouette);
    syncToActiveAccount(undefined, undefined, newSilhouette);
    if (currentUser) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              fullName: updated.name || prev.fullName,
              silhouette: newSilhouette
            }
          : null
      );
    }
  };

  const handleViewLook = (look: Look) => {
    setActiveLook(look);
    setActiveTab('look-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModifyInStudio = (look: Look) => {
    const pieceIds = look.pieces?.map((p) => p.id) || [];
    setStudioInitialSelection(pieceIds);
    setActiveTab('style');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStyleWithPieces = (pieceIds: string[]) => {
    setStudioInitialSelection(pieceIds);
    setActiveTab('style');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStyleWithSingleGarment = (garment: Garment) => {
    setStudioInitialSelection([garment.id]);
    setActiveTab('style');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savedCount = looks.filter((l) => l.isSaved).length;

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-heading)] flex flex-col font-sans selection:bg-[var(--theme-surface-subtle)] selection:text-[var(--theme-primary)] transition-colors duration-300">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => {
          if (currentUser) {
            setIsProfileOpen(true);
          } else {
            handleOpenAuth('login');
          }
        }}
        onOpenAuth={handleOpenAuth}
        onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
        currentUser={currentUser}
        savedCount={savedCount}
        currentGender={currentGender}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1024px] w-full mx-auto px-6 lg:px-10 pt-28 sm:pt-32 pb-8">
        {activeTab === 'home' && (
          <HomeScreen
            userSilhouette={userSilhouette}
            currentGender={currentGender}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onQuickStyle={() => {
              setActiveTab('style');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'photo' && (
          <PhotoScreen
            userSilhouette={userSilhouette}
            onUpdateSilhouette={handleUpdateSilhouette}
            onProceedToStyling={() => {
              setActiveTab('style');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'closet' && (
          <ClosetScreen
            garments={garments}
            onAddGarmentClick={() => {
              setIsAddGarmentOpen(true);
            }}
            onSelectGarment={(garment) => setSelectedGarmentForDetail(garment)}
            onDeleteGarment={handleDeleteGarment}
            onArchiveGarment={handleArchiveGarment}
            onRestoreGarment={handleRestoreGarment}
            onStyleWithPieces={handleStyleWithPieces}
          />
        )}

        {activeTab === 'style' && (
          <StyleScreen
            garments={garments}
            userSilhouette={userSilhouette}
            initialSelectedIds={studioInitialSelection}
            onGenerateCustomLook={(newLook) => {
              handleCreateCustomLook(newLook);
            }}
            onViewLookDetail={handleViewLook}
            onAddGarmentClick={() => {
              setIsAddGarmentOpen(true);
            }}
          />
        )}

        {activeTab === 'look-detail' && (
          <LookDetailScreen
            look={activeLook}
            onBack={() => setActiveTab('saved')}
            onToggleSaveLook={handleToggleSaveLook}
            onModifyInStudio={handleModifyInStudio}
            onSelectGarment={(garment) => setSelectedGarmentForDetail(garment)}
          />
        )}

        {activeTab === 'saved' && (
          <SavedScreen
            looks={looks}
            onSelectLook={handleViewLook}
            onToggleSaveLook={handleToggleSaveLook}
            onCreateNewLook={() => {
              setActiveTab('style');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        currentGender={currentGender}
        onOpenModal={(modal) => setActiveAtelierModal(modal)}
      />

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Gender Onboarding / Theme Customizer Modal */}
      <GenderOnboardingModal
        isOpen={isFirstTimeOnboarding || isThemeSelectorOpen}
        initialGender={currentGender}
        isFirstTime={isFirstTimeOnboarding}
        onSelectAndContinue={handleGenderThemeSelected}
        onClose={() => setIsThemeSelectorOpen(false)}
      />

      <AddGarmentModal
        isOpen={isAddGarmentOpen}
        onClose={() => setIsAddGarmentOpen(false)}
        onAddGarment={handleAddGarment}
      />

      <GarmentDetailModal
        garment={selectedGarmentForDetail}
        onClose={() => setSelectedGarmentForDetail(null)}
        onStyleWithPiece={handleStyleWithSingleGarment}
        onArchiveGarment={handleArchiveGarment}
        onRestoreGarment={handleRestoreGarment}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        garments={garments}
        looks={looks}
        onSelectGarment={(g) => setSelectedGarmentForDetail(g)}
        onSelectLook={(l) => handleViewLook(l)}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        userSilhouette={userSilhouette}
        currentGender={currentGender}
        onUpdateSilhouette={handleUpdateSilhouette}
        onChangeGenderPreference={handleGenderThemeSelected}
        onOpenAuthModal={handleOpenAuth}
        onSwitchAccount={handleSwitchAccount}
        onLogout={handleLogout}
      />

      <AtelierModals
        modalType={activeAtelierModal}
        onClose={() => setActiveAtelierModal(null)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-[var(--theme-primary)] text-[var(--theme-primary-text)] rounded-full shadow-[var(--theme-shadow-lg)] font-serif text-sm border border-[var(--theme-border)] flex items-center gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-[var(--theme-accent)] text-sm">
            auto_awesome
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
