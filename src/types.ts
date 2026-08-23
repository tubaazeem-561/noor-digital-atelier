export type TabType = 'home' | 'photo' | 'closet' | 'style' | 'look-detail' | 'saved';

export type GenderPreference = 'woman' | 'man' | 'others';

export type GarmentCategory =
  | 'all'
  | 'tops'
  | 'shirts/t-shirts'
  | 'bottoms'
  | 'accessories'
  | 'bags'
  | 'shoes'
  | 'hijab'
  | 'tie'
  | 'dresses';

export type StylingOccasionKey =
  | 'Date Night'
  | 'Wedding Guest'
  | 'Casual'
  | 'Professional / Formal'
  | 'Gym'
  | 'Festive / Party';

export interface Garment {
  id: string;
  name: string;
  brand?: string;
  category: 'tops' | 'shirts/t-shirts' | 'bottoms' | 'accessories' | 'bags' | 'shoes' | 'hijab' | 'tie' | 'dresses';
  image: string;
  color?: string;
  material?: string;
  notes?: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface Look {
  id: string;
  ensembleNumber: string;
  title: string;
  subtitle?: string;
  occasion: string;
  vibe: string;
  description: string;
  image: string;
  aspectRatio?: 'tall' | 'square' | 'wide';
  pieces: Garment[];
  tags: string[];
  isSaved: boolean;
  edition?: string;
  stylingNotes?: string;
}

export interface UserSilhouette {
  name: string;
  photoUrl: string;
  status: 'Portrait Active' | 'Analyzing' | 'Pending';
  lightingPassed: boolean;
  fullLengthPassed: boolean;
  aestheticScore: number;
  proportionsAnalysis: string;
}

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  avatarUrl: string;
  createdAt: string;
  genderPreference: GenderPreference;
  onboardingCompleted: boolean;
  silhouette: UserSilhouette;
  garments: Garment[];
  looks: Look[];
}

export interface StylingRequest {
  occasion: string;
  vibe: string;
  season?: string;
  colorTone?: string;
  additionalNotes?: string;
  selectedPiecesIds?: string[];
}
