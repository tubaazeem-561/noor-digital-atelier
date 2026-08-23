import React, { useState, useEffect } from 'react';
import { Garment, Look, UserSilhouette, StylingOccasionKey } from '../types';

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
  emoji: string;
  icon: string;
  subtitle: string;
  description: string;
  vibe: string;
}

const OCCASIONS: OccasionOption[] = [
  {
    key: 'Date Night',
    title: 'Date Night',
    emoji: '🌙',
    icon: 'nightlife',
    subtitle: 'For dates, dinner, romantic evenings, and intimate nights out.',
    description: 'Elevated silhouette pairing fluid textures with refined structure.',
    vibe: 'Romantic & Refined'
  },
  {
    key: 'Wedding Guest',
    title: 'Wedding Guest',
    emoji: '💐',
    icon: 'celebration',
    subtitle: 'For weddings, receptions, and elegant celebrations.',
    description: 'Sophisticated celebration attire balancing poise with celebratory grace.',
    vibe: 'Festive Elegance'
  },
  {
    key: 'Casual',
    title: 'Casual',
    emoji: '☀️',
    icon: 'wb_sunny',
    subtitle: 'For everyday outings, meetups, cafes, and relaxed moments.',
    description: 'Effortless comfort with clean, harmonic lines and casual poise.',
    vibe: 'Effortless & Relaxed'
  },
  {
    key: 'Professional / Formal',
    title: 'Professional / Formal',
    emoji: '💼',
    icon: 'work',
    subtitle: 'For work, meetings, presentations, interviews, and formal events.',
    description: 'Crisp sartorial tailoring with sharp focus and understated authority.',
    vibe: 'Tailored Authority'
  },
  {
    key: 'Gym',
    title: 'Gym',
    emoji: '🏋️',
    icon: 'fitness_center',
    subtitle: 'For workouts, training, yoga, and athletic movement.',
    description: 'Breathable, flexible athletic pairing for peak dynamic comfort.',
    vibe: 'Athletic & Active'
  },
  {
    key: 'Festive / Party',
    title: 'Festive / Party',
    emoji: '🎉',
    icon: 'festival',
    subtitle: 'For festivals, parties, birthdays, galas, and special milestones.',
    description: 'Vibrant statement curation with tactile energy and celebratory flair.',
    vibe: 'Glamorous & Expressive'
  }
];

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

  // Manual Studio Layers State
  const [studioLayers, setStudioLayers] = useState<{
    tops?: Garment;
    bottoms?: Garment;
    dresses?: Garment;
    shoes?: Garment;
    bags?: Garment;
    accessories?: Garment;
  }>(() => {
    const initial: any = {};
    initialSelectedIds.forEach((id) => {
      const g = garments.find((item) => item.id === id);
      if (g && !g.isArchived) {
        if (g.category === 'tops') initial.tops = g;
        else if (g.category === 'bottoms') initial.bottoms = g;
        else if (g.category === 'dresses') initial.dresses = g;
        else if (g.category === 'shoes') initial.shoes = g;
        else if (g.category === 'bags') initial.bags = g;
        else if (g.category === 'accessories') initial.accessories = g;
      }
    });
    return initial;
  });

  const [studioFilter, setStudioFilter] = useState<'all' | 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'bags' | 'accessories'>('all');

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

      // If we could not put together at least 2 distinct pieces, fail gracefully with the requested fallback
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

  // Studio Layer helpers
  const handleAssignStudioPiece = (garment: Garment) => {
    setStudioLayers((prev) => {
      const updated = { ...prev };
      if (garment.category === 'tops') updated.tops = garment;
      else if (garment.category === 'bottoms') updated.bottoms = garment;
      else if (garment.category === 'dresses') updated.dresses = garment;
      else if (garment.category === 'shoes') updated.shoes = garment;
      else if (garment.category === 'bags') updated.bags = garment;
      else if (garment.category === 'accessories') updated.accessories = garment;
      return updated;
    });
  };

  const handleRemoveStudioLayer = (cat: keyof typeof studioLayers) => {
    setStudioLayers((prev) => {
      const updated = { ...prev };
      delete updated[cat];
      return updated;
    });
  };

  const handleSaveStudioLook = () => {
    const pieces = Object.values(studioLayers).filter(Boolean) as Garment[];
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
                  <div className="flex items-center justify-between">
                    <span className="text-3xl sm:text-4xl">{occ.emoji}</span>
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
                <span>{selectedOccasion.emoji}</span>
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
            /* ----------------------------------------------------------- */
            /* FALLBACK STATE FOR INCOMPLETE OUTFITS                       */
            /* ----------------------------------------------------------- */
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
            /* ----------------------------------------------------------- */
            /* SUCCESS STATE: COMPLETE LOOK SYNTHESIZED FROM USER CLOSET   */
            /* ----------------------------------------------------------- */
            generatedResultLook && (
              <div className="space-y-8">
                {/* Result Title & Confidence Affirmation */}
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

                {/* Garments Visual Grid: Large, attractive cards showing uploaded clothes */}
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

                {/* Styling Note Banner */}
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

                {/* Action CTA Bar */}
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
      {/* VIEW 3: PIECE-BY-PIECE STUDIO CANVAS (OPTIONAL MANUAL MODE)   */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'studio' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
            <button
              onClick={() => setActiveMode('occasions')}
              className="inline-flex items-center gap-2 text-sm font-serif text-[var(--theme-body)] hover:text-[var(--theme-heading)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Occasions</span>
            </button>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-primary)] rounded-full text-xs font-sans uppercase tracking-widest font-semibold shadow-[var(--theme-shadow-sm)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]"></span>
              Studio Canvas
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Mannequin / Canvas Layer Stack */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[var(--theme-surface)] rounded-3xl p-6 border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-xs uppercase tracking-widest text-[var(--theme-primary)] font-semibold">
                    Current Ensemble
                  </span>
                  <span className="text-xs font-mono text-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] px-2.5 py-0.5 rounded-full">
                    {Object.values(studioLayers).filter(Boolean).length} Layers Selected
                  </span>
                </div>

                {/* Layered Visual Display */}
                <div className="relative aspect-[3/4] bg-[var(--theme-surface-subtle)] rounded-2xl overflow-hidden border border-[var(--theme-border)] shadow-inner flex flex-col justify-center items-center p-4">
                  <img
                    src={userSilhouette.photoUrl}
                    alt="Mannequin Silhouette"
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-25 blur-[1px]"
                  />

                  <div className="relative z-10 w-full h-full flex flex-col justify-between gap-2 overflow-y-auto py-2">
                    {studioLayers.dresses && (
                      <div className="relative p-2.5 bg-[var(--theme-surface)]/95 backdrop-blur-md rounded-xl border border-[var(--theme-border)] flex items-center gap-3 shadow-[var(--theme-shadow-sm)]">
                        <img
                          src={studioLayers.dresses.image}
                          alt={studioLayers.dresses.name}
                          className="w-12 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-sans text-[var(--theme-primary)] uppercase tracking-wider font-semibold block">
                            Dress
                          </span>
                          <p className="text-xs font-serif text-[var(--theme-heading)] truncate">
                            {studioLayers.dresses.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudioLayer('dresses')}
                          className="text-[var(--theme-muted)] hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    )}

                    {studioLayers.tops && (
                      <div className="relative p-2.5 bg-[var(--theme-surface)]/95 backdrop-blur-md rounded-xl border border-[var(--theme-border)] flex items-center gap-3 shadow-[var(--theme-shadow-sm)]">
                        <img
                          src={studioLayers.tops.image}
                          alt={studioLayers.tops.name}
                          className="w-12 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-sans text-[var(--theme-primary)] uppercase tracking-wider font-semibold block">
                            Top
                          </span>
                          <p className="text-xs font-serif text-[var(--theme-heading)] truncate">
                            {studioLayers.tops.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudioLayer('tops')}
                          className="text-[var(--theme-muted)] hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    )}

                    {studioLayers.bottoms && (
                      <div className="relative p-2.5 bg-[var(--theme-surface)]/95 backdrop-blur-md rounded-xl border border-[var(--theme-border)] flex items-center gap-3 shadow-[var(--theme-shadow-sm)]">
                        <img
                          src={studioLayers.bottoms.image}
                          alt={studioLayers.bottoms.name}
                          className="w-12 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-sans text-[var(--theme-primary)] uppercase tracking-wider font-semibold block">
                            Bottom
                          </span>
                          <p className="text-xs font-serif text-[var(--theme-heading)] truncate">
                            {studioLayers.bottoms.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudioLayer('bottoms')}
                          className="text-[var(--theme-muted)] hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    )}

                    {studioLayers.shoes && (
                      <div className="relative p-2.5 bg-[var(--theme-surface)]/95 backdrop-blur-md rounded-xl border border-[var(--theme-border)] flex items-center gap-3 shadow-[var(--theme-shadow-sm)]">
                        <img
                          src={studioLayers.shoes.image}
                          alt={studioLayers.shoes.name}
                          className="w-12 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-sans text-[var(--theme-primary)] uppercase tracking-wider font-semibold block">
                            Shoes
                          </span>
                          <p className="text-xs font-serif text-[var(--theme-heading)] truncate">
                            {studioLayers.shoes.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudioLayer('shoes')}
                          className="text-[var(--theme-muted)] hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    )}

                    {studioLayers.bags && (
                      <div className="relative p-2.5 bg-[var(--theme-surface)]/95 backdrop-blur-md rounded-xl border border-[var(--theme-border)] flex items-center gap-3 shadow-[var(--theme-shadow-sm)]">
                        <img
                          src={studioLayers.bags.image}
                          alt={studioLayers.bags.name}
                          className="w-12 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-sans text-[var(--theme-primary)] uppercase tracking-wider font-semibold block">
                            Bag
                          </span>
                          <p className="text-xs font-serif text-[var(--theme-heading)] truncate">
                            {studioLayers.bags.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudioLayer('bags')}
                          className="text-[var(--theme-muted)] hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    )}

                    {studioLayers.accessories && (
                      <div className="relative p-2.5 bg-[var(--theme-surface)]/95 backdrop-blur-md rounded-xl border border-[var(--theme-border)] flex items-center gap-3 shadow-[var(--theme-shadow-sm)]">
                        <img
                          src={studioLayers.accessories.image}
                          alt={studioLayers.accessories.name}
                          className="w-12 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-sans text-[var(--theme-primary)] uppercase tracking-wider font-semibold block">
                            Accessory
                          </span>
                          <p className="text-xs font-serif text-[var(--theme-heading)] truncate">
                            {studioLayers.accessories.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudioLayer('accessories')}
                          className="text-[var(--theme-muted)] hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    )}

                    {Object.values(studioLayers).filter(Boolean).length === 0 && (
                      <div className="text-center p-6 space-y-2">
                        <span className="material-symbols-outlined text-4xl text-[var(--theme-muted)]">
                          drag_indicator
                        </span>
                        <p className="font-serif text-sm text-[var(--theme-heading)]">
                          Select clothes from your wardrobe on the right to layer this look.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSaveStudioLook}
                  className="w-full py-3.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-base transition-all shadow-[var(--theme-shadow-sm)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>Save Look</span>
                </button>
              </div>
            </div>

            {/* Closet Wardrobe Selector */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl text-[var(--theme-heading)]">
                  Your Closet Pieces
                </h3>

                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {(['all', 'tops', 'bottoms', 'dresses', 'shoes', 'bags', 'accessories'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setStudioFilter(cat)}
                      className={`px-3.5 py-1 rounded-full text-xs font-sans uppercase tracking-wider transition-all cursor-pointer ${
                        studioFilter === cat
                          ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-semibold shadow-[var(--theme-shadow-sm)]'
                          : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-body)] hover:text-[var(--theme-heading)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of active clothes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[580px] overflow-y-auto pr-1">
                {activeCloset
                  .filter((g) => studioFilter === 'all' || g.category === studioFilter)
                  .map((garment) => {
                    const isLayered = (Object.values(studioLayers) as (Garment | undefined)[]).some(
                      (l) => l?.id === garment.id
                    );

                    return (
                      <div
                        key={garment.id}
                        onClick={() => handleAssignStudioPiece(garment)}
                        className={`p-3 rounded-2xl bg-[var(--theme-surface)] border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          isLayered
                            ? 'border-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] ring-2 ring-[var(--theme-primary)]/40'
                            : 'border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] hover:shadow-[var(--theme-shadow-sm)]'
                        }`}
                      >
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[var(--theme-surface-subtle)] mb-2 border border-[var(--theme-border)]">
                          <img
                            src={garment.image}
                            alt={garment.name}
                            className="w-full h-full object-cover object-center"
                          />
                          <span className="absolute top-2 right-2 px-2 py-0.5 bg-[var(--theme-glass)] backdrop-blur-xs rounded text-[9px] font-sans uppercase tracking-wider font-semibold border border-[var(--theme-border)] text-[var(--theme-heading)]">
                            {garment.category}
                          </span>
                          {isLayered && (
                            <div className="absolute inset-0 bg-[var(--theme-primary)]/30 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="w-8 h-8 rounded-full bg-[var(--theme-primary)] text-[var(--theme-primary-text)] flex items-center justify-center shadow-[var(--theme-shadow-sm)]">
                                <span className="material-symbols-outlined text-sm">check</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-serif text-sm text-[var(--theme-heading)] truncate">
                            {garment.name}
                          </h4>
                          <p className="font-sans text-xs text-[var(--theme-body)] truncate">
                            {garment.material || garment.notes || garment.brand || 'Personal item'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleScreen;
