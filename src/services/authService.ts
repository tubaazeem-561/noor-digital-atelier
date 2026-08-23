import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { syncUserProfile, getUserProfile } from './firestoreService';
import { UserAccount, GenderPreference } from '../types';
import { THEME_PRESETS } from '../data/initialData';

const ACCOUNTS_STORAGE_KEY = 'noor_atelier_accounts_v3';
const ACTIVE_USER_STORAGE_KEY = 'noor_atelier_active_user_id_v3';

// Simple hashing function for local demo persistence fallback
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
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
    return localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
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

/**
 * Maps a Firebase User & Firestore Profile to the application's UserAccount model.
 */
export async function mapFirebaseUserToAccount(
  fbUser: FirebaseUser,
  genderPref: GenderPreference = 'woman'
): Promise<UserAccount> {
  const preset = THEME_PRESETS[genderPref];
  let firestoreProfile = null;
  
  try {
    firestoreProfile = await getUserProfile(fbUser.uid);
  } catch (e) {
    console.warn('Firestore fetch skipped or unconfigured:', e);
  }

  const displayName = fbUser.displayName || firestoreProfile?.displayName || fbUser.email?.split('@')[0] || 'Atelier Client';
  const avatarUrl = fbUser.photoURL || firestoreProfile?.photoURL || preset.defaultPortrait;

  const userAccount: UserAccount = {
    id: fbUser.uid,
    username: fbUser.email ? fbUser.email.split('@')[0] : displayName.toLowerCase().replace(/\s+/g, ''),
    passwordHash: 'firebase_auth',
    fullName: displayName,
    avatarUrl,
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    genderPreference: (firestoreProfile?.genderPreference as GenderPreference) || genderPref,
    onboardingCompleted: true,
    silhouette: {
      ...preset.defaultSilhouette,
      name: displayName,
      photoUrl: avatarUrl
    },
    garments: preset.garments,
    looks: preset.looks
  };

  // Sync to Firestore in background if available
  try {
    await syncUserProfile(fbUser.uid, {
      email: fbUser.email,
      displayName,
      photoURL: avatarUrl,
      genderPreference: userAccount.genderPreference
    });
  } catch (e) {
    console.warn('Firestore sync note:', e);
  }

  // Update local storage cache
  const accounts = getStoredAccounts();
  const existingIdx = accounts.findIndex(acc => acc.id === fbUser.uid);
  if (existingIdx >= 0) {
    accounts[existingIdx] = userAccount;
  } else {
    accounts.push(userAccount);
  }
  saveStoredAccounts(accounts);
  setActiveUserId(fbUser.uid);

  return userAccount;
}

// ---------------- FIREBASE AUTHENTICATION API ----------------

/**
 * Sign In using Firebase Google Auth provider.
 */
export async function authLoginWithGoogle(): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = await mapFirebaseUserToAccount(userCredential.user);
    return { success: true, user };
  } catch (err: any) {
    console.error('Firebase Google Auth error:', err);
    return {
      success: false,
      error: err.message || 'Google Sign-In failed. Please try again.'
    };
  }
}

/**
 * Sign In using Firebase Email / Password.
 */
export async function authLoginWithEmail(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    // If input does not contain @, try looking up stored username or format as demo email
    const email = emailInput.includes('@') ? emailInput : `${emailInput.trim().toLowerCase()}@noor-atelier.com`;
    const userCredential = await signInWithEmailAndPassword(auth, email, passwordInput);
    const user = await mapFirebaseUserToAccount(userCredential.user);
    return { success: true, user };
  } catch (err: any) {
    console.warn('Firebase Email login failed, checking demo fallback:', err?.code || err?.message);
    // Fallback to local auth if Firebase is not yet provisioned in backend console
    return authLoginLocalFallback(emailInput, passwordInput);
  }
}

/**
 * Sign Up using Firebase Email / Password.
 */
export async function authSignupWithEmail(
  emailInput: string,
  passwordInput: string,
  fullNameInput?: string,
  avatarUrlInput?: string,
  initialGender: GenderPreference = 'woman'
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const email = emailInput.includes('@') ? emailInput : `${emailInput.trim().toLowerCase()}@noor-atelier.com`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, passwordInput);
    
    if (fullNameInput || avatarUrlInput) {
      await updateProfile(userCredential.user, {
        displayName: fullNameInput || undefined,
        photoURL: avatarUrlInput || undefined
      });
    }

    const user = await mapFirebaseUserToAccount(userCredential.user, initialGender);
    return { success: true, user };
  } catch (err: any) {
    console.warn('Firebase Email signup failed, falling back to local storage:', err?.code || err?.message);
    return authSignupLocalFallback(emailInput, passwordInput, fullNameInput, avatarUrlInput, initialGender);
  }
}

/**
 * Sign Out from Firebase Auth.
 */
export async function authLogout(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Firebase Logout error:', err);
  }
  setActiveUserId(null);
}

/**
 * Subscribes to Firebase Auth status updates.
 */
export function subscribeAuthState(onChange: (user: UserAccount | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const account = await mapFirebaseUserToAccount(fbUser);
      onChange(account);
    } else {
      const activeId = getActiveUserId();
      if (!activeId) {
        onChange(null);
      }
    }
  });
}

// ---------------- LOCAL DEMO FALLBACKS ----------------

export function authLoginLocalFallback(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const targetUser = accounts.find(
    (acc) => acc.username.toLowerCase() === cleanUsername || acc.id === usernameInput
  );

  if (!targetUser) {
    return {
      success: false,
      error: `No atelier account found for "${usernameInput}". Please verify credentials or create a new account.`
    };
  }

  const expectedHash = hashPassword(passwordInput);
  if (targetUser.passwordHash && targetUser.passwordHash !== expectedHash) {
    return {
      success: false,
      error: 'Incorrect password. Please try again or reset credentials.'
    };
  }

  setActiveUserId(targetUser.id);
  return { success: true, user: targetUser };
}

export function authSignupLocalFallback(
  usernameInput: string,
  passwordInput: string,
  fullNameInput?: string,
  avatarUrlInput?: string,
  initialGender: GenderPreference = 'woman'
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const preset = THEME_PRESETS[initialGender];

  const displayName = fullNameInput?.trim() || cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
  const avatar = avatarUrlInput?.trim() || preset.defaultPortrait;

  const newAccount: UserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    passwordHash: hashPassword(passwordInput),
    fullName: displayName,
    avatarUrl: avatar,
    createdAt: new Date().toISOString(),
    genderPreference: initialGender,
    onboardingCompleted: true,
    silhouette: {
      ...preset.defaultSilhouette,
      name: displayName,
      photoUrl: avatar
    },
    garments: preset.garments,
    looks: preset.looks
  };

  const updatedAccounts = [...accounts, newAccount];
  saveStoredAccounts(updatedAccounts);
  setActiveUserId(newAccount.id);

  return { success: true, user: newAccount };
}

export function authLogin(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: UserAccount; error?: string } {
  return authLoginLocalFallback(usernameInput, passwordInput);
}

export function authSignup(
  usernameInput: string,
  passwordInput: string,
  fullNameInput?: string,
  avatarUrlInput?: string,
  initialGender?: GenderPreference
): { success: boolean; user?: UserAccount; error?: string } {
  return authSignupLocalFallback(usernameInput, passwordInput, fullNameInput, avatarUrlInput, initialGender);
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
