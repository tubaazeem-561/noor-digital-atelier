import React from 'react';
import { THEME_PRESETS } from '../data/initialData';
import { TabType, UserSilhouette, GenderPreference } from '../types';

interface HomeScreenProps {
  userSilhouette: UserSilhouette;
  onNavigate: (tab: TabType) => void;
  onQuickStyle: () => void;
  currentGender: GenderPreference;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userSilhouette,
  onNavigate,
  onQuickStyle,
  currentGender
}) => {
  const currentPreset = THEME_PRESETS[currentGender] || THEME_PRESETS.woman;

  const aiTagline: Record<GenderPreference, string> = {
    woman: 'Curating romantic silhouettes & silk drape...',
    man: 'Curating sartorial tailoring & midnight cashmere...',
    others: 'Curating architectural fluid drapes & volume...'
  };

  return (
    <div className="space-y-16 pb-12 animate-fadeIn">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-primary)] rounded-full text-xs font-sans uppercase tracking-widest font-semibold shadow-[var(--theme-shadow-sm)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]"></span>
            {currentPreset.name} • Atelier
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] text-[var(--theme-heading)] font-normal leading-[1.1] tracking-tight">
            Welcome Back, <br />
            <span className="italic font-light text-[var(--theme-primary)]">{userSilhouette.name}.</span>
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onQuickStyle}
              className="px-8 py-3.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-base tracking-wide transition-all shadow-[var(--theme-shadow-md)] hover:shadow-[var(--theme-shadow-lg)] flex items-center gap-3 group cursor-pointer"
            >
              <span>Style in Studio</span>
              <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
            <button
              onClick={() => onNavigate('saved')}
              className="px-6 py-3.5 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] text-[var(--theme-heading)] hover:text-[var(--theme-primary)] rounded-full font-serif text-base transition-all border border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] flex items-center gap-2 shadow-[var(--theme-shadow-sm)] cursor-pointer"
            >
              <span>Latest Archives</span>
              <span className="material-symbols-outlined text-sm text-[var(--theme-accent)]">
                auto_awesome
              </span>
            </button>
          </div>
        </div>

        {/* Minimal Subtle Graphic Illustration Element (Replacing Person Photo) */}
        <div className="lg:col-span-5 relative group">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--theme-surface-subtle)] p-6 shadow-[var(--theme-shadow-md)] border border-[var(--theme-border)] flex flex-col justify-between h-[280px]">
            {/* Subtle Minimal Graphic Backdrop Pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,var(--theme-primary)_0%,transparent_60%)] pointer-events-none"></div>

            <div className="flex items-start justify-between relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] shadow-[var(--theme-shadow-sm)]">
                <span className="material-symbols-outlined text-2xl">diamond</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--theme-muted)] bg-[var(--theme-surface)] border border-[var(--theme-border)] px-3 py-1 rounded-full">
                NOOR • {currentPreset.name}
              </span>
            </div>

            {/* Hero Graphic Illustration (Image for Women theme preset, SVG for others) */}
            <div className="relative z-10 flex items-center justify-center my-auto py-2 h-36">
              {currentPreset.heroGraphicImage ? (
                <img
                  src={currentPreset.heroGraphicImage}
                  alt={`${currentPreset.name} Hero Graphic`}
                  className="max-h-36 w-auto object-contain rounded-2xl border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)] opacity-95 transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <svg className="w-52 h-36 mx-auto text-[var(--theme-primary)]" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Rack Frame */}
                  <path d="M 20 120 L 20 20 C 20 15, 180 15, 180 20 L 180 120" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
                  <path d="M 12 120 L 28 120 M 172 120 L 188 120" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
                  
                  {/* Hanger Loops */}
                  <path d="M 55 20 C 55 16, 52 14, 50 16 C 48 18, 50 20, 55 22 L 35 32 L 75 32 Z" fill="currentColor" opacity="0.25" />
                  <path d="M 105 20 C 105 16, 102 14, 100 16 C 98 18, 100 20, 105 22 L 85 32 L 125 32 Z" fill="currentColor" opacity="0.25" />
                  <path d="M 155 20 C 155 16, 152 14, 150 16 C 148 18, 150 20, 155 22 L 135 32 L 175 32 Z" fill="currentColor" opacity="0.25" />
                  
                  {/* Garment 1: Trench Coat (Left) */}
                  <path d="M 35 32 Q 28 50 30 100 L 70 100 Q 72 50 65 32 Z" fill="var(--theme-accent)" opacity="0.2" />
                  <path d="M 35 32 L 48 50 L 48 100 M 65 32 L 52 50 L 52 100 M 42 32 L 50 42 L 58 32" stroke="currentColor" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />

                  {/* Garment 2: Fluid Silk Dress (Center) */}
                  <path d="M 88 32 C 82 45, 80 75, 78 110 L 122 110 C 120 75, 118 45, 112 32 Z" fill="var(--theme-primary)" opacity="0.18" />
                  <path d="M 88 32 Q 100 45 112 32 M 95 32 C 92 60 90 90 88 110 M 105 32 C 108 60 110 90 112 110" stroke="currentColor" strokeWidth="1.2" opacity="0.45" strokeLinecap="round" />

                  {/* Garment 3: Tailored Blazer (Right) */}
                  <path d="M 135 32 L 128 75 L 172 75 L 165 32 Z" fill="var(--theme-accent)" opacity="0.25" />
                  <path d="M 135 32 L 146 55 L 146 75 M 165 32 L 154 55 L 154 75 M 140 32 L 150 48 L 160 32" stroke="currentColor" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
                  
                  {/* Subtle Sparkle Detail */}
                  <circle cx="168" cy="22" r="2" fill="var(--theme-accent)" />
                  <circle cx="32" cy="18" r="1.5" fill="var(--theme-primary)" />
                </svg>
              )}
            </div>

            {/* AI Status Tag */}
            <div className="relative z-10 p-3.5 bg-[var(--theme-glass)] backdrop-blur-md rounded-2xl border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-sans uppercase tracking-widest text-[var(--theme-primary)] block font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)] animate-pulse inline-block"></span>
                  AI Stylist Active
                </span>
                <p className="text-xs font-medium text-[var(--theme-heading)]">
                  {aiTagline[currentGender] || aiTagline.woman}
                </p>
              </div>
              <button
                onClick={() => onNavigate('photo')}
                className="w-8 h-8 rounded-full bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] flex items-center justify-center text-[var(--theme-primary)] border border-[var(--theme-border)] transition-colors cursor-pointer"
                title="View Digital Silhouette"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Navigation Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Card 1 */}
        <div
          onClick={() => onNavigate('closet')}
          className="p-8 bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] hover:bg-[var(--theme-surface-subtle)] transition-all cursor-pointer group flex flex-col justify-between h-56 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
        >
          <div className="flex justify-between items-start">
            <span className="font-sans text-xs text-[var(--theme-muted)] tracking-widest font-semibold uppercase">
              01
            </span>
            <span className="material-symbols-outlined text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
              north_east
            </span>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-[var(--theme-heading)] group-hover:text-[var(--theme-primary)] transition-colors">
              Curate Your Closet
            </h3>
            <p className="text-xs text-[var(--theme-body)] mt-2 font-sans leading-relaxed">
              Digitize your luxury wardrobe with high-fidelity texture and material tagging.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => onNavigate('style')}
          className="p-8 bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] hover:bg-[var(--theme-surface-subtle)] transition-all cursor-pointer group flex flex-col justify-between h-56 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
        >
          <div className="flex justify-between items-start">
            <span className="font-sans text-xs text-[var(--theme-muted)] tracking-widest font-semibold uppercase">
              02
            </span>
            <span className="material-symbols-outlined text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
              north_east
            </span>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-[var(--theme-heading)] group-hover:text-[var(--theme-primary)] transition-colors">
              Build Masterpieces
            </h3>
            <p className="text-xs text-[var(--theme-body)] mt-2 font-sans leading-relaxed">
              Layer silhouettes and test harmonic proportions on your digital mannequin.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => onNavigate('saved')}
          className="p-8 bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] hover:bg-[var(--theme-surface-subtle)] transition-all cursor-pointer group flex flex-col justify-between h-56 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
        >
          <div className="flex justify-between items-start">
            <span className="font-sans text-xs text-[var(--theme-muted)] tracking-widest font-semibold uppercase">
              03
            </span>
            <span className="material-symbols-outlined text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
              north_east
            </span>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-[var(--theme-heading)] group-hover:text-[var(--theme-primary)] transition-colors">
              Save Inspiration
            </h3>
            <p className="text-xs text-[var(--theme-body)] mt-2 font-sans leading-relaxed">
              Archive AI-generated ensembles, runway notes, and seasonal looks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
