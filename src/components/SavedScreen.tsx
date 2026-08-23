import React, { useState } from 'react';
import { Look } from '../types';

interface SavedScreenProps {
  looks: Look[];
  onSelectLook: (look: Look) => void;
  onToggleSaveLook: (lookId: string, e: React.MouseEvent) => void;
  onCreateNewLook: () => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({
  looks,
  onSelectLook,
  onToggleSaveLook,
  onCreateNewLook
}) => {
  const [filterVibe, setFilterVibe] = useState<string>('all');
  const [filterOccasion, setFilterOccasion] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const vibes = ['all', 'Romantic Drama', 'Quiet Luxury', 'Sartorial Minimalist', 'Effortless Minimalist', 'Couture Silhouette'];

  const filteredLooks = looks.filter((look) => {
    const matchesVibe = filterVibe === 'all' || look.vibe === filterVibe;
    const matchesOccasion =
      filterOccasion === 'all' ||
      look.occasion.toLowerCase().includes(filterOccasion.toLowerCase());
    return matchesVibe && matchesOccasion;
  });

  return (
    <div className="space-y-10 pb-16 animate-fadeIn">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] text-[var(--theme-primary)] rounded-full text-xs font-sans uppercase tracking-widest font-semibold shadow-[var(--theme-shadow-sm)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]"></span>
          Curated Repository
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl text-[var(--theme-heading)] font-normal tracking-tight">
              Archives
            </h1>
            <p className="font-sans text-[var(--theme-body)] text-base sm:text-lg max-w-xl mt-1">
              A permanent repository of your curated looks, runway notes, and seasonal ensembles.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-5 py-2.5 rounded-full font-serif text-sm transition-all flex items-center gap-2 border cursor-pointer ${
                showFilterMenu || filterVibe !== 'all'
                  ? 'bg-[var(--theme-surface-subtle)] border-[var(--theme-border-hover)] text-[var(--theme-primary)]'
                  : 'bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] border-[var(--theme-border)] text-[var(--theme-heading)]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>Filter</span>
              {filterVibe !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)]"></span>
              )}
            </button>

            <button
              onClick={onCreateNewLook}
              className="px-6 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm transition-all flex items-center gap-2 shadow-[var(--theme-shadow-sm)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Create Look</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Options Bar */}
      {showFilterMenu && (
        <div className="p-4 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] space-y-3 animate-fadeIn shadow-[var(--theme-shadow-sm)]">
          <span className="font-sans text-xs text-[var(--theme-primary)] uppercase tracking-widest font-semibold block">
            Filter by Vibe
          </span>
          <div className="flex flex-wrap gap-2">
            {vibes.map((vibe) => (
              <button
                key={vibe}
                onClick={() => setFilterVibe(vibe)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider transition-all border cursor-pointer ${
                  filterVibe === vibe
                    ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] border-[var(--theme-primary)] font-semibold'
                    : 'bg-[var(--theme-surface-subtle)] text-[var(--theme-body)] border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] hover:text-[var(--theme-heading)]'
                }`}
              >
                {vibe === 'all' ? 'All Vibes' : vibe}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Masonry-Style Responsive Editorial Grid */}
      {filteredLooks.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredLooks.map((look) => {
            const aspectClass =
              look.aspectRatio === 'tall'
                ? 'aspect-[3/4.2]'
                : look.aspectRatio === 'wide'
                ? 'aspect-[4/3]'
                : 'aspect-square';

            return (
              <div
                key={look.id}
                onClick={() => onSelectLook(look)}
                className="break-inside-avoid group relative rounded-3xl overflow-hidden bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] transition-all duration-300 cursor-pointer shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)] flex flex-col"
              >
                {/* Image Frame */}
                <div className={`relative w-full ${aspectClass} overflow-hidden bg-[var(--theme-surface-subtle)]`}>
                  <img
                    src={look.image}
                    alt={look.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter saturate-[0.98]"
                  />

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-70 group-hover:opacity-85 transition-opacity"></div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => onToggleSaveLook(look.id, e)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-[var(--theme-heading)] hover:text-[var(--theme-primary)] flex items-center justify-center transition-all shadow-[var(--theme-shadow-sm)] border border-[var(--theme-border)] cursor-pointer"
                    title={look.isSaved ? 'Remove from Saved' : 'Save to Archives'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {look.isSaved ? 'bookmark_added' : 'bookmark_border'}
                    </span>
                  </button>

                  {/* Styled by Noor Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-sans tracking-widest uppercase text-[var(--theme-primary)] font-semibold border border-[var(--theme-border)]">
                    Styled by Noor
                  </div>

                  {/* Bottom overlay title info on image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 block">
                      {look.ensembleNumber || 'ATELIER LOOK'}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal leading-tight drop-shadow-sm group-hover:text-white transition-colors">
                      {look.title}
                    </h3>
                    <p className="text-xs text-white/80 font-sans line-clamp-1">
                      {look.occasion} • {look.vibe}
                    </p>

                    {/* Piece Thumbnails Strip */}
                    {look.pieces && look.pieces.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {look.pieces.slice(0, 4).map((p) => (
                          <img
                            key={p.id}
                            src={p.image}
                            alt={p.name}
                            className="w-7 h-7 rounded-lg object-cover border border-white/40 shadow-sm bg-black/20"
                            title={p.name}
                          />
                        ))}
                        {look.pieces.length > 4 && (
                          <span className="text-[10px] font-sans font-semibold text-white/90 bg-black/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                            +{look.pieces.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-border)] space-y-4 shadow-[var(--theme-shadow-sm)]">
          <span className="material-symbols-outlined text-4xl text-[var(--theme-muted)]">
            bookmark_border
          </span>
          <h3 className="font-serif text-2xl text-[var(--theme-heading)]">
            No Archived Looks Found
          </h3>
          <p className="font-sans text-sm text-[var(--theme-body)] max-w-sm mx-auto">
            Try changing the filter parameters or create a new ensemble using the NOOR AI Stylist.
          </p>
          <button
            onClick={onCreateNewLook}
            className="px-6 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm shadow-[var(--theme-shadow-sm)] cursor-pointer"
          >
            Create Your First Look
          </button>
        </div>
      )}
    </div>
  );
};

