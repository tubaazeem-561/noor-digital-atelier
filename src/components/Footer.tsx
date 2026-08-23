import React from 'react';
import { NOOR_LOGO_URL, THEME_PRESETS } from '../data/initialData';
import { GenderPreference } from '../types';

interface FooterProps {
  onOpenModal: (modal: 'journal' | 'sourcing' | 'fabric' | 'concierge' | 'privacy') => void;
  currentGender?: GenderPreference;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal, currentGender = 'woman' }) => {
  const preset = THEME_PRESETS[currentGender] || THEME_PRESETS.woman;

  return (
    <footer className="bg-[var(--theme-footer-bg)] text-[var(--theme-footer-text)] py-16 px-6 lg:px-10 border-t border-[var(--theme-footer-border)] transition-colors duration-300">
      <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img
              alt="NOOR"
              className="h-8 w-auto brightness-200"
              src={NOOR_LOGO_URL}
            />
            <span className="font-serif text-2xl font-light italic tracking-tight text-white">
              NOOR <span className="font-bold text-[var(--theme-accent-light)] not-italic">Atelier</span>
            </span>
          </div>
          <p className="font-sans text-xs text-white/70 max-w-sm leading-relaxed">
            The modern AI atelier where high romance meets haute intelligence. Curating beauty, poetic silhouette, and bespoke sartorial poise.
          </p>
        </div>

        <div className="flex flex-wrap gap-10 text-xs font-sans uppercase tracking-wider">
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-[var(--theme-accent-light)]">
              Atelier
            </span>
            <button
              onClick={() => onOpenModal('journal')}
              className="text-left text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              The Journal
            </button>
            <button
              onClick={() => onOpenModal('sourcing')}
              className="text-left text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Sourcing Guide
            </button>
            <button
              onClick={() => onOpenModal('fabric')}
              className="text-left text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Fabric Index
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-[var(--theme-accent-light)]">
              Client Service
            </span>
            <button
              onClick={() => onOpenModal('concierge')}
              className="text-left text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Concierge
            </button>
            <button
              onClick={() => onOpenModal('privacy')}
              className="text-left text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Privacy & Ethics
            </button>
            <span className="text-[10px] text-white/50 italic normal-case tracking-normal">Paris • Milan • London • New York</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1024px] mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[10px] font-sans uppercase tracking-widest text-white/60">
        <span>© 2025 NOOR HAUTE COUTURE INTELLIGENCE. ALL RIGHTS RESERVED.</span>
        <span className="mt-2 sm:mt-0 italic font-serif text-[var(--theme-accent-light)]">
          {preset.name} Identity Calibrated
        </span>
      </div>
    </footer>
  );
};

