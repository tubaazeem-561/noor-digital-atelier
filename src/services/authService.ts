import { UserAccount, Garment, Look, UserSilhouette, GenderPreference } from '../types';
import {
  THEME_PRESETS,
  USER_DEFAULT_PORTRAIT_WOMAN
} from '../data/initialData';

const ACCOUNTS_STORAGE_KEY = 'noor_atelier_accounts_v3';
const ACTIVE_USER_STORAGE_KEY = 'noor_atelier_active_user_id_v3';

// Simple hashing function for local demo persistence
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash).toString(36)}_${password.length}`;
}

export function getDefaultAccount(): UserAccount {
  const preset = THEME_PRESETS.woman;
  return {
    id: 'user-sarah-default',
    username: 'sarah',
    passwordHash: hashPassword('atelier'),
    fullName: 'Sarah Jenkins',
    avatarUrl: preset.defaultPortrait,
    createdAt: new Date().toISOString(),
    genderPreference: 'woman',
    onboardingCompleted: true,
    silhouette: preset.defaultSilhouette,
    garments: preset.garments,
    looks: preset.looks
  };
}

export function getStoredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      const defaultAcc = getDefaultAccount();
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([defaultAcc]));
      return [defaultAcc];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const defaultAcc = getDefaultAccount();
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([defaultAcc]));
    return [defaultAcc];
  } catch (err) {
    console.error('Error loading accounts from storage:', err);
    return [getDefaultAccount()];
  }
}

export function saveStoredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving accounts to storage:', err);
  }
}

export function getActiveUserId(): string | null {
  try {
    const activeId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (activeId) return activeId;
    // Default to the first account if none set
    const accounts = getStoredAccounts();
    if (accounts.length > 0) {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, accounts[0].id);
      return accounts[0].id;
    }
    return null;
  } catch {
    return null;
  }
}

export function setActiveUserId(userId: string | null): void {
  try {
    if (userId) {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, userId);
    } else {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error setting active user ID:', err);
  }
}

export function getCurrentUser(): UserAccount | null {
  const activeId = getActiveUserId();
  if (!activeId) return null;
  const accounts = getStoredAccounts();
  return accounts.find((acc) => acc.id === activeId) || accounts[0] || null;
}

export function authLogin(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const targetUser = accounts.find(
    (acc) => acc.username.toLowerCase() === cleanUsername
  );

  if (!targetUser) {
    return {
      success: false,
      error: `No atelier account found for "${usernameInput}". Please verify the username or create a new account.`
    };
  }

  const expectedHash = hashPassword(passwordInput);
  if (targetUser.passwordHash !== expectedHash) {
    return {
      success: false,
      error: 'Incorrect password. Please try again or reset your credentials.'
    };
  }

  setActiveUserId(targetUser.id);
  return { success: true, user: targetUser };
}

export function authSignup(
  usernameInput: string,
  passwordInput: string,
  fullNameInput?: string,
  avatarUrlInput?: string,
  initialGender?: GenderPreference
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    return {
      success: false,
      error: 'Username must contain at least 3 alphanumeric characters.'
    };
  }

  if (!passwordInput || passwordInput.length < 4) {
    return {
      success: false,
      error: 'Password must be at least 4 characters.'
    };
  }

  const accounts = getStoredAccounts();
  const existing = accounts.find(
    (acc) => acc.username.toLowerCase() === cleanUsername
  );

  if (existing) {
    return {
      success: false,
      error: `Username "${usernameInput}" is already in use. Please select a unique username or log in.`
    };
  }

  const gender: GenderPreference = initialGender || 'woman';
  const preset = THEME_PRESETS[gender];
  const displayName = fullNameInput?.trim() || cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
  const avatar = avatarUrlInput?.trim() || preset.defaultPortrait;

  // Create personalized initial user silhouette and wardrobe
  const newAccount: UserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    passwordHash: hashPassword(passwordInput),
    fullName: displayName,
    avatarUrl: avatar,
    createdAt: new Date().toISOString(),
    genderPreference: gender,
    onboardingCompleted: false, // Will show the "Tell us a little about you" gender modal
    silhouette: {
      ...preset.defaultSilhouette,
      name: displayName,
      photoUrl: avatar
    },
    // Seed with initial wardrobe curated for this aesthetic
    garments: preset.garments,
    looks: preset.looks
  };

  const updatedAccounts = [...accounts, newAccount];
  saveStoredAccounts(updatedAccounts);
  setActiveUserId(newAccount.id);

  return { success: true, user: newAccount };
}

export function authLogout(): void {
  setActiveUserId(null);
}

export function updateAccountData(
  userId: string,
  updater: (account: UserAccount) => UserAccount
): UserAccount | null {
  const accounts = getStoredAccounts();
  const index = accounts.findIndex((acc) => acc.id === userId);
  if (index === -1) return null;

  const updated = updater(accounts[index]);
  accounts[index] = updated;
  saveStoredAccounts(accounts);
  return updated;
}

