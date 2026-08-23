import React from 'react';

interface AtelierModalProps {
  modalType: 'journal' | 'sourcing' | 'fabric' | 'concierge' | 'privacy' | null;
  onClose: () => void;
}

export const AtelierModals: React.FC<AtelierModalProps> = ({
  modalType,
  onClose
}) => {
  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--theme-surface)] w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-[var(--theme-border)] shadow-[var(--theme-shadow-lg)] max-h-[85vh] overflow-y-auto space-y-6">
        <div className="flex justify-between items-center border-b border-[var(--theme-border)] pb-4">
          <span className="font-sans text-xs text-[var(--theme-primary)] uppercase tracking-widest font-semibold">
            NOOR Atelier Information
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-heading)] transition-colors border border-[var(--theme-border)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* The Journal */}
        {modalType === 'journal' && (
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-[var(--theme-heading)]">
              The Journal: Volume IV
            </h2>
            <div className="space-y-4 font-sans text-sm text-[var(--theme-body)] leading-relaxed">
              <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-1 shadow-[var(--theme-shadow-sm)]">
                <span className="text-[11px] font-sans uppercase tracking-wider text-[var(--theme-accent)] font-semibold">
                  Essay • October 2024
                </span>
                <h4 className="font-serif text-lg text-[var(--theme-heading)]">
                  The Architecture of Fluidity: Velvet Meets Bias Silk
                </h4>
                <p>
                  Exploring the historical dialogue between structured tailoring and unrestrained silk drapes in contemporary haute couture.
                </p>
              </div>
              <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-1 shadow-[var(--theme-shadow-sm)]">
                <span className="text-[11px] font-sans uppercase tracking-wider text-[var(--theme-accent)] font-semibold">
                  Curation Notes
                </span>
                <h4 className="font-serif text-lg text-[var(--theme-heading)]">
                  Dynamic Harmonization Across Visual Identities
                </h4>
                <p>
                  Why tailored bespoke palettes and structured silhouettes signify emotional resonance and sartorial strength in modern styling.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sourcing Guide */}
        {modalType === 'sourcing' && (
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-[var(--theme-heading)]">
              Atelier Sourcing Guide
            </h2>
            <p className="font-sans text-sm text-[var(--theme-body)] leading-relaxed">
              NOOR partners with historic mills across Biella, Como, Savile Row, and Lyon to catalog authentic weaves and ethical production certifications:
            </p>
            <ul className="space-y-2 text-sm font-sans text-[var(--theme-body)]">
              <li className="p-3 bg-[var(--theme-surface-subtle)] rounded-xl flex items-center gap-3 border border-[var(--theme-border)]">
                <span className="material-symbols-outlined text-[var(--theme-primary)]">verified</span>
                <span><strong className="text-[var(--theme-heading)]">Mulberry Silk:</strong> Sourced directly from certified organic sericulture in Lyon, France.</span>
              </li>
              <li className="p-3 bg-[var(--theme-surface-subtle)] rounded-xl flex items-center gap-3 border border-[var(--theme-border)]">
                <span className="material-symbols-outlined text-[var(--theme-primary)]">verified</span>
                <span><strong className="text-[var(--theme-heading)]">Virgin Wool & Mohair:</strong> Spun and carded in historic mills in Biella, Northern Italy.</span>
              </li>
              <li className="p-3 bg-[var(--theme-surface-subtle)] rounded-xl flex items-center gap-3 border border-[var(--theme-border)]">
                <span className="material-symbols-outlined text-[var(--theme-primary)]">verified</span>
                <span><strong className="text-[var(--theme-heading)]">Calfskin & Palladium:</strong> Full traceability leather ateliers adhering to zero-chromium tanning.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Fabric Index */}
        {modalType === 'fabric' && (
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-[var(--theme-heading)]">
              Fabric & Texture Index
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
              <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-1 shadow-[var(--theme-shadow-sm)]">
                <h4 className="font-serif text-base text-[var(--theme-heading)] font-semibold">
                  Cotton Gabardine
                </h4>
                <p className="text-[var(--theme-body)]">
                  A tight twill weave that offers natural water-resistance, firm structure, and sharp drape for trench coats.
                </p>
              </div>
              <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-1 shadow-[var(--theme-shadow-sm)]">
                <h4 className="font-serif text-base text-[var(--theme-heading)] font-semibold">
                  Silk Satin & Crepe
                </h4>
                <p className="text-[var(--theme-body)]">
                  Unmatched fluid movement with light-refracting luster, perfect for bias slip dresses and delicate camisoles.
                </p>
              </div>
              <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-1 shadow-[var(--theme-shadow-sm)]">
                <h4 className="font-serif text-base text-[var(--theme-heading)] font-semibold">
                  Plush Silk-Velvet & Wool
                </h4>
                <p className="text-[var(--theme-body)]">
                  Rich, deep light-absorbing pile that provides tactile luxury and deep chromatic resonance in curated hues.
                </p>
              </div>
              <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-1 shadow-[var(--theme-shadow-sm)]">
                <h4 className="font-serif text-base text-[var(--theme-heading)] font-semibold">
                  Baby Cashmere
                </h4>
                <p className="text-[var(--theme-body)]">
                  Ultra-fine underfleece from hircus kid goats, providing cloud-like insulation without unnecessary bulk.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Concierge */}
        {modalType === 'concierge' && (
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-[var(--theme-heading)]">
              Atelier Concierge
            </h2>
            <p className="font-sans text-sm text-[var(--theme-body)]">
              Connect directly with our master stylists in Paris or schedule an in-person measurement session.
            </p>
            <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-2 shadow-[var(--theme-shadow-sm)]">
              <span className="text-xs font-sans uppercase font-semibold text-[var(--theme-primary)]">
                Available Appointment Hours
              </span>
              <p className="text-xs text-[var(--theme-body)]">
                Monday – Saturday: 10:00 AM – 7:00 PM CET
              </p>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    alert('Consultation request sent to NOOR Atelier Concierge. A stylist will reach out within 2 hours.');
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-xs transition-colors shadow-[var(--theme-shadow-sm)] font-medium cursor-pointer"
                >
                  Request Private Consultation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        {modalType === 'privacy' && (
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-[var(--theme-heading)]">
              Privacy & Ethical AI Charter
            </h2>
            <p className="font-sans text-sm text-[var(--theme-body)] leading-relaxed">
              At NOOR, your biometric silhouettes and wardrobe ingestions remain private and encrypted. We never license, sell, or train public models on your personal silhouette scans.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--theme-border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm transition-colors shadow-[var(--theme-shadow-sm)] font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

