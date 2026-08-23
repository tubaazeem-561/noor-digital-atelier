import React from 'react';
import { Garment } from '../types';

interface GarmentDetailModalProps {
  garment: Garment | null;
  onClose: () => void;
  onStyleWithPiece: (garment: Garment) => void;
  onArchiveGarment?: (id: string) => void;
  onRestoreGarment?: (id: string) => void;
}

export const GarmentDetailModal: React.FC<GarmentDetailModalProps> = ({
  garment,
  onClose,
  onStyleWithPiece,
  onArchiveGarment,
  onRestoreGarment
}) => {
  if (!garment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--theme-surface)] w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-[var(--theme-border)] shadow-[var(--theme-shadow-lg)] space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-[var(--theme-primary)] uppercase tracking-widest font-semibold">
                {garment.category}
              </span>
              {garment.isArchived && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-sans uppercase tracking-wider bg-amber-100 text-amber-900 font-semibold">
                  Archived
                </span>
              )}
            </div>
            <h2 className="font-serif text-3xl text-[var(--theme-heading)] leading-tight mt-1">
              {garment.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] text-[var(--theme-heading)] flex items-center justify-center transition-colors border border-[var(--theme-border)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Garment Image */}
          <div className="sm:col-span-5 rounded-2xl overflow-hidden bg-[var(--theme-surface-subtle)] aspect-[3/4] border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)]">
            <img
              src={garment.image}
              alt={garment.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Details & Specifications */}
          <div className="sm:col-span-7 space-y-4">
            <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--theme-body)]">CATEGORY:</span>
                <span className="text-[var(--theme-heading)] uppercase font-semibold">
                  {garment.category}
                </span>
              </div>
              {garment.material && (
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--theme-body)]">MATERIAL:</span>
                  <span className="text-[var(--theme-heading)] font-semibold">
                    {garment.material}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--theme-body)]">STATUS:</span>
                <span className={`font-semibold ${garment.isArchived ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {garment.isArchived ? 'Archived (Hidden from styling)' : 'Active in Closet'}
                </span>
              </div>
            </div>

            {garment.notes && (
              <div className="space-y-1">
                <span className="text-xs font-sans uppercase tracking-wider text-[var(--theme-primary)] font-semibold">
                  Details & Notes
                </span>
                <p className="font-sans text-sm text-[var(--theme-body)] leading-relaxed">
                  {garment.notes}
                </p>
              </div>
            )}

            {garment.tags && garment.tags.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-sans uppercase tracking-wider text-[var(--theme-body)]">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {garment.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-[var(--theme-surface)] text-[var(--theme-primary)] border border-[var(--theme-border)] rounded-full text-[11px] font-sans uppercase tracking-wider font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              {!garment.isArchived ? (
                <>
                  <button
                    onClick={() => {
                      onStyleWithPiece(garment);
                      onClose();
                    }}
                    className="flex-1 py-3 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm transition-colors shadow-[var(--theme-shadow-sm)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>Style this Piece</span>
                  </button>

                  {onArchiveGarment && (
                    <button
                      onClick={() => {
                        onArchiveGarment(garment.id);
                        onClose();
                      }}
                      className="px-4 py-3 bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] text-[var(--theme-body)] hover:text-amber-800 border border-[var(--theme-border)] rounded-full font-sans text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Archive piece to hide from outfit recommendations"
                    >
                      <span className="material-symbols-outlined text-sm">archive</span>
                      <span>Archive</span>
                    </button>
                  )}
                </>
              ) : (
                onRestoreGarment && (
                  <button
                    onClick={() => {
                      onRestoreGarment(garment.id);
                      onClose();
                    }}
                    className="flex-1 py-3 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm transition-colors shadow-[var(--theme-shadow-sm)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">unarchive</span>
                    <span>Restore to Active Closet</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarmentDetailModal;
