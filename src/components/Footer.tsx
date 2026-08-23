import React from 'react';
import { NOOR_LOGO_URL } from '../data/initialData';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-[var(--theme-surface)] border-t border-[var(--theme-border)] py-12 px-6 lg:px-10 transition-colors duration-300">
      <div className="max-w-[1024px] mx-auto flex flex-col items-center text-center space-y-6">
        {/* Brand Badge */}
        <div className="flex items-center gap-2.5">
          <img
            alt="NOOR Logo"
            className="h-6 w-auto object-contain opacity-90"
            src={NOOR_LOGO_URL}
          />
          <span className="font-serif text-xl tracking-tight text-[var(--theme-heading)] italic font-light">
            NOOR <span className="font-semibold text-[var(--theme-primary)] not-italic">Atelier</span>
          </span>
        </div>

        {/* Heartfelt Message */}
        <p className="font-serif italic text-base sm:text-lg text-[var(--theme-heading)] max-w-xl leading-relaxed">
          “Crafted with love and inspiration by three students who believe in the beauty of thoughtful design.”
        </p>

        {/* Team Credits */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-1 text-xs font-sans uppercase tracking-widest text-[var(--theme-body)]">
          <span className="font-semibold text-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] px-4 py-1.5 rounded-full shadow-[var(--theme-shadow-sm)]">
            Tuba Azeem
          </span>
          <span className="text-[var(--theme-muted)] hidden sm:inline">•</span>
          <span className="font-semibold text-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] px-4 py-1.5 rounded-full shadow-[var(--theme-shadow-sm)]">
            Airah Falak
          </span>
          <span className="text-[var(--theme-muted)] hidden sm:inline">•</span>
          <span className="font-semibold text-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] px-4 py-1.5 rounded-full shadow-[var(--theme-shadow-sm)]">
            Harisa Tayyaba
          </span>
        </div>

        {/* Subtle Tagline */}
        <div className="pt-4 border-t border-[var(--theme-border)]/60 w-full max-w-md text-[11px] font-mono text-[var(--theme-muted)] tracking-wider">
          NOOR Digital Atelier • Bespoke AI Fashion Curation
        </div>
      </div>
    </footer>
  );
};

export default Footer;

