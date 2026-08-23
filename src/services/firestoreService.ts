import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { GenderPreference } from '../types';
import { db } from './firebase';

export interface FirestoreUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  genderPreference?: GenderPreference;
  colorAnalysis?: {
    season?: string;
    palette?: string[];
    undertone?: string;
    contrastLevel?: string;
    notes?: string;
    analyzedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface FirestoreClosetItem {
  id?: string;
  owner: string; // User UID
  category: 'head' | 'hijab' | 'torso' | 'bottoms' | 'feet' | 'accessories' | string;
  imageUrl: string;
  name?: string;
  color?: string;
  createdAt: string | any;
}

export interface FirestoreSavedLookLayers {
  head?: string;
  hijab?: string;
  torso?: string;
  bottoms?: string;
  feet?: string;
  accessories?: string[];
  [key: string]: any;
}

export interface FirestoreSavedLook {
  id?: string;
  owner: string; // User UID
  name: string;
  layers: FirestoreSavedLookLayers;
  createdAt: string | any;
}

// ---------------- USER COLLECTION ----------------

/**
 * Creates or updates a user profile document in the `users` collection.
 */
export async function syncUserProfile(
  uid: string,
  data: Partial<FirestoreUserProfile>
): Promise<FirestoreUserProfile> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  const now = new Date().toISOString();
  if (!snap.exists()) {
    const newProfile: FirestoreUserProfile = {
      uid,
      email: data.email || null,
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      genderPreference: data.genderPreference || 'woman',
      createdAt: now,
      updatedAt: now
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    const existing = snap.data() as FirestoreUserProfile;
    const updated = {
      ...existing,
      ...data,
      updatedAt: now
    };
    await updateDoc(userRef, updated);
    return updated;
  }
}

/**
 * Fetches a user profile from the `users` collection.
 */
export async function getUserProfile(uid: string): Promise<FirestoreUserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as FirestoreUserProfile;
  }
  return null;
}

/**
 * Saves or updates color analysis results on the `users` document.
 */
export async function saveUserColorAnalysis(
  uid: string,
  colorAnalysis: FirestoreUserProfile['colorAnalysis']
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    colorAnalysis,
    updatedAt: new Date().toISOString()
  });
}

// ---------------- CLOSET ITEMS COLLECTION ----------------

/**
 * Adds a new clothing item to `closetItems` collection.
 */
export async function addClosetItem(
  item: Omit<FirestoreClosetItem, 'id' | 'createdAt'>
): Promise<FirestoreClosetItem> {
  const colRef = collection(db, 'closetItems');
  const now = new Date().toISOString();
  const docRef = await addDoc(colRef, {
    ...item,
    createdAt: now
  });
  return {
    id: docRef.id,
    ...item,
    createdAt: now
  };
}

/**
 * Fetches all closet items belonging to a user from `closetItems`.
 */
export async function getUserClosetItems(ownerUid: string): Promise<FirestoreClosetItem[]> {
  const colRef = collection(db, 'closetItems');
  const q = query(colRef, where('owner', '==', ownerUid));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<FirestoreClosetItem, 'id'>)
  }));
}

// ---------------- SAVED LOOKS COLLECTION ----------------

/**
 * Saves an outfit look to `savedLooks` collection.
 */
export async function addSavedLook(
  ownerUid: string,
  name: string,
  layers: FirestoreSavedLookLayers
): Promise<FirestoreSavedLook> {
  const colRef = collection(db, 'savedLooks');
  const now = new Date().toISOString();
  const newLook = {
    owner: ownerUid,
    name,
    layers,
    createdAt: now
  };
  const docRef = await addDoc(colRef, newLook);
  return {
    id: docRef.id,
    ...newLook
  };
}

/**
 * Fetches all saved looks belonging to a user from `savedLooks`.
 */
export async function getUserSavedLooks(ownerUid: string): Promise<FirestoreSavedLook[]> {
  const colRef = collection(db, 'savedLooks');
  const q = query(colRef, where('owner', '==', ownerUid));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<FirestoreSavedLook, 'id'>)
  }));
}
