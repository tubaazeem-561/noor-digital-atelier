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

  const narrativeText: Record<GenderPreference, string> = {
    woman:
      'Your bespoke digital atelier is active. Today’s curation reflects an editorial study in fluid silk drapes, plush velvets, and romantic burgundy harmonies.',
    man:
      'Your sartorial atelier is calibrated. Today’s curation emphasizes structured peaked lapels, midnight navy cashmere, and crisp powder blue tailoring.',
    'non-binary':
      'Your fluid atelier is calibrated. Today’s curation emphasizes minimalist alabaster draping, architectural micro-pleats, and sculptural silhouette balance.',
    'prefer-not-to-say':
      'Your bespoke atelier is calibrated. Today’s curation explores versatile proportions, tactile natural fibers, and timeless minimalist aesthetics.'
  };

  const aiTagline: Record<GenderPreference, string> = {
    woman: 'Curating romantic silhouettes & silk drape...',
    man: 'Curating sartorial tailoring & midnight cashmere...',
    'non-binary': 'Curating architectural fluid drapes & volume...',
    'prefer-not-to-say': 'Curating timeless bespoke proportions...'
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
          <p className="font-sans text-[var(--theme-body)] text-lg max-w-lg leading-relaxed">
            {narrativeText[currentGender] || narrativeText.woman}
          </p>
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

        {/* Editorial Visual Card */}
        <div className="lg:col-span-5 relative group">
          <div className="relative overflow-hidden rounded-t-[140px] rounded-b-[28px] bg-[var(--theme-surface-subtle)] aspect-[3/4] shadow-[var(--theme-shadow-lg)] border-2 border-[var(--theme-border)] transition-transform duration-500 group-hover:scale-[1.01]">
            <img
              alt="NOOR Fashion Model Editorial"
              className="w-full h-full object-cover object-center filter saturate-[0.98]"
              src={currentPreset.heroEditorial}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-primary)]/70 via-transparent to-transparent pointer-events-none"></div>

            {/* Vertical Edition Label */}
            <div className="absolute top-8 right-6 text-white/95 text-xs font-mono uppercase tracking-[0.2em] [writing-mode:vertical-lr] drop-shadow-md">
              NOOR Atelier • {currentPreset.name}
            </div>

            {/* AI Analysis Active Tag */}
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-[var(--theme-glass)] backdrop-blur-md rounded-2xl border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-sans uppercase tracking-widest text-[var(--theme-primary)] block font-semibold flex items-center gap-1.5">
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

