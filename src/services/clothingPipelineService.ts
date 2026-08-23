import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { addClosetItem } from './firestoreService';
import { uploadClothingImage } from './storageService';
import { Garment, GarmentCategory } from '../types';

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
 * Uploads a clothing photo to the AI Pipeline:
 * 1. Invokes the processClothingUpload Cloud Function to call Gemini 2.5 Flash server-side.
 * 2. Receives background-normalized image asset & category classification.
 * 3. Saves item in Firestore & Storage.
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
    base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }

  // Attempt Cloud Function call
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

    const res = await processFn({
      imageBase64: base64Data,
      mimeType,
      suggestedName
    });

    if (res.data && res.data.success && res.data.item) {
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

  // Fallback Pipeline: Storage + Firestore client SDK
  const itemId = `garment-${Date.now()}`;
  let finalUrl = base64Data;

  if (typeof fileOrBase64 !== 'string') {
    try {
      finalUrl = await uploadClothingImage(fileOrBase64, userUid);
    } catch (stErr) {
      console.warn('Firebase Storage client upload fallback:', stErr);
    }
  }

  const defaultCategory: 'torso' = 'torso';
  const mappedCategory = mapFirestoreCategoryToGarmentCategory(defaultCategory, userGender);

  // Write to Firestore
  try {
    await addClosetItem({
      owner: userUid,
      category: defaultCategory,
      imageUrl: finalUrl,
      name: suggestedName || 'Wardrobe Piece'
    });
  } catch (fsErr) {
    console.warn('Firestore addClosetItem fallback:', fsErr);
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
