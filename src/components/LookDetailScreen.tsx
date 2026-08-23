import React, { useState } from 'react';
import { Look, Garment } from '../types';

interface LookDetailScreenProps {
  look: Look;
  onBack: () => void;
  onToggleSaveLook: (lookId: string) => void;
  onModifyInStudio: (look: Look) => void;
  onSelectGarment: (garment: Garment) => void;
}

export const LookDetailScreen: React.FC<LookDetailScreenProps> = ({
  look,
  onBack,
  onToggleSaveLook,
  onModifyInStudio,
  onSelectGarment
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 font-serif text-sm text-[var(--theme-body)] hover:text-[var(--theme-heading)] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Collection</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleSaveLook(look.id)}
            className={`px-5 py-2.5 rounded-full font-serif text-sm transition-all flex items-center gap-2 border cursor-pointer ${
              look.isSaved
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] border-[var(--theme-primary)] shadow-[var(--theme-shadow-sm)] font-semibold'
                : 'bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] text-[var(--theme-heading)] border-[var(--theme-border)]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {look.isSaved ? 'bookmark_added' : 'bookmark_border'}
            </span>
            <span>{look.isSaved ? 'Saved in Archives' : 'Save Look'}</span>
          </button>

          <button
            onClick={() => onModifyInStudio(look)}
            className="px-5 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm transition-all flex items-center gap-2 shadow-[var(--theme-shadow-sm)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Modify in Studio</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-3">
        <span className="font-sans text-xs text-[var(--theme-primary)] uppercase tracking-widest font-semibold block">
          {look.ensembleNumber || 'ENSEMBLE 04'}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[var(--theme-heading)] font-normal tracking-tight">
          {look.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--theme-body)] font-sans">
          <span className="font-medium text-[var(--theme-heading)]">Occasion:</span>
          <span>{look.occasion}</span>
          <span className="text-[var(--theme-muted)]">•</span>
          <span className="font-medium text-[var(--theme-heading)]">Vibe:</span>
          <span>{look.vibe}</span>
          {look.edition && (
            <>
              <span className="text-[var(--theme-muted)]">•</span>
              <span className="font-sans text-xs font-semibold text-[var(--theme-primary)]">{look.edition}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Visual and Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Arch-framed Hero Editorial Image */}
        <div className="lg:col-span-6 relative">
          <div className="relative overflow-hidden rounded-t-[140px] rounded-b-[28px] bg-[var(--theme-surface-subtle)] aspect-[3/4] shadow-[var(--theme-shadow-lg)] border-4 border-[var(--theme-surface)]">
            <img
              src={look.image}
              alt={look.title}
              className="w-full h-full object-cover object-center filter saturate-[0.98]"
            />

            {/* Vertical NOOR AI Branding */}
            <div className="absolute top-12 right-6 text-white/90 text-xs font-sans uppercase tracking-[0.3em] [writing-mode:vertical-lr] drop-shadow-md">
              NOOR ATELIER
            </div>

            {/* Subtle Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

            {/* Bottom floating tag pills */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
              {look.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-sans uppercase tracking-wider transition-all backdrop-blur-md cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-medium shadow-[var(--theme-shadow-sm)]'
                      : 'bg-white/90 text-[#3D0A24] hover:bg-white border border-[var(--theme-border)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Analysis & Garment Breakdown */}
        <div className="lg:col-span-6 space-y-8">
          {/* Editorial Description */}
          <div className="bg-[var(--theme-surface)] p-8 rounded-3xl border border-[var(--theme-border)] space-y-4 shadow-[var(--theme-shadow-sm)]">
            <h3 className="font-serif text-2xl text-[var(--theme-heading)]">
              Curatorial Commentary
            </h3>
            <p className="font-sans text-[var(--theme-body)] text-base leading-relaxed">
              {look.description}
            </p>

            {look.stylingNotes && (
              <div className="pt-4 border-t border-[var(--theme-border)] space-y-1.5">
                <span className="font-sans text-xs text-[var(--theme-primary)] uppercase tracking-widest font-semibold block">
                  Stylist Notes
                </span>
                <p className="font-sans text-sm text-[var(--theme-body)] italic">
                  "{look.stylingNotes}"
                </p>
              </div>
            )}
          </div>

          {/* Composed Wardrobe Pieces */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-[var(--theme-heading)]">
                Layered Garments
              </h3>
              <span className="font-sans text-xs text-[var(--theme-body)]">
                {look.pieces?.length || 0} Pieces
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {look.pieces && look.pieces.length > 0 ? (
                look.pieces.map((piece) => (
                  <div
                    key={piece.id}
                    onClick={() => onSelectGarment(piece)}
                    className="p-3.5 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] cursor-pointer transition-all duration-200 flex items-center gap-3.5 group shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
                  >
                    <img
                      src={piece.image}
                      alt={piece.name}
                      className="w-16 h-18 object-cover rounded-xl bg-[var(--theme-surface-subtle)] flex-shrink-0 group-hover:scale-105 transition-transform border border-[var(--theme-border)]"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-sans text-[var(--theme-primary)] uppercase tracking-wider block font-semibold">
                        {piece.brand}
                      </span>
                      <h4 className="font-serif text-sm text-[var(--theme-heading)] group-hover:text-[var(--theme-primary)] truncate">
                        {piece.name}
                      </h4>
                      <p className="text-[11px] font-sans text-[var(--theme-body)] truncate">
                        {piece.material || piece.category}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-6 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] text-center text-sm text-[var(--theme-body)] font-sans">
                  Custom ensemble synthesis from NOOR digital archives.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

