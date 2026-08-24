import React, { useState, useEffect } from 'react';
import { Garment, Look, UserSilhouette, StylingOccasionKey } from '../types';
import {
  OutfitSlot,
  ActiveOutfit,
  mapCategoryToOutfitSlot
} from '../utils/categoryMapping';
import { removeStudioBackground } from '../utils/imageProcessing';
import { uploadBoardImage } from '../services/storageService';
import { FitCheckScreen } from './FitCheckScreen';

export interface LayerTransform {
  x: number;
  y: number;
  scale: number;
}

interface StyleScreenProps {
  garments: Garment[];
  userSilhouette: UserSilhouette;
  initialSelectedIds?: string[];
  onGenerateCustomLook: (look: Look) => void;
  onViewLookDetail: (look: Look) => void;
  onAddGarmentClick?: () => void;
}

interface OccasionOption {
  key: StylingOccasionKey;
  title: string;
  icon: string;
  subtitle: string;
  description: string;
  vibe: string;
}

const OCCASIONS: OccasionOption[] = [
  {
    key: 'Date Night',
    title: 'Date Night',
    icon: 'nightlife',
    subtitle: 'For dates, dinner, romantic evenings, and intimate nights out.',
    description: 'Elevated silhouette pairing fluid textures with refined structure.',
    vibe: 'Romantic & Refined'
  },
  {
    key: 'Wedding Guest',
    title: 'Wedding Guest',
    icon: 'celebration',
    subtitle: 'For weddings, receptions, and elegant celebrations.',
    description: 'Sophisticated celebration attire balancing poise with celebratory grace.',
    vibe: 'Festive Elegance'
  },
  {
    key: 'Casual',
    title: 'Casual',
    icon: 'wb_sunny',
    subtitle: 'For everyday outings, meetups, cafes, and relaxed moments.',
    description: 'Effortless comfort with clean, harmonic lines and casual poise.',
    vibe: 'Effortless & Relaxed'
  },
  {
    key: 'Professional / Formal',
    title: 'Professional / Formal',
    icon: 'work',
    subtitle: 'For work, meetings, presentations, interviews, and formal events.',
    description: 'Crisp sartorial tailoring with sharp focus and understated authority.',
    vibe: 'Tailored Authority'
  },
  {
    key: 'Gym',
    title: 'Gym',
    icon: 'fitness_center',
    subtitle: 'For workouts, training, yoga, and athletic movement.',
    description: 'Breathable, flexible athletic pairing for peak dynamic comfort.',
    vibe: 'Athletic & Active'
  },
  {
    key: 'Festive / Party',
    title: 'Festive / Party',
    icon: 'festival',
    subtitle: 'For festivals, parties, birthdays, galas, and special milestones.',
    description: 'Vibrant statement curation with tactile energy and celebratory flair.',
    vibe: 'Glamorous & Expressive'
  }
];

// Flat-Color SVG Silhouette Placeholders for empty flat-lay slots
const SlotPlaceholderSVG: React.FC<{ slot: OutfitSlot; className?: string }> = ({ slot, className = '' }) => {
  switch (slot) {
    case 'head':
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full text-[var(--theme-muted)]/40 ${className}`} fill="currentColor">
          <ellipse cx="50" cy="35" rx="16" ry="20" opacity="0.35" />
          <path d="M 34,32 C 34,18 66,18 66,32 C 66,42 34,42 34,32 Z" opacity="0.25" />
        </svg>
      );
    case 'hijab':
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full text-[var(--theme-muted)]/40 ${className}`} fill="currentColor">
          <path d="M 32,22 C 40,14 60,14 68,22 C 75,32 75,55 64,62 C 55,67 45,67 36,62 C 25,55 25,32 32,22 Z" opacity="0.3" />
        </svg>
      );
    case 'torso':
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full text-[var(--theme-muted)]/40 ${className}`} fill="currentColor">
          <path d="M 28,25 L 72,25 L 66,65 L 34,65 Z" opacity="0.35" />
          <path d="M 28,25 L 18,40 L 28,45 Z" opacity="0.25" />
          <path d="M 72,25 L 82,40 L 72,45 Z" opacity="0.25" />
        </svg>
      );
    case 'bottoms':
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full text-[var(--theme-muted)]/40 ${className}`} fill="currentColor">
          <path d="M 34,15 L 66,15 L 62,85 L 51,85 L 50,45 L 49,85 L 38,85 Z" opacity="0.35" />
        </svg>
      );
    case 'feet':
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full text-[var(--theme-muted)]/40 ${className}`} fill="currentColor">
          <ellipse cx="38" cy="65" rx="9" ry="16" opacity="0.35" />
          <ellipse cx="62" cy="65" rx="9" ry="16" opacity="0.35" />
        </svg>
      );
    case 'accessories':
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full text-[var(--theme-muted)]/40 ${className}`} fill="currentColor">
          <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
          <path d="M 50,30 L 50,20 M 50,70 L 50,80 M 30,50 L 20,50 M 70,50 L 80,50" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        </svg>
      );
  }
};

