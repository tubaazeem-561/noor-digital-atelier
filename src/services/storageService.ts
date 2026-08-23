import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a clothing photo to Firebase Storage under `users/{userId}/closet/{filename}`
 * and returns the public download URL.
 */
export async function uploadGarmentImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const filename = `garment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const storageRef = ref(storage, `users/${userId}/closet/${filename}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

export const uploadClothingImage = uploadGarmentImage;

/**
 * Uploads a user avatar/portrait image to Firebase Storage under `users/{userId}/avatar/{filename}`
 * and returns the public download URL.
 */
export async function uploadAvatarImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const filename = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const storageRef = ref(storage, `users/${userId}/avatar/${filename}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Uploads a generated outfit board image to Firebase Storage under `users/{userId}/boards/{filename}`
 * and returns the public download URL.
 */
export async function uploadBoardImage(file: Blob, userId: string): Promise<string> {
  const filename = `board_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
  const storageRef = ref(storage, `users/${userId}/boards/${filename}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
