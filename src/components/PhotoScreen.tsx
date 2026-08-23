import React, { useState, useRef } from 'react';
import { UserSilhouette, GenderPreference } from '../types';
import {
  USER_DEFAULT_PORTRAIT_WOMAN,
  USER_DEFAULT_PORTRAIT_MAN,
  USER_DEFAULT_PORTRAIT_NEUTRAL
} from '../data/initialData';

interface PhotoScreenProps {
  userSilhouette: UserSilhouette;
  onUpdateSilhouette: (silhouette: Partial<UserSilhouette>) => void;
  onProceedToStyling: () => void;
  currentGender?: GenderPreference;
}

export const PhotoScreen: React.FC<PhotoScreenProps> = ({
  userSilhouette,
  onUpdateSilhouette,
  onProceedToStyling,
  currentGender = 'woman'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const presetsByGender: Record<GenderPreference, { name: string; url: string; notes: string }[]> = {
    woman: [
      {
        name: 'Sarah (Hourglass)',
        url: USER_DEFAULT_PORTRAIT_WOMAN,
        notes: 'Harmonious Hourglass • 172cm'
      },
      {
        name: 'Elena (Tailored Column)',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        notes: 'Structured Shoulders • 178cm'
      },
      {
        name: 'Camille (Petite Elegance)',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        notes: 'Fluid Proportions • 165cm'
      }
    ],
    man: [
      {
        name: 'Alexander (Sartorial)',
        url: USER_DEFAULT_PORTRAIT_MAN,
        notes: 'Athletic V-Taper • 186cm'
      },
      {
        name: 'Marcus (Classic Tailored)',
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
        notes: 'Structured Broad Shoulders • 182cm'
      },
      {
        name: 'Julian (Slim Modern)',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        notes: 'Linear Proportions • 179cm'
      }
    ],
    'non-binary': [
      {
        name: 'Rowan (Fluid Column)',
        url: USER_DEFAULT_PORTRAIT_NEUTRAL,
        notes: 'Fluid Proportions • 176cm'
      },
      {
        name: 'Kai (Architectural)',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        notes: 'Kinetic Drape • 174cm'
      },
      {
        name: 'Morgan (Minimalist)',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        notes: 'Balanced Proportions • 178cm'
      }
    ],
    'prefer-not-to-say': [
      {
        name: 'Atelier Default',
        url: USER_DEFAULT_PORTRAIT_NEUTRAL,
        notes: 'Balanced Proportions • 175cm'
      },
      {
        name: 'Studio Model A',
        url: USER_DEFAULT_PORTRAIT_WOMAN,
        notes: 'Fluid Proportions • 172cm'
      },
      {
        name: 'Studio Model B',
        url: USER_DEFAULT_PORTRAIT_MAN,
        notes: 'Structured Proportions • 185cm'
      }
    ]
  };

  const presetPortraits = presetsByGender[currentGender] || presetsByGender.woman;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIsCalibrating(true);
          setTimeout(() => {
            onUpdateSilhouette({
              photoUrl: event.target?.result as string,
              status: 'Portrait Active',
              lightingPassed: true,
              fullLengthPassed: true
            });
            setIsCalibrating(false);
          }, 600);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIsCalibrating(true);
          setTimeout(() => {
            onUpdateSilhouette({
              photoUrl: event.target?.result as string,
              status: 'Portrait Active',
              lightingPassed: true,
              fullLengthPassed: true
            });
            setIsCalibrating(false);
          }, 600);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
    }, 800);
  };

  return (
    <div className="space-y-12 pb-12 animate-fadeIn">
      {/* Title Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-primary)] rounded-full text-xs font-sans uppercase tracking-widest font-semibold shadow-[var(--theme-shadow-sm)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]"></span>
          Calibration Engine
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[var(--theme-heading)] font-normal tracking-tight">
          Digital Silhouette
        </h1>
        <p className="font-sans text-[var(--theme-body)] text-base sm:text-lg max-w-2xl leading-relaxed">
          Capture or upload a full-body portrait to calibrate your AI stylist’s spatial drape, shoulder lines, and proportion engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Guidelines */}
        <div className="lg:col-span-6 space-y-6">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragOver
                ? 'border-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] scale-[1.01] shadow-[var(--theme-shadow-md)]'
                : 'border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-border-hover)] hover:shadow-[var(--theme-shadow-sm)]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] mx-auto flex items-center justify-center text-[var(--theme-primary)] mb-4">
              <span className="material-symbols-outlined text-3xl">add_a_photo</span>
            </div>
            <h3 className="font-serif text-xl text-[var(--theme-heading)]">
              Drop your portrait here or browse files
            </h3>
            <p className="font-sans text-xs text-[var(--theme-body)] mt-1">
              Supports high-res JPG, PNG, WEBP (Neutral studio backdrop recommended)
            </p>
            <button
              type="button"
              className="mt-6 px-6 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-xs font-serif rounded-full transition-colors shadow-[var(--theme-shadow-sm)] cursor-pointer"
            >
              Choose Image File
            </button>
          </div>

          {/* Preset Portrait Quick-Select */}
          <div className="bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-border)] space-y-3 shadow-[var(--theme-shadow-sm)]">
            <span className="font-sans text-xs text-[var(--theme-primary)] uppercase tracking-widest font-semibold block">
              Atelier Model Presets
            </span>
            <div className="grid grid-cols-3 gap-3">
              {presetPortraits.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsCalibrating(true);
                    setTimeout(() => {
                      onUpdateSilhouette({
                        photoUrl: preset.url,
                        status: 'Portrait Active'
                      });
                      setIsCalibrating(false);
                    }, 400);
                  }}
                  className={`p-2 rounded-xl text-left border text-xs transition-all flex flex-col items-center text-center gap-1.5 cursor-pointer ${
                    userSilhouette.photoUrl === preset.url
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-surface-subtle)] shadow-[var(--theme-shadow-sm)] font-semibold'
                      : 'border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] text-[var(--theme-body)]'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-12 h-14 object-cover rounded-md"
                  />
                  <span className="truncate w-full text-[11px] font-sans text-[var(--theme-heading)]">
                    {preset.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines Cards */}
          <div className="space-y-4 pt-2">
            <div className="p-5 bg-[var(--theme-surface)] rounded-2xl flex items-start gap-4 border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)]">
              <span className="font-sans text-xs text-[var(--theme-primary)] font-semibold bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] px-2.5 py-1 rounded-full">
                01
              </span>
              <div>
                <h4 className="font-serif text-base text-[var(--theme-heading)] font-semibold">
                  Even Lighting
                </h4>
                <p className="font-sans text-xs text-[var(--theme-body)] mt-0.5 leading-relaxed">
                  Soft, diffused daylight produces the most accurate natural fabric tone and silhouette rendering.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[var(--theme-surface)] rounded-2xl flex items-start gap-4 border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)]">
              <span className="font-sans text-xs text-[var(--theme-primary)] font-semibold bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] px-2.5 py-1 rounded-full">
                02
              </span>
              <div>
                <h4 className="font-serif text-base text-[var(--theme-heading)] font-semibold">
                  Full Length
                </h4>
                <p className="font-sans text-xs text-[var(--theme-body)] mt-0.5 leading-relaxed">
                  Ensure head-to-toe visibility with neutral posture against an uncluttered, clean backdrop.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Canvas Preview */}
        <div className="lg:col-span-6 sticky top-28">
          <div className="bg-[var(--theme-surface)] rounded-3xl p-6 border border-[var(--theme-border)] shadow-[var(--theme-shadow-md)] space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs uppercase tracking-widest text-[var(--theme-primary)] font-semibold">
                Live Preview: Digital Canvas
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--theme-surface-subtle)] rounded-full border border-[var(--theme-border)]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCalibrating ? 'bg-[var(--theme-accent)] animate-spin' : 'bg-[var(--theme-primary)]'
                  }`}
                ></span>
                <span className="text-xs font-mono text-[var(--theme-heading)]">
                  {isCalibrating ? 'Recalibrating...' : userSilhouette.status}
                </span>
              </div>
            </div>

            {/* Silhouette Frame */}
            <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] shadow-inner group">
              <img
                src={userSilhouette.photoUrl}
                alt="Active User Silhouette"
                className={`w-full h-full object-cover object-top transition-all duration-700 ${
                  isCalibrating ? 'blur-xs scale-95 opacity-80' : 'scale-100 opacity-100'
                }`}
              />

              {/* Grid overlay for spatial drape */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--theme-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--theme-border)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-30"></div>

              {/* Spatial Drape Indicator lines */}
              <div className="absolute top-1/4 left-4 right-4 border-b border-dashed border-[var(--theme-accent)]/50 flex justify-between text-[10px] font-mono text-[var(--theme-primary)]">
                <span>SHOULDER LINE</span>
                <span>CALIBRATED</span>
              </div>
              <div className="absolute top-1/2 left-4 right-4 border-b border-dashed border-[var(--theme-accent)]/50 flex justify-between text-[10px] font-mono text-[var(--theme-primary)]">
                <span>NATURAL WAIST</span>
                <span>HARMONIC</span>
              </div>

              {/* Floating Bottom Metadata Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-[var(--theme-glass)] backdrop-blur-md rounded-xl border border-[var(--theme-border)] text-xs flex items-center justify-between shadow-[var(--theme-shadow-sm)]">
                <div>
                  <p className="font-serif font-semibold text-[var(--theme-heading)]">
                    Proportion Calibrated
                  </p>
                  <p className="text-[11px] text-[var(--theme-body)] font-sans">
                    Spatial drape anchor points active
                  </p>
                </div>
                <span className="font-mono text-xs text-[var(--theme-primary)] font-semibold bg-[var(--theme-surface)] border border-[var(--theme-border)] px-2 py-0.5 rounded">
                  98% FIT
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-3">
              <button
                onClick={handleRecalibrate}
                className="w-12 h-12 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] text-[var(--theme-body)] hover:text-[var(--theme-primary)] flex items-center justify-center transition-colors flex-shrink-0 shadow-[var(--theme-shadow-sm)] cursor-pointer"
                title="Recalibrate spatial lines"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isCalibrating ? 'animate-spin text-[var(--theme-accent)]' : ''
                  }`}
                >
                  refresh
                </span>
              </button>
              <button
                onClick={onProceedToStyling}
                className="flex-1 py-3.5 px-6 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-base font-medium transition-all shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Proceed to Styling</span>
                <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

