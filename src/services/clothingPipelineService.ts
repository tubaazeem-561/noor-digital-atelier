import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { addClosetItem } from './firestoreService';
import { uploadClothingImage } from './storageService';
import { Garment, GarmentCategory } from '../types';
import { removeStudioBackground } from '../utils/imageProcessing';

export interface ProcessedClothingResult {
  garment: Garment;
  firestoreCategory: 'head' | 'hijab' | 'torso' | 'bottoms' | 'feet' | 'accessories';
  imageUrl: string;
}

/**
 * Maps Firestore/Gemini 6-category classification to App GarmentCategory
 */
export function mapFirestoreCategoryToGarmentCategory(
  cat: string,
  userGender?: string
): GarmentCategory {
  switch (cat) {
    case 'head':
      return 'accessories';
    case 'hijab':
      return 'hijab';
    case 'torso':
      return userGender === 'man' ? 'shirts/t-shirts' : 'tops';
    case 'bottoms':
      return 'bottoms';
    case 'feet':
      return 'shoes';
    case 'accessories':
      return 'accessories';
    default:
      return 'tops';
  }
}

/**
 * Helper to wrap any promise with a hard timeout and fallback result.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => {
      console.warn(`[Pipeline Timeout] Operation exceeded ${ms}ms limit — returning fallback.`);
      resolve(fallbackValue);
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        console.warn(`[Pipeline Error] Operation failed:`, err);
        resolve(fallbackValue);
      });
  });
}

/**
 * Uploads a clothing photo to the AI Pipeline:
 * 1. Invokes the processClothingUpload Cloud Function to call Gemini 2.5 Flash server-side (6s timeout).
 * 2. Receives background-normalized image asset & category classification.
 * 3. Saves item in Firestore & Storage with strict timeouts.
 * 4. Returns ready-to-render Garment object for the UI.
 */
export async function uploadAndProcessClothingPhoto(
  fileOrBase64: File | string,
  suggestedName?: string,
  userUid: string = 'demo-user',
  userGender?: string
): Promise<ProcessedClothingResult> {
  let base64Data = '';
  let mimeType = 'image/jpeg';

  if (typeof fileOrBase64 === 'string') {
    base64Data = fileOrBase64;
    const match = fileOrBase64.match(/^data:(image\/\w+);base64,/);
    if (match) {
      mimeType = match[1];
    }
  } else {
    mimeType = fileOrBase64.type || 'image/jpeg';
    try {
      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64);
      });
    } catch (e) {
      console.warn('FileReader failed:', e);
    }
  }

  // Process base64 photo to produce transparent studio cutout
  if (base64Data) {
    try {
      base64Data = await removeStudioBackground(base64Data);
    } catch (bgErr) {
      console.warn('Transparent cutout processing fallback:', bgErr);
    }
  }

  // Fallback default image URL in case base64 conversion fails
  const localBlobUrl = typeof fileOrBase64 !== 'string' ? URL.createObjectURL(fileOrBase64) : fileOrBase64;
  const initialUrl = base64Data || localBlobUrl;

  // 1. Attempt Cloud Function call with 12s timeout
  try {
    const processFn = httpsCallable<
      { imageBase64: string; mimeType: string; suggestedName?: string },
      {
        success: boolean;
        item: {
          id: string;
          owner: string;
          category: 'head' | 'hijab' | 'torso' | 'bottoms' | 'feet' | 'accessories';
          imageUrl: string;
          name: string;
          color?: string;
          createdAt: string;
        };
      }
    >(functions, 'processClothingUpload');

    const res = await withTimeout(
      processFn({
        imageBase64: base64Data,
        mimeType: 'image/png',
        suggestedName
      }),
      20000, // 20 seconds timeout for Cloud Function
      null
    );

    if (res && res.data && res.data.success && res.data.item) {
      const item = res.data.item;
      const mappedCategory = mapFirestoreCategoryToGarmentCategory(item.category, userGender);

      const garment: Garment = {
        id: item.id,
        name: item.name || suggestedName || 'Wardrobe Piece',
        brand: 'Personal Closet',
        category: mappedCategory as any,
        image: item.imageUrl,
        color: item.color || '#E8DED8',
        material: 'Personal Wardrobe',
        notes: `AI Classified: ${item.category}`,
        isArchived: false,
        tags: [item.category, mappedCategory]
      };

      return {
        garment,
        firestoreCategory: item.category,
        imageUrl: item.imageUrl
      };
    }
  } catch (cloudErr) {
    console.warn('Cloud Function unavailable or fallback mode active:', cloudErr);
  }

  // 2. Fallback Pipeline: Storage (3s timeout) + Firestore (3s timeout)
  const itemId = `garment-${Date.now()}`;
  let finalUrl = initialUrl;

  if (typeof fileOrBase64 !== 'string') {
    finalUrl = await withTimeout(
      uploadClothingImage(fileOrBase64, userUid),
      3000, // 3 seconds timeout for Storage client upload
      initialUrl
    );
  }

  const defaultCategory: 'torso' = 'torso';
  const mappedCategory = mapFirestoreCategoryToGarmentCategory(defaultCategory, userGender);

  // Write to Firestore with 3s timeout
  const firestoreDocId = await withTimeout(
    addClosetItem({
      owner: userUid,
      category: defaultCategory,
      imageUrl: finalUrl,
      name: suggestedName || 'Wardrobe Piece'
    }),
    3000, // 3 seconds timeout for Firestore document write
    null
  );

  if (!firestoreDocId) {
    throw new Error('Fallback Firestore write failed or timed out');
  }

  const garment: Garment = {
    id: itemId,
    name: suggestedName || 'Personal Closet Piece',
    brand: 'Personal Closet',
    category: mappedCategory as any,
    image: finalUrl,
    color: '#E8DED8',
    material: 'Uploaded Piece',
    notes: 'Personal Wardrobe',
    isArchived: false,
    tags: ['Personal']
  };

  return {
    garment,
    firestoreCategory: defaultCategory,
    imageUrl: finalUrl
  };
}
