import React, { useState } from 'react';
import { Garment, Look } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  garments: Garment[];
  looks: Look[];
  onSelectGarment: (garment: Garment) => void;
  onSelectLook: (look: Look) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  garments,
  looks,
  onSelectGarment,
  onSelectLook
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const matchedGarments = query
    ? garments.filter(
        (g) =>
          g.name.toLowerCase().includes(query.toLowerCase()) ||
          g.brand.toLowerCase().includes(query.toLowerCase()) ||
          (g.material && g.material.toLowerCase().includes(query.toLowerCase())) ||
          (g.tags && g.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
      )
    : [];

  const matchedLooks = query
    ? looks.filter(
        (l) =>
          l.title.toLowerCase().includes(query.toLowerCase()) ||
          l.occasion.toLowerCase().includes(query.toLowerCase()) ||
          l.vibe.toLowerCase().includes(query.toLowerCase()) ||
          l.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--theme-surface)] w-full max-w-2xl rounded-3xl p-6 border border-[var(--theme-border)] shadow-[var(--theme-shadow-lg)] space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Search Input Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-primary)]">
            search
          </span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search looks, garments, fabrics, designers..."
            className="w-full pl-12 pr-10 py-3.5 bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] focus:border-[var(--theme-border-hover)] rounded-full text-base text-[var(--theme-heading)] outline-none transition-all placeholder-[var(--theme-muted)]"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--theme-body)] hover:text-[var(--theme-heading)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Quick Search Chips */}
        {!query && (
          <div className="space-y-3">
            <span className="text-xs font-sans text-[var(--theme-body)] uppercase tracking-wider block font-semibold">
              Suggested Explorations
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Silk',
                'Tailored Suit',
                'Minimalist',
                'Quiet Luxury',
                'Evening Gala',
                'Cashmere',
                'Leather Boots'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setQuery(chip)}
                  className="px-3.5 py-1.5 bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] rounded-full text-xs font-serif text-[var(--theme-heading)] border border-[var(--theme-border)] transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div className="space-y-6">
            {/* Matched Looks */}
            {matchedLooks.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-sans uppercase tracking-wider text-[var(--theme-primary)] font-semibold">
                  Archived Looks ({matchedLooks.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchedLooks.map((look) => (
                    <div
                      key={look.id}
                      onClick={() => {
                        onSelectLook(look);
                        onClose();
                      }}
                      className="p-3 bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] cursor-pointer flex items-center gap-3 transition-colors shadow-[var(--theme-shadow-sm)]"
                    >
                      <img
                        src={look.image}
                        alt={look.title}
                        className="w-12 h-14 object-cover rounded-xl bg-white"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-sans uppercase tracking-wider text-[var(--theme-primary)] block font-semibold">
                          {look.ensembleNumber}
                        </span>
                        <h4 className="font-serif text-sm text-[var(--theme-heading)] truncate">
                          {look.title}
                        </h4>
                        <p className="text-xs text-[var(--theme-body)] truncate">
                          {look.occasion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Garments */}
            {matchedGarments.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-sans uppercase tracking-wider text-[var(--theme-primary)] font-semibold">
                  Wardrobe Pieces ({matchedGarments.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchedGarments.map((garment) => (
                    <div
                      key={garment.id}
                      onClick={() => {
                        onSelectGarment(garment);
                        onClose();
                      }}
                      className="p-3 bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] cursor-pointer flex items-center gap-3 transition-colors shadow-[var(--theme-shadow-sm)]"
                    >
                      <img
                        src={garment.image}
                        alt={garment.name}
                        className="w-12 h-14 object-cover rounded-xl bg-white"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-sans uppercase tracking-wider text-[var(--theme-primary)] block font-semibold">
                          {garment.brand}
                        </span>
                        <h4 className="font-serif text-sm text-[var(--theme-heading)] truncate">
                          {garment.name}
                        </h4>
                        <p className="text-xs text-[var(--theme-body)] truncate">
                          {garment.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchedLooks.length === 0 && matchedGarments.length === 0 && (
              <div className="text-center py-8 text-sm text-[var(--theme-body)] font-sans">
                No items found for "{query}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

