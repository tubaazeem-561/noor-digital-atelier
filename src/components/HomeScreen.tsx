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

            {/* Minimalist Hanger & Grid Motif */}
            <div className="relative z-10 flex items-center justify-center my-auto py-2">
              <svg className="w-20 h-20 text-[var(--theme-primary)] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7l7 4a2 2 0 0 1 1 1.73V15a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2.27A2 2 0 0 1 3 11l7-4V5.72A2 2 0 0 1 12 2z"/>
              </svg>
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
