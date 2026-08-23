import { Garment } from '../types';

export type OutfitSlot = 'head' | 'hijab' | 'torso' | 'bottoms' | 'feet' | 'accessories';

export interface ActiveOutfit {
  head?: Garment;
  hijab?: Garment;
  torso?: Garment;
  bottoms?: Garment;
  feet?: Garment;
  accessories?: Garment;
}

/**
 * Shared category reconciliation utility.
 * Maps any GarmentCategory or Firestore category string to an avatar OutfitSlot.
 */
export function mapCategoryToOutfitSlot(cat: string): OutfitSlot {
  const normalized = (cat || '').toLowerCase();
  switch (normalized) {
    case 'head':
      return 'head';
    case 'hijab':
      return 'hijab';
    case 'tops':
    case 'shirts/t-shirts':
    case 'dresses':
    case 'torso':
      return 'torso';
    case 'bottoms':
      return 'bottoms';
    case 'shoes':
    case 'feet':
      return 'feet';
    case 'accessories':
    case 'bags':
    case 'tie':
    default:
      return 'accessories';
  }
}

/**
 * Utility to convert an array of garments into an ActiveOutfit object.
 */
export function buildOutfitFromGarments(garments: Garment[]): ActiveOutfit {
  const outfit: ActiveOutfit = {};
  garments.forEach((garment) => {
    const slot = mapCategoryToOutfitSlot(garment.category);
    outfit[slot] = garment;
  });
  return outfit;
}