export const StyleScreen: React.FC<StyleScreenProps> = ({
  garments,
  userSilhouette,
  initialSelectedIds = [],
  onGenerateCustomLook,
  onViewLookDetail,
  onAddGarmentClick
}) => {
  // Mode: 'occasions' | 'result' | 'studio'
  const [activeMode, setActiveMode] = useState<'occasions' | 'result' | 'studio'>(
    initialSelectedIds.length > 0 ? 'studio' : 'occasions'
  );

  const [selectedOccasion, setSelectedOccasion] = useState<OccasionOption | null>(null);
  const [generatedResultLook, setGeneratedResultLook] = useState<Look | null>(null);
  const [cannotCompleteOutfit, setCannotCompleteOutfit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(0);

  // 2D Outfit Board Interaction State
  const [layerTransforms, setLayerTransforms] = useState<Record<string, LayerTransform>>({});
  const [dragState, setDragState] = useState<{
    slot: OutfitSlot | null;
    startX: number;
    startY: number;
    initialTransform: LayerTransform | null;
  }>({ slot: null, startX: 0, startY: 0, initialTransform: null });
  const [isCapturing, setIsCapturing] = useState(false);
  const boardRef = React.useRef<HTMLDivElement>(null);

  // Core Active Outfit State (head, hijab, torso, bottoms, feet, accessories)
  const [activeOutfit, setActiveOutfit] = useState<ActiveOutfit>(() => {
    const initial: ActiveOutfit = {};
    initialSelectedIds.forEach((id) => {
      const g = garments.find((item) => item.id === id);
      if (g && !g.isArchived) {
        const slot = mapCategoryToOutfitSlot(g.category);
        initial[slot] = g;
      }
    });
    return initial;
  });

  const [studioFilter, setStudioFilter] = useState<'all' | 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'bags' | 'accessories'>('all');

  // Process item images through background thresholding so they render as isolated cutouts on pure white canvas
  const [processedCutouts, setProcessedCutouts] = useState<Record<string, string>>({});

  useEffect(() => {
    (Object.values(activeOutfit) as (Garment | undefined)[]).forEach((item) => {
      if (item && item.image && !processedCutouts[item.id]) {
        const itemId = item.id;
        removeStudioBackground(item.image).then((cleaned) => {
          setProcessedCutouts((prev) => ({ ...prev, [itemId]: cleaned }));
        });
      }
    });
  }, [activeOutfit]);

  // Filter out any archived garments: NOOR strictly uses active unarchived clothes
  const activeCloset = garments.filter((g) => !g.isArchived);

  // Styling Engine: strictly synthesizes looks using the user's active garments
  const synthesizeLookForOccasion = (occasion: OccasionOption, shuffleSeed: number = 0) => {
    setSelectedOccasion(occasion);
    setIsGenerating(true);
    setCannotCompleteOutfit(false);

    setTimeout(() => {
      // Must have at least 2 active pieces to create a coherent look
      if (activeCloset.length < 2) {
        setCannotCompleteOutfit(true);
        setGeneratedResultLook(null);
        setIsGenerating(false);
        setActiveMode('result');
        return;
      }

      // Categorize available active pieces
      const tops = activeCloset.filter((g) => g.category === 'tops');
      const bottoms = activeCloset.filter((g) => g.category === 'bottoms');
      const dresses = activeCloset.filter((g) => g.category === 'dresses');
      const shoes = activeCloset.filter((g) => g.category === 'shoes');
      const bags = activeCloset.filter((g) => g.category === 'bags');
      const accessories = activeCloset.filter((g) => g.category === 'accessories');

      const selectedPieces: Garment[] = [];

      // Decide whether to style with a dress or top+bottom
      const preferDress =
        dresses.length > 0 &&
        (occasion.key === 'Wedding Guest' ||
          occasion.key === 'Date Night' ||
          occasion.key === 'Festive / Party' ||
          tops.length === 0 ||
          shuffleSeed % 2 === 1);

      if (preferDress && dresses.length > 0) {
        const dressIndex = shuffleSeed % dresses.length;
        selectedPieces.push(dresses[dressIndex]);
      } else {
        if (tops.length > 0) {
          const topIndex = shuffleSeed % tops.length;
          selectedPieces.push(tops[topIndex]);
        }
        if (bottoms.length > 0) {
          const botIndex = (shuffleSeed + 1) % bottoms.length;
          selectedPieces.push(bottoms[botIndex]);
        }
      }

      if (shoes.length > 0) {
        const shoeIndex = shuffleSeed % shoes.length;
        selectedPieces.push(shoes[shoeIndex]);
      }

      if (bags.length > 0 && (occasion.key === 'Date Night' || occasion.key === 'Wedding Guest' || occasion.key === 'Festive / Party' || occasion.key === 'Professional / Formal' || shuffleSeed % 2 === 0)) {
        const bagIndex = shuffleSeed % bags.length;
        selectedPieces.push(bags[bagIndex]);
      }

      if (accessories.length > 0) {
        const accIndex = shuffleSeed % accessories.length;
        selectedPieces.push(accessories[accIndex]);
      }

      // If we could not put together at least 2 distinct pieces, fail gracefully
      if (selectedPieces.length < 2) {
        setCannotCompleteOutfit(true);
        setGeneratedResultLook(null);
        setIsGenerating(false);
        setActiveMode('result');
        return;
      }

      // Successful look synthesis from user's own wardrobe
      const ensembleNumber = `Ensemble 0${((shuffleSeed + 3) % 9) + 1}`;
      const primaryPiece = selectedPieces[0];
      const lookTitle = `${occasion.title} Look`;
      const lookSubtitle = selectedPieces.map((p) => p.name).join(' • ');

      const newLook: Look = {
        id: `look-noor-${Date.now()}-${shuffleSeed}`,
        ensembleNumber,
        title: lookTitle,
        subtitle: lookSubtitle,
        occasion: occasion.key,
        vibe: occasion.vibe,
        description: `Curated exclusively from your personal wardrobe for ${occasion.title.toLowerCase()}. Balanced with your digital silhouette drape for effortless harmony.`,
        image: primaryPiece.image,
        aspectRatio: 'tall',
        pieces: selectedPieces,
        tags: ['Styled by Noor', occasion.title, 'Personal Wardrobe'],
        isSaved: false,
        edition: 'Atelier Personal Look',
        stylingNotes: `Pair your ${selectedPieces.map((p) => p.name).slice(0, 2).join(' with ')} to maintain clean proportions and effortless presence.`
      };

      setGeneratedResultLook(newLook);
      setCannotCompleteOutfit(false);
      setIsGenerating(false);
      setActiveMode('result');
    }, 500);
  };

  const handleShuffle = () => {
    if (!selectedOccasion) return;
    const nextShuffle = shuffleCount + 1;
    setShuffleCount(nextShuffle);
    synthesizeLookForOccasion(selectedOccasion, nextShuffle);
  };

  // Track broken/failed image loads per slot
  const [failedSlotImages, setFailedSlotImages] = useState<Record<string, boolean>>({});

  // Studio Outfit Layering: Swaps slot, or deselects if clicking already active item
  const handleAssignStudioPiece = (garment: Garment) => {
    const slot = mapCategoryToOutfitSlot(garment.category);
    // Reset failed image flag for this slot on new item selection
    setFailedSlotImages((prev) => ({ ...prev, [slot]: false }));

    setActiveOutfit((prev) => {
      if (prev[slot]?.id === garment.id) {
        const updated = { ...prev };
        delete updated[slot];
        return updated;
      }
      return {
        ...prev,
        [slot]: garment
      };
    });
  };

  const handleRemoveStudioLayer = (slot: OutfitSlot) => {
    setFailedSlotImages((prev) => ({ ...prev, [slot]: false }));
    setActiveOutfit((prev) => {
      const updated = { ...prev };
      delete updated[slot];
      return updated;
    });
  };

  const handleSaveStudioLook = () => {
    const pieces = Object.values(activeOutfit).filter(Boolean) as Garment[];
    if (pieces.length === 0) {
      alert('Please select at least one piece from your closet.');
      return;
    }

    const ensembleNumber = `Ensemble ${Math.floor(Math.random() * 90 + 10)}`;
    const newLook: Look = {
      id: `look-studio-${Date.now()}`,
      ensembleNumber,
      title: `${pieces[0].name} Curation`,
      subtitle: pieces.map((p) => p.name).join(' • '),
      occasion: 'Custom Styling',
      vibe: 'Personal Wardrobe Selection',
      description: `A custom-layered look assembled directly from your closet pieces: ${pieces.map((p) => p.name).join(', ')}.`,
      image: pieces[0].image,
      aspectRatio: 'tall',
      pieces,
      tags: ['Styled by User', 'Personal Wardrobe'],
      isSaved: true,
      edition: 'Bespoke Studio'
    };

    onGenerateCustomLook(newLook);
    onViewLookDetail(newLook);
  };

  // Drag and Scale Handlers
  const handlePointerDown = (e: React.PointerEvent, slot: OutfitSlot) => {
    e.preventDefault();
    // Only capture left click
    if (e.button !== 0) return;
    const transform = layerTransforms[slot] || { x: 0, y: 0, scale: 1 };
    setDragState({
      slot,
      startX: e.clientX,
      startY: e.clientY,
      initialTransform: { ...transform }
    });
    // Set pointer capture to the target so we can track moves outside the element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.slot || !dragState.initialTransform) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    setLayerTransforms((prev) => ({
      ...prev,
      [dragState.slot!]: {
        ...dragState.initialTransform!,
        x: dragState.initialTransform!.x + dx,
        y: dragState.initialTransform!.y + dy
      }
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState.slot) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    setDragState({ slot: null, startX: 0, startY: 0, initialTransform: null });
  };

  const handleWheel = (e: React.WheelEvent, slot: OutfitSlot) => {
    // Only allow wheel scale if there is an item
    if (!activeOutfit[slot]) return;
    e.preventDefault();
    setLayerTransforms((prev) => {
      const current = prev[slot] || { x: 0, y: 0, scale: 1 };
      const newScale = Math.max(0.3, Math.min(3, current.scale - e.deltaY * 0.005));
      return { ...prev, [slot]: { ...current, scale: newScale } };
    });
  };

  const handleSaveBoard = async () => {
    if (!boardRef.current) return;
    
    const pieces = Object.values(activeOutfit).filter(Boolean) as Garment[];
    if (pieces.length === 0) {
      alert('Please select at least one piece from your closet to save the board.');
      return;
    }

    setIsCapturing(true);
    try {
      const canvas = document.createElement('canvas');
      const rect = boardRef.current.getBoundingClientRect();
      canvas.width = 1000;
      canvas.height = (rect.height / rect.width) * 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const scaleFactor = canvas.width / rect.width;

      // Draw layers honoring z-index by iterating in order
      const sortedConfigs = [...FLAT_LAY_CONFIG].sort((a, b) => a.zIndex - b.zIndex);
      
      for (const config of sortedConfigs) {
        const item = activeOutfit[config.slot];
        if (!item || failedSlotImages[config.slot]) continue;
        
        const imgSrc = processedCutouts[item.id] || item.image;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imgSrc;
        
        await new Promise<void>((res) => { 
          img.onload = () => res(); 
          img.onerror = () => res(); 
        });
        
        const t = layerTransforms[config.slot] || { x: 0, y: 0, scale: 1 };
        const isDressWorn = activeOutfit.torso?.category === 'dresses';
        const wPct = parseFloat(config.width) / 100;
        const hPct = parseFloat(config.height(isDressWorn)) / 100;
        const topPct = parseFloat(config.top) / 100;
        const leftPct = parseFloat(config.left) / 100;
        
        const dw = canvas.width * wPct;
        const dh = canvas.height * hPct;
        
        const dx = leftPct * canvas.width + t.x * scaleFactor;
        const dy = topPct * canvas.height + t.y * scaleFactor;
        
        const cx = dx + dw / 2;
        const cy = dy + dh / 2;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(t.scale, t.scale);
        // Using 'multiply' here in case background removal wasn't 100% perfect, matching CSS
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }

      // Upload the generated canvas to Storage
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) throw new Error('Failed to generate image blob');
      
      // Assuming a generic user ID for now since auth might be mocked, wait... we don't have userId here.
      // But we can generate a random one if needed, or pass it down. 
      // Actually `saveLookToFirestore` in `App.tsx` handles the user context. Let's just create the Look 
      // and use the uploaded URL. But `uploadBoardImage` needs `userId`.
      // The current app stores it in `localStorage` or we can use a dummy for the test. Let's use 'user_local'
      const activeUserId = localStorage.getItem('noor_atelier_active_user_id_v3') || 'user_local';
      
      const imageUrl = await uploadBoardImage(blob, activeUserId);

      // Create new look record
      const ensembleNumber = `Board ${Math.floor(Math.random() * 900 + 100)}`;
      const newLook: Look = {
        id: `look-board-${Date.now()}`,
        ensembleNumber,
        title: `2D Outfit Board`,
        subtitle: pieces.map((p) => p.name).join(' • '),
        occasion: 'Custom Board',
        vibe: 'Curated Flat-lay',
        description: `An interactive outfit composition assembled directly from your closet pieces.`,
        image: imageUrl,
        aspectRatio: 'tall',
        pieces,
        tags: ['2D Board', 'Personal Wardrobe'],
        isSaved: true,
        edition: 'Bespoke Studio'
      };

      onGenerateCustomLook(newLook);
      onViewLookDetail(newLook);

    } catch (err) {
      console.error('Failed to capture and save board:', err);
      alert('Could not save the board. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Editorial Flat-Lay Spatial Layout Configuration
   * Arranges active cutouts in a clean, overlapping flat-lay collage style.
   */
  const FLAT_LAY_CONFIG: {
    slot: OutfitSlot;
    label: string;
    zIndex: number;
    top: string;
    left: string;
    width: string;
    height: (isDressWorn?: boolean) => string;
    alignClass: string;
  }[] = [
    {
      slot: 'head',
      label: 'Headwear',
      zIndex: 10,
      top: '2%',
      left: '30%',
      width: '40%',
      height: () => '24%',
      alignClass: 'object-contain object-center'
    },
    {
      slot: 'hijab',
      label: 'Hijab',
      zIndex: 15,
      top: '0%',
      left: '22%',
      width: '56%',
      height: () => '36%',
      alignClass: 'object-contain object-top'
    },
    {
      slot: 'torso',
      label: 'Top / Dress',
      zIndex: 30,
      top: '10%',
      left: '18%',
      width: '64%',
      height: (isDressWorn) => (isDressWorn ? '68%' : '50%'),
      alignClass: 'object-contain object-top'
    },
    {
      slot: 'bottoms',
      label: 'Bottoms',
      zIndex: 20,
      top: '38%',
      left: '24%',
      width: '52%',
      height: () => '46%',
      alignClass: 'object-contain object-top'
    },
    {
      slot: 'feet',
      label: 'Shoes',
      zIndex: 40,
      top: '72%',
      left: '54%',
      width: '36%',
      height: () => '24%',
      alignClass: 'object-contain object-bottom'
    },
    {
      slot: 'accessories',
      label: 'Bag / Accessories',
      zIndex: 50,
      top: '58%',
      left: '8%',
      width: '34%',
      height: () => '28%',
      alignClass: 'object-contain object-center'
    }
  ];

  const activeSlotCount = Object.values(activeOutfit).filter(Boolean).length;

  return (
    <div className="space-y-10 pb-16 animate-fadeIn">
      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: OCCASIONS SELECTOR (LET NOOR STYLE YOU ✨)             */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'occasions' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-primary)] rounded-full text-xs font-sans uppercase tracking-widest font-semibold shadow-[var(--theme-shadow-sm)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]"></span>
              Personal Styling Engine
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-serif text-4xl sm:text-5xl text-[var(--theme-heading)] font-normal tracking-tight">
                  Let NOOR Style You ✨
                </h1>
                <p className="font-sans text-[var(--theme-body)] text-base sm:text-lg max-w-2xl mt-1 leading-relaxed">
                  NOOR styles the clothes you already have in your closet. Pick an occasion below to create your look.
                </p>
              </div>

              {/* Option to assemble manually in studio */}
              <button
                onClick={() => setActiveMode('studio')}
                className="px-5 py-2.5 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] text-[var(--theme-heading)] border border-[var(--theme-border)] rounded-full text-xs font-sans uppercase tracking-wider font-semibold transition-all flex items-center gap-2 flex-shrink-0 shadow-[var(--theme-shadow-sm)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>Piece-by-Piece Studio</span>
              </button>
            </div>
          </div>

          {/* 6 Clean Occasion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OCCASIONS.map((occ, idx) => (
              <button
                key={occ.key}
                type="button"
                onClick={() => synthesizeLookForOccasion(occ, 0)}
                className="group p-6 sm:p-7 rounded-3xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] text-left transition-all duration-300 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)] flex flex-col justify-between h-[230px] cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-end">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] px-2.5 py-1 rounded-full">
                      0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl text-[var(--theme-heading)] group-hover:text-[var(--theme-primary)] transition-colors">
                      {occ.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[var(--theme-body)] mt-1.5 leading-relaxed">
                      {occ.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-serif text-xs sm:text-sm font-medium text-[var(--theme-primary)] group-hover:translate-x-1 transition-transform">
                  <span>Create {occ.title} Look</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Closet Snapshot */}
          <div className="p-5 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[var(--theme-body)] shadow-[var(--theme-shadow-sm)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--theme-primary)] text-lg">
                checkroom
              </span>
              <span>
                Styling from <strong className="text-[var(--theme-heading)]">{activeCloset.length} active pieces</strong> in your closet. NOOR never recommends items to buy.
              </span>
            </div>

            {onAddGarmentClick && (
              <button
                onClick={onAddGarmentClick}
                className="text-[var(--theme-primary)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                <span>+ Add More Clothes</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: RESULT VIEW (OUTFIT RECOMMENDATION OR FALLBACK)        */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'result' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
            <button
              onClick={() => {
                setActiveMode('occasions');
                setGeneratedResultLook(null);
                setCannotCompleteOutfit(false);
              }}
              className="inline-flex items-center gap-2 text-sm font-serif text-[var(--theme-body)] hover:text-[var(--theme-heading)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Choose Another Occasion</span>
            </button>

            {selectedOccasion && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-full text-xs font-sans text-[var(--theme-heading)]">
                <span className="font-semibold">{selectedOccasion.title}</span>
              </div>
            )}
          </div>

          {/* Loading Spinner */}
          {isGenerating ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-[var(--theme-border)] border-t-[var(--theme-primary)] rounded-full animate-spin mx-auto"></div>
              <p className="font-serif text-lg text-[var(--theme-heading)]">
                Synthesizing outfit from your closet...
              </p>
            </div>
          ) : cannotCompleteOutfit ? (
            <div className="max-w-lg mx-auto p-8 sm:p-12 text-center bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-border)] shadow-[var(--theme-shadow-md)] space-y-6">
              <div className="w-20 h-20 rounded-full bg-[var(--theme-surface-subtle)] text-[var(--theme-primary)] mx-auto flex items-center justify-center border border-[var(--theme-border)]">
                <span className="material-symbols-outlined text-4xl">checkroom</span>
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-2xl sm:text-3xl text-[var(--theme-heading)] leading-snug">
                  I couldn’t make a complete look from your closet yet.
                </h2>
                <p className="font-sans text-sm sm:text-base text-[var(--theme-body)]">
                  Try adding more clothes to your closet.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (onAddGarmentClick) onAddGarmentClick();
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm font-medium shadow-[var(--theme-shadow-md)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  <span>+ Add Clothes</span>
                </button>

                <button
                  onClick={() => setActiveMode('occasions')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] text-[var(--theme-heading)] border border-[var(--theme-border)] rounded-full font-serif text-sm cursor-pointer transition-colors"
                >
                  Try Another Occasion
                </button>
              </div>
            </div>
          ) : (
            generatedResultLook && (
              <div className="space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-primary)] rounded-full text-xs font-sans uppercase tracking-widest font-semibold shadow-[var(--theme-shadow-sm)]">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    Personal Closet Recommendation
                  </span>

                  <h2 className="font-serif text-3xl sm:text-5xl text-[var(--theme-heading)] font-normal tracking-tight">
                    Here’s your {selectedOccasion?.title} look ✨
                  </h2>

                  <p className="font-serif italic text-lg sm:text-xl text-[var(--theme-primary)] font-medium">
                    “You already have everything you need. ✨”
                  </p>

                  <p className="font-sans text-xs sm:text-sm text-[var(--theme-body)] leading-relaxed">
                    {generatedResultLook.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl text-[var(--theme-heading)]">
                      Your Outfit Pieces ({generatedResultLook.pieces.length})
                    </h3>
                    <span className="text-xs font-sans text-[var(--theme-muted)]">
                      100% from your saved wardrobe
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {generatedResultLook.pieces.map((piece, idx) => (
                      <div
                        key={piece.id || idx}
                        className="bg-[var(--theme-surface)] rounded-3xl overflow-hidden border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)] transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--theme-surface-subtle)]">
                          <img
                            src={piece.image}
                            alt={piece.name}
                            className="w-full h-full object-cover object-center"
                          />
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-[var(--theme-glass)] backdrop-blur-md rounded-full text-[10px] font-sans tracking-widest uppercase text-[var(--theme-heading)] font-semibold border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)]">
                            {piece.category}
                          </div>
                        </div>

                        <div className="p-4 space-y-1 bg-[var(--theme-surface)]">
                          <h4 className="font-serif text-base text-[var(--theme-heading)] truncate">
                            {piece.name}
                          </h4>
                          <p className="font-sans text-xs text-[var(--theme-body)] line-clamp-1">
                            {piece.material || piece.notes || piece.brand || 'Personal closet item'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {generatedResultLook.stylingNotes && (
                  <div className="p-5 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] flex items-start gap-3 shadow-[var(--theme-shadow-sm)]">
                    <span className="material-symbols-outlined text-[var(--theme-primary)] text-xl shrink-0 mt-0.5">
                      tips_and_updates
                    </span>
                    <div className="space-y-0.5">
                      <h5 className="font-serif text-sm font-semibold text-[var(--theme-heading)]">
                        Styling Tip
                      </h5>
                      <p className="font-sans text-xs text-[var(--theme-body)] leading-relaxed">
                        {generatedResultLook.stylingNotes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-[var(--theme-border)]">
                  <button
                    onClick={() => {
                      onGenerateCustomLook(generatedResultLook);
                      onViewLookDetail(generatedResultLook);
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm font-medium shadow-[var(--theme-shadow-sm)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-base">bookmark</span>
                    <span>Save Look to Archives</span>
                  </button>

                  <button
                    onClick={handleShuffle}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] text-[var(--theme-heading)] border border-[var(--theme-border)] rounded-full font-serif text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-[var(--theme-shadow-sm)]"
                  >
                    <span className="material-symbols-outlined text-base">shuffle</span>
                    <span>Try Another Combination</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveMode('occasions');
                      setGeneratedResultLook(null);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 text-xs font-sans uppercase tracking-wider text-[var(--theme-body)] hover:text-[var(--theme-heading)] cursor-pointer"
                  >
                    Pick Different Occasion
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: PIECE-BY-PIECE FIT CHECK STUDIO                      */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'studio' && (
        <div className="animate-fadeIn -mt-6">
          <FitCheckScreen 
            garments={garments} 
            onBack={() => setActiveMode('occasions')} 
          />
        </div>
      )}
    </div>
  );
};

export default StyleScreen;
