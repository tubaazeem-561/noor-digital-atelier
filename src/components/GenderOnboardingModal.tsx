import React, { useState } from 'react';
import { GenderPreference } from '../types';

interface GenderOnboardingModalProps {
  isOpen: boolean;
  initialGender?: GenderPreference;
  onSelectAndContinue: (gender: GenderPreference, shouldApplyPresetWardrobe: boolean) => void;
  onClose?: () => void;
  isFirstTime?: boolean;
}

interface ThemeOption {
  id: GenderPreference;
  title: string;
  subtitle: string;
  badge: string;
  colorPreview: {
    bg: string;
    accent: string;
    primary: string;
    border: string;
  };
  description: string;
  archetypes: string[];
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'woman',
    title: 'Woman',
    subtitle: 'Pink NOOR',
    badge: '🌸 Feminine Luxury',
    colorPreview: {
      bg: '#FCF2F5',
      accent: '#C86D8B',
      primary: '#4A0E2E',
      border: '#F0D5DF'
    },
    description:
      'Soft blush tones, deep burgundy accents, fluid romantic drapes, and couture silhouettes.',
    archetypes: ['Romantic Drama', 'Quiet Luxury', 'Couture Evening']
  },
  {
    id: 'man',
    title: 'Man',
    subtitle: 'Blue NOOR',
    badge: '🔵 Sartorial Luxury',
    colorPreview: {
      bg: '#EEF4FA',
      accent: '#456F97',
      primary: '#0D1F38',
      border: '#C8DBEC'
    },
    description:
      'Powder blue canvas, deep midnight navy accents, architectural tailoring, and refined menswear.',
    archetypes: ['Executive Sartorial', 'Minimalist Tailoring', 'Tactile Cashmere']
  },
  {
    id: 'others',
    title: 'Others',
    subtitle: 'Neutral Atelier',
    badge: '⚪ Universal Minimalist',
    colorPreview: {
      bg: '#F6F5F2',
      accent: '#9C856C',
      primary: '#1C1C1E',
      border: '#DFDAD1'
    },
    description:
      'Alabaster ivory, deep graphite charcoal, kinetic pleating, and contemporary versatile aesthetics.',
    archetypes: ['Architectural Drape', 'Kinetic Volume', 'Universal']
  }
];

export const GenderOnboardingModal: React.FC<GenderOnboardingModalProps> = ({
  isOpen,
  initialGender = 'woman',
  onSelectAndContinue,
  onClose,
  isFirstTime = true
}) => {
  const [selectedGender, setSelectedGender] = useState<GenderPreference>(initialGender);
  const [applyPresetWardrobe, setApplyPresetWardrobe] = useState(true);

  if (!isOpen) return null;

  const currentOption = THEME_OPTIONS.find((opt) => opt.id === selectedGender) || THEME_OPTIONS[0];

  const handleGenderClick = (gender: GenderPreference) => {
    setSelectedGender(gender);
    document.documentElement.setAttribute('data-theme', gender);
  };

  const handleContinue = () => {
    document.documentElement.setAttribute('data-theme', selectedGender);
    onSelectAndContinue(selectedGender, applyPresetWardrobe);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-[var(--theme-surface)] w-full max-w-2xl rounded-3xl p-6 sm:p-10 border border-[var(--theme-border)] shadow-[var(--theme-shadow-lg)] space-y-6 sm:space-y-8 max-h-[92vh] overflow-y-auto relative transition-colors duration-300">
        {onClose && !isFirstTime && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-heading)] flex items-center justify-center border border-[var(--theme-border)] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}

        {/* Header */}
        <div className="text-center max-w-lg mx-auto space-y-2.5">
          <span className="px-3.5 py-1 rounded-full text-xs font-mono tracking-widest uppercase bg-[var(--theme-accent-light)] text-[var(--theme-primary)] border border-[var(--theme-border)] inline-block">
            Personalize Visual Identity
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[var(--theme-heading)] tracking-tight">
            Tell us a little about you
          </h2>
          <p className="text-sm font-sans text-[var(--theme-body)] leading-relaxed">
            This helps NOOR calibrate your digital mannequin, bespoke wardrobe recommendations, and
            curate a personalized visual theme for your entire atelier.
          </p>
        </div>

        {/* 3 Interactive Theme Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = selectedGender === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleGenderClick(opt.id)}
                className={`text-left p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] shadow-[var(--theme-shadow-md)] ring-2 ring-[var(--theme-primary)]/20'
                    : 'border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-border-hover)] hover:bg-[var(--theme-surface-hover)]'
                }`}
              >
                {/* Visual Swatch Pill */}
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border border-black/10 flex items-center gap-1"
                    style={{
                      backgroundColor: opt.colorPreview.bg,
                      color: opt.colorPreview.primary,
                      borderColor: opt.colorPreview.border
                    }}
                  >
                    <span>{opt.badge}</span>
                  </span>

                  {/* Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primary-text)]'
                        : 'border-[var(--theme-border)] bg-transparent'
                    }`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    )}
                  </div>
                </div>

                {/* Option Name & Subtitle */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-serif text-xl text-[var(--theme-heading)] font-medium">
                      {opt.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--theme-body)] leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                {/* Palette Swatches */}
                <div className="pt-3 mt-3 border-t border-[var(--theme-border)]/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: opt.colorPreview.bg }}
                      title="Background Canvas"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: opt.colorPreview.accent }}
                      title="Accent Highlight"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: opt.colorPreview.primary }}
                      title="Primary Action & Typography"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Preset Capsule Toggle */}
        <div className="p-4 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] flex items-center justify-between gap-4">
          <div className="space-y-0.5 text-left">
            <span className="text-xs font-serif font-medium text-[var(--theme-heading)] block">
              Load Curated Starter Wardrobe & Silhouette
            </span>
            <span className="text-[11px] font-sans text-[var(--theme-body)] block">
              Pre-load high-fashion garments and bespoke looks calibrated for {currentOption.title}.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={applyPresetWardrobe}
              onChange={(e) => setApplyPresetWardrobe(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--theme-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-primary)]"></div>
          </label>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-4 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-base tracking-wide transition-all shadow-[var(--theme-shadow-md)] hover:shadow-[var(--theme-shadow-lg)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Continue with {currentOption.title}</span>
            <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
          <p className="text-center text-[11px] text-[var(--theme-muted)] pt-2.5 font-mono">
            You can change your visual identity anytime in your Client Profile.
          </p>
        </div>
      </div>
    </div>
  );
};
