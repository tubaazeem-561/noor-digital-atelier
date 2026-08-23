import React, { useState, useRef } from 'react';
import { UserSilhouette, GenderPreference } from '../types';

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
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

            {/* Silhouette Frame: Generic Humanoid Avatar Placeholder Graphic */}
            <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] shadow-inner flex items-center justify-center group">
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-[var(--theme-primary)] opacity-40">
                <svg className="w-36 h-56" viewBox="0 0 100 160" fill="currentColor">
                  {/* Generic Humanoid Silhouette */}
                  <circle cx="50" cy="22" r="14" />
                  <path d="M 30 42 C 30 38, 70 38, 70 42 L 76 85 C 76 90, 68 95, 64 95 L 64 150 C 64 155, 54 155, 54 150 L 54 102 L 46 102 L 46 150 C 46 155, 36 155, 36 150 L 36 95 C 32 95, 24 90, 24 85 Z" />
                </svg>
                <span className="mt-4 font-mono text-xs uppercase tracking-widest font-semibold text-[var(--theme-muted)]">
                  Humanoid Avatar Placeholder
                </span>
              </div>

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
