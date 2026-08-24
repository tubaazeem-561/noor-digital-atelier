// @ts-nocheck
/**
 * FitCheckScreen — Real-time 2D mannequin dress-up / fit-check studio.
 * Ported from the standalone anti2demo.html prototype into the NOOR Atelier app.
 * Drag, scale, and rotate garments directly on a mannequin (or an uploaded photo),
 * try AI-curated occasion presets, compare before/after, export a PNG, and save looks.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { removeStudioBackground } from '../utils/imageProcessing';
import { Garment } from '../types';

/* ==========================================================================
   SOUND SYNTHESIZER (Web Audio API - Pure native game sound effects)
   ========================================================================== */
const playAudioFx = (type = 'equip') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'equip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'unequip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'tuck') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(587, now + 0.06);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'snap') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (e) {}
};

/* ==========================================================================
   ICONS
   ========================================================================== */
const iconProps = (props) => ({
  xmlns: "http://www.w3.org/2000/svg",
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...props,
});

const UploadIcon = (props) => <svg {...iconProps(props)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const PlusIcon = (props) => <svg {...iconProps(props)}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const XIcon = (props) => <svg {...iconProps(props)}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const SparklesIcon = (props) => <svg {...iconProps(props)}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M19 15l.7 2.1L22 18l-2.3.9L19 21l-.7-2.1L16 18l2.3-.9L19 15z" /><path d="M5 15l.7 2.1L8 18l-2.3.9L5 21l-.7-2.1L2 18l2.3-.9L5 15z" /></svg>;
const LayersIcon = (props) => <svg {...iconProps(props)}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
const EyeIcon = (props) => <svg {...iconProps(props)}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const FlipIcon = (props) => <svg {...iconProps(props)}><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><polyline points="4 4 9 4 9 9" /></svg>;
const DownloadIcon = (props) => <svg {...iconProps(props)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const MagicWandIcon = (props) => <svg {...iconProps(props)}><line x1="4" y1="20" x2="20" y2="4" /><line x1="14" y1="4" x2="16" y2="2" /><line x1="18" y1="8" x2="20" y2="6" /><line x1="2" y1="16" x2="4" y2="14" /><line x1="6" y1="20" x2="8" y2="18" /></svg>;
const ResetIcon = (props) => <svg {...iconProps(props)}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>;
const Volume2Icon = (props) => <svg {...iconProps(props)}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>;
const VolumeXIcon = (props) => <svg {...iconProps(props)}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>;
const ZoomInIcon = (props) => <svg {...iconProps(props)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>;
const ZoomOutIcon = (props) => <svg {...iconProps(props)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>;

/* ==========================================================================
   PRESET MODELS & STARTER WARDROBE
   ========================================================================== */
const createMannequinSvg = (skin = '#E8C5B0', hair = '#3A2016') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 700" width="400" height="700">
    <defs>
      <radialGradient id="bg" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#FFF5F7"/>
        <stop offset="100%" stop-color="#EED5DC"/>
      </radialGradient>
      <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${skin}"/>
        <stop offset="50%" stop-color="${skin}"/>
        <stop offset="100%" stop-color="${skin}DD"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#703046" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <ellipse cx="200" cy="650" rx="90" ry="18" fill="#D6BAC3" opacity="0.4"/>
    
    <g filter="url(#shadow)" fill="url(#skinGrad)" stroke="${skin}AA" stroke-width="1.5">
      <path d="M190,140 L190,165 L210,165 L210,140 Z"/>
      <ellipse cx="200" cy="115" rx="36" ry="46"/>
      <path d="M164,115 Q164,72 200,72 Q236,72 236,115 Q240,145 228,155 Q215,120 200,120 Q185,120 172,155 Q160,145 164,115 Z" fill="${hair}" stroke="none"/>
      <path d="M152,175 C165,168 185,165 200,165 C215,165 235,168 248,175 C262,185 272,210 268,260 C264,300 250,335 242,370 L158,370 C150,335 136,300 132,260 C128,210 138,185 152,175 Z"/>
      <path d="M136,182 Q115,240 112,320 Q110,380 114,410 C117,418 126,416 128,405 Q130,360 132,310 Q138,250 148,205 Z"/>
      <path d="M264,182 Q285,240 288,320 Q290,380 286,410 C283,418 274,416 272,405 Q270,360 268,310 Q262,250 252,205 Z"/>
      <path d="M160,370 L195,370 L190,520 L184,625 L162,625 L164,520 L156,410 Z"/>
      <path d="M205,370 L240,370 L244,410 L236,520 L238,625 L216,625 L210,520 Z"/>
      <path d="M160,622 L184,622 L188,642 C188,646 160,648 156,642 Z"/>
      <path d="M216,622 L240,622 L244,642 C244,646 216,648 212,642 Z"/>
    </g>

    <path d="M165,225 Q200,240 235,225 L232,280 Q200,290 168,280 Z" fill="#FFFFFF" opacity="0.85"/>
    <path d="M160,355 Q200,368 240,355 L242,405 Q200,430 158,405 Z" fill="#FFFFFF" opacity="0.85"/>
    <circle cx="188" cy="115" r="2.5" fill="#34121C" opacity="0.5"/>
    <circle cx="212" cy="115" r="2.5" fill="#34121C" opacity="0.5"/>
    <path d="M195,130 Q200,134 205,130" stroke="#34121C" stroke-width="1.5" fill="none" opacity="0.4"/>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};

const PRESET_CLOTHING = [
  {
    id: "p-top-1",
    name: "Classic Rose Knit Crop",
    category: "top",
    brand: "Noor Studio",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 240"><path d="M80,30 Q110,65 150,65 Q190,65 220,30 L275,80 L245,120 L220,95 L220,220 L80,220 L80,95 L55,120 L25,80 Z" fill="#D6417E" stroke="#A61E4D" stroke-width="4"/><path d="M80,200 L220,200" stroke="#F5A8C4" stroke-width="6" stroke-dasharray="10 5"/><circle cx="150" cy="130" r="18" fill="#FBE4EA" opacity="0.6"/></svg>`),
    defaultAnchor: { top: 24, left: 24, width: 52, height: 32, rotation: 0, flipH: false, zIndex: 10 }
  },
  {
    id: "p-top-2",
    name: "Oversized Cream Tee",
    category: "top",
    brand: "Atelier",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 260"><path d="M75,25 Q115,55 160,55 Q205,55 245,25 L295,75 L260,125 L235,105 L235,245 L85,245 L85,105 L60,125 L25,75 Z" fill="#FAF3EB" stroke="#D1C4B7" stroke-width="5"/><path d="M120,110 L200,110 L200,150 L120,150 Z" fill="#E8DCD1" rx="4"/><text x="160" y="136" font-family="sans-serif" font-size="14" font-weight="bold" fill="#8E4A63" text-anchor="middle">PARIS</text></svg>`),
    defaultAnchor: { top: 23, left: 22, width: 56, height: 36, rotation: 0, flipH: false, zIndex: 10 }
  },
  {
    id: "p-top-3",
    name: "Midnight Moto Jacket",
    category: "top",
    brand: "Vogue Noir",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 280"><path d="M80,20 L130,55 L210,55 L260,20 L320,85 L280,140 L250,115 L250,260 L90,260 L90,115 L60,140 L20,85 Z" fill="#201017" stroke="#34121C" stroke-width="6"/><path d="M130,55 L160,260" stroke="#F5A8C4" stroke-width="3" stroke-dasharray="4 4"/><polygon points="210,55 240,120 180,100" fill="#421825"/><circle cx="115" cy="180" r="6" fill="#D6417E"/></svg>`),
    defaultAnchor: { top: 22, left: 20, width: 60, height: 38, rotation: 0, flipH: false, zIndex: 25 }
  },
  {
    id: "p-bot-1",
    name: "High-Waist Flare Trousers",
    category: "bottom",
    brand: "Silhouette",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 380"><path d="M50,15 L210,15 L225,120 L240,365 L150,365 L135,160 L120,160 L110,365 L20,365 L35,120 Z" fill="#34121C" stroke="#200B11" stroke-width="5"/><line x1="50" y1="40" x2="210" y2="40" stroke="#8E4A63" stroke-width="4"/><circle cx="130" cy="28" r="5" fill="#F5A8C4"/></svg>`),
    defaultAnchor: { top: 48, left: 25, width: 50, height: 44, rotation: 0, flipH: false, zIndex: 12 }
  },
  {
    id: "p-bot-2",
    name: "Vintage Pleated Denim Skirt",
    category: "bottom",
    brand: "Denim & Co",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 260"><path d="M70,10 L210,10 L260,240 L20,240 Z" fill="#4B6B94" stroke="#2D4360" stroke-width="5"/><path d="M60,10 L50,240 M100,10 L90,240 M140,10 L140,240 M180,10 L190,240 M220,10 L230,240" stroke="#365072" stroke-width="3"/><line x1="70" y1="30" x2="210" y2="30" stroke="#F1B662" stroke-width="3" stroke-dasharray="6 3"/></svg>`),
    defaultAnchor: { top: 48, left: 25, width: 50, height: 30, rotation: 0, flipH: false, zIndex: 12 }
  },
  {
    id: "p-shoe-1",
    name: "Retro Chunky Sneakers",
    category: "shoes",
    brand: "Pulse Runner",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><g><path d="M20,110 Q50,40 100,60 L125,75 Q150,110 145,145 L15,145 Z" fill="#FFFFFF" stroke="#D1C4B7" stroke-width="4"/><path d="M10,145 L155,145 L150,170 L5,170 Z" fill="#D6417E"/><path d="M40,90 L90,110" stroke="#F5A8C4" stroke-width="4"/></g><g transform="translate(160,0)"><path d="M20,110 Q50,40 100,60 L125,75 Q150,110 145,145 L15,145 Z" fill="#FFFFFF" stroke="#D1C4B7" stroke-width="4"/><path d="M10,145 L155,145 L150,170 L5,170 Z" fill="#D6417E"/><path d="M40,90 L90,110" stroke="#F5A8C4" stroke-width="4"/></g></svg>`),
    defaultAnchor: { top: 83, left: 28, width: 44, height: 16, rotation: 0, flipH: false, zIndex: 15 }
  },
  {
    id: "p-shoe-2",
    name: "Midnight Stiletto Straps",
    category: "shoes",
    brand: "Luxe Step",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><g><path d="M30,140 Q60,110 90,120 L130,135 L140,155 L40,155 Z" fill="#34121C"/><line x1="38" y1="140" x2="38" y2="175" stroke="#34121C" stroke-width="5"/><path d="M80,105 Q95,125 110,105" stroke="#D6417E" stroke-width="4" fill="none"/></g><g transform="translate(150,0)"><path d="M30,140 Q60,110 90,120 L130,135 L140,155 L40,155 Z" fill="#34121C"/><line x1="38" y1="140" x2="38" y2="175" stroke="#34121C" stroke-width="5"/><path d="M80,105 Q95,125 110,105" stroke="#D6417E" stroke-width="4" fill="none"/></g></svg>`),
    defaultAnchor: { top: 84, left: 30, width: 40, height: 15, rotation: 0, flipH: false, zIndex: 15 }
  },
  {
    id: "p-acc-1",
    name: "Golden Hour Sunglasses",
    category: "accessory",
    brand: "Optics Chic",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100"><rect x="15" y="25" width="85" height="50" rx="12" fill="#34121C" stroke="#D6417E" stroke-width="5"/><rect x="140" y="25" width="85" height="50" rx="12" fill="#34121C" stroke="#D6417E" stroke-width="5"/><line x1="100" y1="40" x2="140" y2="40" stroke="#D6417E" stroke-width="6"/></svg>`),
    defaultAnchor: { top: 12.5, left: 38, width: 24, height: 8, rotation: 0, flipH: false, zIndex: 30 }
  },
  {
    id: "p-acc-2",
    name: "Burgundy Quilted Shoulder Bag",
    category: "accessory",
    brand: "Maison",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 280"><path d="M40,100 Q110,10 180,100" stroke="#C59B27" stroke-width="6" fill="none"/><rect x="25" y="95" width="170" height="150" rx="18" fill="#6A1A32" stroke="#420E1E" stroke-width="6"/><line x1="25" y1="160" x2="195" y2="160" stroke="#C59B27" stroke-width="3"/><circle cx="110" cy="160" r="10" fill="#C59B27"/></svg>`),
    defaultAnchor: { top: 38, left: 16, width: 26, height: 28, rotation: -6, flipH: false, zIndex: 28 }
  }
];

const CATEGORIES = [
  { key: "all", label: "All Items" },
  { key: "top", label: "Tops" },
  { key: "bottom", label: "Bottoms" },
  { key: "shoes", label: "Shoes" },
  { key: "accessory", label: "Accessories" }
];

const OCCASIONS = [
  { label: "Casual Everyday Chic", vibe: "Effortless & Relaxed", top: "p-top-2", bottom: "p-bot-1", shoes: "p-shoe-1", acc: "p-acc-1" },
  { label: "Date Night Glamour", vibe: "Romantic & Bold", top: "p-top-1", bottom: "p-bot-2", shoes: "p-shoe-2", acc: "p-acc-2" },
  { label: "Streetstyle Edge", vibe: "Modern & Layered", top: "p-top-3", bottom: "p-bot-1", shoes: "p-shoe-1", acc: "p-acc-1" },
  { label: "Festive Soirée", vibe: "Vibrant & Elegant", top: "p-top-1", bottom: "p-bot-1", shoes: "p-shoe-2", acc: "p-acc-2" }
];

/* ==========================================================================
   SMART CANVAS BACKGROUND REMOVER (Chroma/Luma Keying)
   ========================================================================== */
const removeImageBackground = (imageSrc, tolerance = 28) => {
  return new Promise((resolve) => {
    const img = new Image();
    // NOTE: no crossOrigin here — imageSrc is always a same-origin data: URL
    // (from FileReader). Setting crossOrigin="Anonymous" on a data: URL can make
    // getImageData() below throw a SecurityError inside onload, which — since it
    // wasn't caught — left this promise unresolved forever (stuck "Processing…").
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        const corners = [
          [0, 0],
          [canvas.width - 1, 0],
          [0, canvas.height - 1],
          [canvas.width - 1, canvas.height - 1]
        ];
        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(([x, y]) => {
          const idx = (y * canvas.width + x) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        const tolSq = tolerance * tolerance * 3;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dr = r - bgR;
          const dg = g - bgG;
          const db = b - bgB;
          const distSq = dr * dr + dg * dg + db * db;

          if (distSq < tolSq || (r > 240 && g > 240 && b > 240 && tolerance > 15)) {
            const alphaFade = Math.min(1, Math.max(0, (distSq - (tolSq * 0.4)) / (tolSq * 0.6)));
            data[i + 3] = Math.round(data[i + 3] * alphaFade);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        // Never leave the caller hanging — fall back to the original image.
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

/* ==========================================================================
   SMART POSITIONING LOGIC
   ========================================================================== */
const getAnchorForGarment = (fileName, baseCategory) => {
  const lower = (fileName || "").toLowerCase();
  
  let category = baseCategory || "top";
  let anchor = { top: 24, left: 24, width: 52, height: 34, rotation: 0, flipH: false, zIndex: 10 }; // Default top

  if (lower.includes("pant") || lower.includes("jean") || lower.includes("skirt") || lower.includes("short") || lower.includes("trouser") || lower.includes("bottom") || lower.includes("sweatpant") || lower.includes("legging")) {
    category = "bottom";
    anchor = { top: 48, left: 25, width: 50, height: 42, rotation: 0, flipH: false, zIndex: 12 };
  } else if (lower.includes("shoe") || lower.includes("sneaker") || lower.includes("boot") || lower.includes("heel") || lower.includes("sandal") || lower.includes("loafer") || lower.includes("footwear")) {
    category = "shoes";
    anchor = { top: 83, left: 28, width: 44, height: 16, rotation: 0, flipH: false, zIndex: 15 };
  } else if (lower.includes("bag") || lower.includes("purse") || lower.includes("tote") || lower.includes("backpack") || lower.includes("clutch")) {
    category = "accessory";
    anchor = { top: 38, left: 16, width: 26, height: 28, rotation: -6, flipH: false, zIndex: 28 };
  } else if (lower.includes("glass") || lower.includes("sunglass") || lower.includes("shades")) {
    category = "accessory";
    anchor = { top: 12.5, left: 38, width: 24, height: 8, rotation: 0, flipH: false, zIndex: 30 };
  } else if (lower.includes("hat") || lower.includes("cap") || lower.includes("beanie") || lower.includes("hood") || lower.includes("beret")) {
    category = "accessory";
    anchor = { top: -2, left: 35, width: 30, height: 18, rotation: 0, flipH: false, zIndex: 32 };
  } else if (lower.includes("belt")) {
    category = "accessory";
    anchor = { top: 46, left: 30, width: 40, height: 8, rotation: 0, flipH: false, zIndex: 14 };
  } else if (lower.includes("scarf") || lower.includes("neck") || lower.includes("tie") || lower.includes("choker")) {
    category = "accessory";
    anchor = { top: 18, left: 35, width: 30, height: 15, rotation: 0, flipH: false, zIndex: 25 };
  } else if (category === "bottom") {
    anchor = { top: 48, left: 25, width: 50, height: 42, rotation: 0, flipH: false, zIndex: 12 };
  } else if (category === "shoes") {
    anchor = { top: 83, left: 28, width: 44, height: 16, rotation: 0, flipH: false, zIndex: 15 };
  } else if (category === "accessory") {
    // Default accessory if no specific keyword matches (assume it's something held/worn midway like a bag)
    anchor = { top: 38, left: 16, width: 26, height: 28, rotation: -6, flipH: false, zIndex: 28 };
  }

  return { category, anchor };
};

/* ==========================================================================
   MAIN APP COMPONENT
   ========================================================================== */
export const FitCheckScreen: React.FC<{ garments?: Garment[], onBack?: () => void }> = ({ garments = [], onBack }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const playSfx = (type) => { if (soundEnabled) playAudioFx(type); };

  const [bodyPhoto, setBodyPhoto] = useState(createMannequinSvg());
  const [isDemoMannequin, setIsDemoMannequin] = useState(true);
  const [mannequinSkin, setMannequinSkin] = useState('#E8C5B0');
  const [mannequinHair, setMannequinHair] = useState('#3A2016');

  const [closet, setCloset] = useState<any[]>(() => {
    if (garments && garments.length > 0) return [];
    return PRESET_CLOTHING;
  });
  const [isProcessingCloset, setIsProcessingCloset] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const processGarments = async () => {
      if (garments && garments.length > 0) {
        if (isMounted) setIsProcessingCloset(true);
        try {
          const processed = await Promise.all(
            garments.map(async (g) => {
              let baseCategory = 'top';
              if (g.category === 'bottoms') baseCategory = 'bottom';
              else if (g.category === 'shoes') baseCategory = 'shoes';
              else if (g.category === 'accessories' || g.category === 'bags' || g.category === 'tie') baseCategory = 'accessory';
              
              const cleanImage = await removeStudioBackground(g.image);
              const { category, anchor } = getAnchorForGarment(g.name, baseCategory);
              
              return {
                id: g.id,
                name: g.name,
                category,
                brand: g.brand || 'Personal',
                url: cleanImage,
                rawUrl: g.image,
                defaultAnchor: anchor
              };
            })
          );
          if (isMounted) setCloset(processed);
        } finally {
          if (isMounted) setIsProcessingCloset(false);
        }
      } else {
        if (isMounted) setCloset(PRESET_CLOTHING);
      }
    };
    processGarments();
    return () => { isMounted = false; };
  }, [garments]);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  const [equippedItems, setEquippedItems] = useState(() => {
    if (garments && garments.length > 0) return {};
    return {
      "p-top-1": { ...PRESET_CLOTHING[0].defaultAnchor },
      "p-bot-1": { ...PRESET_CLOTHING[3].defaultAnchor },
      "p-shoe-1": { ...PRESET_CLOTHING[5].defaultAnchor }
    };
  });

  const [selectedStageItemId, setSelectedStageItemId] = useState(() => {
    if (garments && garments.length > 0) return null;
    return "p-top-1";
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, itemTop: 0, itemLeft: 0, itemW: 0, itemH: 0, rot: 0 });

  const stageContainerRef = useRef(null);
  const bodyFileInputRef = useRef(null);
  const closetFileInputRef = useRef(null);

  const [showComparisonSlider, setShowComparisonSlider] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);

  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [aiStylingNote, setAiStylingNote] = useState("");

  const [savedLooks, setSavedLooks] = useState([]);
  const [notification, setNotification] = useState("");

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3200);
  };

  const updateMannequin = (skin, hair) => {
    setMannequinSkin(skin);
    setMannequinHair(hair);
    const newSvg = createMannequinSvg(skin, hair);
    setBodyPhoto(newSvg);
    setIsDemoMannequin(true);
    playSfx('snap');
  };

  const toggleEquipItem = (item) => {
    setEquippedItems((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
        if (selectedStageItemId === item.id) setSelectedStageItemId(null);
        playSfx('unequip');
      } else {
        let anchor = item.defaultAnchor;
        if (!anchor) {
          const { anchor: fallbackAnchor } = getAnchorForGarment(item.name, item.category);
          anchor = fallbackAnchor;
        }
        next[item.id] = { ...anchor, blendMode: 'normal', opacity: 1 };
        setSelectedStageItemId(item.id);
        playSfx('equip');
      }
      return next;
    });
  };

  const handleBodyPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBodyPhoto(event.target.result);
      setIsDemoMannequin(false);
      playSfx('snap');
      showToast("Personal photo loaded! Adjust each piece to fit your posture.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleClosetUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    showToast(`Cutting out backgrounds for ${files.length} piece(s)…`);

    const newItems = [];
    for (const file of files) {
      const rawDataUrl = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(file);
      });

      const transparentUrl = await removeImageBackground(rawDataUrl, 28);
      const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
      const formattedName = fileName.replace(/\b\w/g, (c) => c.toUpperCase());
      
      const { category: guessedCategory, anchor } = getAnchorForGarment(fileName, "top");

      newItems.push({
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: formattedName,
        category: guessedCategory,
        brand: "Custom Upload",
        url: transparentUrl,
        rawUrl: rawDataUrl,
        defaultAnchor: anchor
      });
    }

    setCloset((prev) => [...newItems, ...prev]);
    playSfx('equip');
    showToast(`${newItems.length} item(s) added with transparent cutout!`);
    e.target.value = "";
  };

  const handleStagePointerDown = (e, itemId, mode = 'move') => {
    e.stopPropagation();
    setSelectedStageItemId(itemId);
    setIsDragging(true);
    setDragMode(mode);

    const targetItem = equippedItems[itemId];
    if (!targetItem) return;

    dragStartRef.current = {
      mouseX: e.clientX || (e.touches && e.touches[0].clientX) || 0,
      mouseY: e.clientY || (e.touches && e.touches[0].clientY) || 0,
      itemTop: targetItem.top,
      itemLeft: targetItem.left,
      itemW: targetItem.width,
      itemH: targetItem.height,
      rot: targetItem.rotation || 0
    };
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !selectedStageItemId || !stageContainerRef.current) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const rect = stageContainerRef.current.getBoundingClientRect();
    const deltaXPercent = ((currentX - dragStartRef.current.mouseX) / rect.width) * 100;
    const deltaYPercent = ((currentY - dragStartRef.current.mouseY) / rect.height) * 100;

    setEquippedItems((prev) => {
      const current = prev[selectedStageItemId];
      if (!current) return prev;

      if (dragMode === 'move') {
        return {
          ...prev,
          [selectedStageItemId]: {
            ...current,
            left: Math.max(-20, Math.min(100, dragStartRef.current.itemLeft + deltaXPercent)),
            top: Math.max(-20, Math.min(100, dragStartRef.current.itemTop + deltaYPercent))
          }
        };
      } else if (dragMode === 'scale-se') {
        return {
          ...prev,
          [selectedStageItemId]: {
            ...current,
            width: Math.max(10, Math.min(95, dragStartRef.current.itemW + deltaXPercent)),
            height: Math.max(10, Math.min(95, dragStartRef.current.itemH + deltaYPercent))
          }
        };
      } else if (dragMode === 'scale-proportional') {
        const delta = (deltaXPercent + deltaYPercent) / 2;
        const aspect = dragStartRef.current.itemH / dragStartRef.current.itemW || 1;
        const newW = Math.max(10, Math.min(95, dragStartRef.current.itemW + delta));
        return {
          ...prev,
          [selectedStageItemId]: {
            ...current,
            width: newW,
            height: newW * aspect
          }
        };
      } else if (dragMode === 'rotate') {
        const itemCenterX = rect.left + (current.left + current.width / 2) * (rect.width / 100);
        const itemCenterY = rect.top + (current.top + current.height / 2) * (rect.height / 100);
        const angleRad = Math.atan2(currentY - itemCenterY, currentX - itemCenterX);
        let angleDeg = Math.round(angleRad * (180 / Math.PI)) - 90;
        return {
          ...prev,
          [selectedStageItemId]: {
            ...current,
            rotation: angleDeg
          }
        };
      }
      return prev;
    });
  }, [isDragging, selectedStageItemId, dragMode]);

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragMode(null);
    }
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const adjustLayerZ = (itemId, direction) => {
    setEquippedItems((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      const currentZ = item.zIndex || 10;
      const newZ = direction === 'up' ? currentZ + 5 : Math.max(1, currentZ - 5);
      playSfx('tuck');
      return {
        ...prev,
        [itemId]: { ...item, zIndex: newZ }
      };
    });
  };

  const toggleFlipH = (itemId) => {
    setEquippedItems((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      playSfx('snap');
      return {
        ...prev,
        [itemId]: { ...item, flipH: !item.flipH }
      };
    });
  };

  const adjustScale = (itemId, action) => {
    setEquippedItems((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      playSfx('snap');
      const factor = action === 'in' ? 1.1 : (1 / 1.1);
      return {
        ...prev,
        [itemId]: { 
          ...item, 
          width: Math.max(10, Math.min(200, item.width * factor)),
          height: Math.max(10, Math.min(200, item.height * factor))
        }
      };
    });
  };

  const resetItemTransform = (itemId) => {
    const closetItem = closet.find((c) => c.id === itemId);
    if (!closetItem) return;
    const def = closetItem.defaultAnchor || { top: 25, left: 25, width: 50, height: 35, rotation: 0, flipH: false, zIndex: 10 };
    setEquippedItems((prev) => ({
      ...prev,
      [itemId]: { ...def, blendMode: prev[itemId]?.blendMode || 'normal', opacity: prev[itemId]?.opacity || 1 }
    }));
    playSfx('snap');
    showToast("Reset garment position to default center.");
  };

  const applyOccasionOutfit = (occ) => {
    setSelectedOccasion(occ.label);
    playSfx('snap');
    
    const newEquipped = {};
    const addIfFound = (id, fallbackAnchor) => {
      const item = closet.find((c) => c.id === id);
      if (item) {
        newEquipped[item.id] = { ...(item.defaultAnchor || fallbackAnchor), blendMode: 'normal', opacity: 1 };
      }
    };

    if (occ.top) addIfFound(occ.top, { top: 24, left: 24, width: 52, height: 32, rotation: 0, flipH: false, zIndex: 10 });
    if (occ.bottom) addIfFound(occ.bottom, { top: 48, left: 25, width: 50, height: 42, rotation: 0, flipH: false, zIndex: 12 });
    if (occ.shoes) addIfFound(occ.shoes, { top: 82, left: 28, width: 44, height: 16, rotation: 0, flipH: false, zIndex: 15 });
    if (occ.acc) addIfFound(occ.acc, { top: 38, left: 16, width: 26, height: 28, rotation: -6, flipH: false, zIndex: 28 });

    setEquippedItems(newEquipped);
    setSelectedStageItemId(Object.keys(newEquipped)[0] || null);
    setAiStylingNote(`Curated for ${occ.label}: Balanced silhouette with tailored color harmony.`);
    playSfx('equip');
    showToast(`Styled with ${occ.label} ensemble!`);
  };

  const downloadLookSnapshot = async () => {
    playSfx('snap');
    showToast("Rendering high-res fit check snapshot…");

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");

    const bodyImg = new Image();
    bodyImg.crossOrigin = "Anonymous";
    await new Promise((resolve) => {
      bodyImg.onload = resolve;
      bodyImg.src = bodyPhoto;
    });
    ctx.drawImage(bodyImg, 0, 0, canvas.width, canvas.height);

    const sortedEquipped = Object.entries(equippedItems)
      .map(([id, t]) => ({ id, ...t, item: closet.find((c) => c.id === id) }))
      .filter((e) => e.item)
      .sort((a, b) => (a.zIndex || 10) - (b.zIndex || 10));

    for (const eq of sortedEquipped) {
      const clothImg = new Image();
      clothImg.crossOrigin = "Anonymous";
      await new Promise((resolve) => {
        clothImg.onload = resolve;
        clothImg.src = eq.item.url;
      });

      const x = (eq.left / 100) * canvas.width;
      const y = (eq.top / 100) * canvas.height;
      const w = (eq.width / 100) * canvas.width;
      const h = (eq.height / 100) * canvas.height;
      const centerX = x + w / 2;
      const centerY = y + h / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      if (eq.rotation) ctx.rotate((eq.rotation * Math.PI) / 180);
      if (eq.flipH) ctx.scale(-1, 1);
      
      ctx.shadowColor = "rgba(52, 18, 28, 0.28)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 8;
      ctx.globalAlpha = eq.opacity || 1;
      
      ctx.drawImage(clothImg, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    ctx.fillStyle = "rgba(52, 18, 28, 0.85)";
    ctx.fillRect(canvas.width - 220, canvas.height - 60, 200, 44);
    ctx.fillStyle = "#FBE4EA";
    ctx.font = "bold 18px Inter, sans-serif";
    ctx.fillText("NOOR • FIT CHECK", canvas.width - 205, canvas.height - 32);

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `noor-fit-check-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast("Snapshot saved to your device!");
  };

  const saveCurrentLook = () => {
    const newLook = {
      id: `look-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bodyPhoto,
      equippedSnapshot: { ...equippedItems },
      itemsCount: Object.keys(equippedItems).length
    };
    setSavedLooks((prev) => [newLook, ...prev]);
    playSfx('equip');
    showToast("Look saved to your lookbook gallery!");
  };

  const loadSavedLook = (look) => {
    setBodyPhoto(look.bodyPhoto);
    setEquippedItems(look.equippedSnapshot);
    playSfx('equip');
    showToast("Loaded saved outfit look!");
  };

  const activeSelectedPiece = selectedStageItemId ? closet.find((c) => c.id === selectedStageItemId) : null;
  const activeSelectedTransform = selectedStageItemId ? equippedItems[selectedStageItemId] : null;

  const filteredCloset = closet.filter((item) => {
    if (activeCategoryFilter === "all") return true;
    return item.category === activeCategoryFilter;
  });

  const equippedCount = Object.keys(equippedItems).length;
  const outfitVibe = useMemo(() => {
    if (equippedCount === 0) return "Bare Canvas";
    if (equippedCount === 1) return "Minimalist Accent";
    if (equippedCount === 2) return "Clean Two-Piece";
    if (equippedCount === 3) return "Complete Fit";
    return "Layered Fashion Statement";
  }, [equippedCount]);

  return (
    <div className="flex flex-col bg-[#FAF7F8] text-[#34121C] rounded-3xl overflow-hidden pb-2">
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-[#34121C] text-[#FBE4EA] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#D6417E] transition-all animate-bounce">
          <SparklesIcon className="w-5 h-5 text-[#F5A8C4]" />
          <span className="font-body text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="rounded-3xl bg-[#34121C] text-white px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-lg mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              title="Back"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-9 h-9 rounded-full bg-[#D6417E] flex items-center justify-center font-display font-bold text-white text-lg">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl tracking-wide font-semibold text-white">Noor</span>
              <span className="bg-[#D6417E]/30 text-[#F5A8C4] text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-[#D6417E]/50">
                Real-Time Game Studio
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors"
            title={soundEnabled ? "Mute Game Audio" : "Enable Game Audio"}
          >
            {soundEnabled ? <Volume2Icon className="w-5 h-5 text-[#F5A8C4]" /> : <VolumeXIcon className="w-5 h-5 text-white/40" />}
          </button>
          
          <button
            onClick={downloadLookSnapshot}
            className="hidden sm:inline-flex items-center gap-2 bg-[#D6417E] hover:bg-[#A61E4D] text-white text-xs font-semibold px-4 py-2 rounded-full transition-transform active:scale-95 shadow"
          >
            <DownloadIcon className="w-4 h-4" /> Export Fit PNG
          </button>

          <button
            onClick={saveCurrentLook}
            className="bg-[#8E4A63] hover:bg-[#703046] text-white text-xs font-semibold px-4 py-2 rounded-full transition-transform active:scale-95"
          >
            Save Look
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: WARDROBE & AI PRESETS */}
        <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F3C7D3]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-[#D6417E]" />
                <h3 className="font-display font-semibold text-base text-[#34121C]">AI Curated Fits</h3>
              </div>
              <span className="text-[11px] font-mono uppercase text-[#8E4A63] bg-[#FBE4EA] px-2 py-0.5 rounded-full">
                1-Click Style
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.label}
                  onClick={() => applyOccasionOutfit(occ)}
                  className={`text-left p-2.5 rounded-2xl border text-xs transition-all ${
                    selectedOccasion === occ.label
                      ? "bg-[#34121C] text-white border-[#34121C] shadow-md"
                      : "bg-[#FAF7F8] hover:bg-[#FBE4EA] text-[#34121C] border-[#F3C7D3]"
                  }`}
                >
                  <p className="font-semibold truncate">{occ.label}</p>
                  <p className={`text-[10px] mt-0.5 truncate ${selectedOccasion === occ.label ? "text-[#F5A8C4]" : "text-[#8E4A63]"}`}>
                    {occ.vibe}
                  </p>
                </button>
              ))}
            </div>

            {aiStylingNote && (
              <p className="font-body text-xs text-[#8E4A63] bg-[#FBE4EA]/60 p-2.5 rounded-xl mt-3 border border-[#F3C7D3]">
                💡 {aiStylingNote}
              </p>
            )}
          </div>

          {/* Closet Grid */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F3C7D3] flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#34121C]">Your Wardrobe</h3>
                <p className="font-body text-xs text-[#8E4A63]">Click any piece to instantly layer it on</p>
              </div>
              <button
                onClick={() => closetFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 bg-[#D6417E] hover:bg-[#A61E4D] text-white text-xs font-semibold px-3.5 py-2 rounded-full transition-transform active:scale-95 shadow"
              >
                <PlusIcon className="w-4 h-4" /> Add Pieces
              </button>
              <input
                ref={closetFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleClosetUpload}
                className="hidden"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategoryFilter(cat.key); playSfx('snap'); }}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    activeCategoryFilter === cat.key
                      ? "bg-[#34121C] text-white shadow-sm"
                      : "bg-[#FBE4EA] text-[#8E4A63] hover:bg-[#F3C7D3]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredCloset.map((item) => {
                const isEquipped = !!equippedItems[item.id];

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleEquipItem(item)}
                    className={`group relative rounded-2xl p-2 cursor-pointer flex flex-col items-center justify-between border-2 transition-all select-none ${
                      isEquipped
                        ? "bg-[#FBE4EA] border-[#D6417E] shadow-md scale-[1.02]"
                        : "bg-[#FAF7F8] border-[#F3C7D3] hover:border-[#D6417E]/50 hover:bg-white"
                    }`}
                  >
                    {isEquipped && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#D6417E] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                        ✓
                      </span>
                    )}

                    <div className="w-full aspect-square flex items-center justify-center p-1.5 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-105"
                      />
                    </div>

                    <div className="w-full text-center mt-1">
                      <p className="font-mono text-[11px] font-semibold text-[#34121C] truncate">{item.name}</p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-[#8E4A63]">{item.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#F3C7D3]/60 flex items-center justify-between text-[11px] text-[#8E4A63]">
              <span className="flex items-center gap-1.5">
                <MagicWandIcon className="w-3.5 h-3.5 text-[#D6417E]" />
                Auto-removes backgrounds on upload
              </span>
              <span className="font-mono text-[#D6417E] font-medium">
                {isProcessingCloset ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  `${closet.length} items`
                )}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: INTERACTIVE FITTING STAGE */}
        <div className="lg:col-span-5 flex flex-col items-center order-1 lg:order-2">
          
          <div className="w-full max-w-md flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-xs font-semibold text-[#34121C] uppercase tracking-wider">
                Live Dressing Stage
              </span>
            </div>
            
            <button
              onClick={() => { setShowComparisonSlider(!showComparisonSlider); playSfx('snap'); }}
              className={`text-xs px-3 py-1 rounded-full font-medium border flex items-center gap-1.5 transition-all ${
                showComparisonSlider
                  ? "bg-[#34121C] text-white border-[#34121C]"
                  : "bg-white text-[#8E4A63] border-[#F3C7D3] hover:bg-[#FBE4EA]"
              }`}
            >
              <EyeIcon className="w-3.5 h-3.5" /> Before / After
            </button>
          </div>

          <div
            ref={stageContainerRef}
            className="relative w-full max-w-md aspect-[3/4.6] bg-white rounded-3xl shadow-2xl border-4 border-[#34121C] overflow-hidden select-none touch-none flex items-center justify-center"
            style={{
              backgroundImage: "radial-gradient(#F5A8C4 0.75px, transparent 0.75px)",
              backgroundSize: "20px 20px"
            }}
            onClick={() => setSelectedStageItemId(null)}
          >
            {/* Body Layer */}
            <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center">
              <img
                src={bodyPhoto}
                alt="Body Model"
                className="w-full h-full object-cover sm:object-contain select-none"
              />
            </div>

            {/* Split Comparison */}
            {showComparisonSlider && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none z-30"
                style={{ clipPath: `polygon(0 0, ${compareSplit}% 0, ${compareSplit}% 100%, 0 100%)` }}
              >
                <div className="absolute inset-0 w-full h-full bg-white/90">
                  <img src={bodyPhoto} alt="Bare Original" className="w-full h-full object-cover sm:object-contain opacity-90" />
                  <div className="absolute top-4 left-4 bg-[#34121C] text-white text-[10px] font-mono px-2 py-1 rounded-md">
                    ORIGINAL
                  </div>
                </div>
              </div>
            )}

            {showComparisonSlider && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-[#D6417E] z-40 cursor-ew-resize flex items-center justify-center pointer-events-auto"
                style={{ left: `${compareSplit}%` }}
                onPointerDown={(e) => {
                  const onMove = (ev) => {
                    const rect = stageContainerRef.current.getBoundingClientRect();
                    const newSplit = Math.max(5, Math.min(95, ((ev.clientX - rect.left) / rect.width) * 100));
                    setCompareSplit(newSplit);
                  };
                  const onUp = () => {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                  };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                }}
              >
                <div className="w-6 h-6 rounded-full bg-[#D6417E] text-white flex items-center justify-center text-[10px] font-bold shadow-lg">
                  ↔
                </div>
              </div>
            )}

            {/* Garment Layers with Direct Manipulation Gizmo */}
            {Object.entries(equippedItems).map(([id, transform]) => {
              const clothItem = closet.find((c) => c.id === id);
              if (!clothItem) return null;

              const isSelected = selectedStageItemId === id;
              const zIndex = transform.zIndex || 10;

              return (
                <div
                  key={id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStageItemId(id);
                    playSfx('snap');
                  }}
                  onPointerDown={(e) => handleStagePointerDown(e, id, 'move')}
                  className={`absolute transition-shadow cursor-grab active:cursor-grabbing select-none ${
                    isSelected ? "transform-gizmo z-50 shadow-2xl" : ""
                  }`}
                  style={{
                    top: `${transform.top}%`,
                    left: `${transform.left}%`,
                    width: `${transform.width}%`,
                    height: `${transform.height}%`,
                    zIndex: isSelected ? 50 : zIndex,
                    transform: `rotate(${transform.rotation || 0}deg) scaleX(${transform.flipH ? -1 : 1})`,
                    transformOrigin: "center center",
                    opacity: transform.opacity || 1,
                    mixBlendMode: transform.blendMode || 'normal',
                    filter: "drop-shadow(0 8px 14px rgba(52, 18, 28, 0.28))"
                  }}
                >
                  <img
                    src={clothItem.url}
                    alt={clothItem.name}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />

                  {isSelected && (
                    <>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#34121C] text-white text-[10px] font-mono px-2 py-0.5 rounded-md whitespace-nowrap shadow flex items-center gap-1.5 pointer-events-auto">
                        <span>{clothItem.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEquipItem(clothItem);
                          }}
                          className="hover:text-[#F5A8C4] ml-1"
                        >
                          ✕
                        </button>
                      </div>

                      <div
                        onPointerDown={(e) => handleStagePointerDown(e, id, 'scale-se')}
                        className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-[#D6417E] border-2 border-white rounded-full cursor-se-resize shadow flex items-center justify-center text-white text-[8px] pointer-events-auto hover:scale-125 transition-transform"
                        title="Drag to resize width & height"
                      >
                        ↘
                      </div>

                      <div
                        onPointerDown={(e) => handleStagePointerDown(e, id, 'scale-proportional')}
                        className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-[#8E4A63] border-2 border-white rounded-full cursor-sw-resize shadow flex items-center justify-center text-white text-[8px] pointer-events-auto hover:scale-125 transition-transform"
                        title="Proportional scale"
                      >
                        ↙
                      </div>

                      <div
                        onPointerDown={(e) => handleStagePointerDown(e, id, 'rotate')}
                        className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#F5A8C4] border-2 border-[#34121C] rounded-full cursor-grab active:cursor-grabbing shadow pointer-events-auto hover:scale-125 transition-transform"
                        title="Drag to rotate"
                      />
                    </>
                  )}
                </div>
              );
            })}

            {equippedCount === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/10 backdrop-blur-[1px] pointer-events-none">
                <SparklesIcon className="w-10 h-10 text-[#D6417E] animate-bounce mb-2" />
                <p className="font-display text-lg font-semibold text-[#34121C]">Fitting Room is Ready</p>
                <p className="font-body text-xs text-[#34121C]/80 mt-1 max-w-xs">
                  Click any piece from your wardrobe on the left to immediately drape it onto the body.
                </p>
              </div>
            )}
          </div>

          {/* Model Controls */}
          <div className="w-full max-w-md bg-white rounded-2xl p-3.5 mt-4 border border-[#F3C7D3] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase text-[#8E4A63]">Model:</span>
              {isDemoMannequin ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateMannequin('#E8C5B0', '#3A2016')}
                    className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#E8C5B0' }}
                    title="Warm Fair"
                  />
                  <button
                    onClick={() => updateMannequin('#C89B7B', '#1E110B')}
                    className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#C89B7B' }}
                    title="Warm Honey"
                  />
                  <button
                    onClick={() => updateMannequin('#7A4B3A', '#0D0704')}
                    className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#7A4B3A' }}
                    title="Deep Rich"
                  />
                </div>
              ) : (
                <span className="text-xs font-semibold text-[#34121C]">Personal Photo</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bodyFileInputRef.current?.click()}
                className="text-xs bg-[#FAF7F8] hover:bg-[#FBE4EA] text-[#34121C] font-medium px-3 py-1.5 rounded-full border border-[#F3C7D3] flex items-center gap-1.5 transition-colors"
              >
                <UploadIcon className="w-3.5 h-3.5 text-[#D6417E]" />
                {isDemoMannequin ? "Upload My Photo" : "Replace Photo"}
              </button>
              <input
                ref={bodyFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBodyPhotoUpload}
                className="hidden"
              />

              {!isDemoMannequin && (
                <button
                  onClick={() => updateMannequin('#E8C5B0', '#3A2016')}
                  className="text-xs text-[#8E4A63] hover:text-[#D6417E] underline"
                >
                  Use Mannequin
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LAYER STACK & FINE-TUNE CONTROLS */}
        <div className="lg:col-span-3 flex flex-col gap-6 order-3">
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F3C7D3]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#8E4A63]">Fit Check Score</span>
              <span className="font-mono text-xs font-bold text-[#D6417E]">{equippedCount}/5 Slots</span>
            </div>
            <h4 className="font-display font-bold text-lg text-[#34121C]">{outfitVibe}</h4>
            
            <div className="w-full bg-[#FBE4EA] h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-[#F5A8C4] via-[#D6417E] to-[#A61E4D] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (equippedCount / 4) * 100)}%` }}
              />
            </div>
          </div>

          {activeSelectedPiece && activeSelectedTransform ? (
            <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-[#D6417E]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F3C7D3]">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#D6417E] font-bold">Selected Item</span>
                  <h4 className="font-display font-bold text-sm text-[#34121C] truncate max-w-[170px]">
                    {activeSelectedPiece.name}
                  </h4>
                </div>
                <button
                  onClick={() => resetItemTransform(activeSelectedPiece.id)}
                  className="p-1.5 hover:bg-[#FBE4EA] rounded-full text-[#8E4A63] transition-colors"
                  title="Reset Position"
                >
                  <ResetIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => toggleFlipH(activeSelectedPiece.id)}
                  className="text-xs py-2 px-2.5 rounded-xl bg-[#FAF7F8] hover:bg-[#FBE4EA] border border-[#F3C7D3] font-medium flex items-center justify-center gap-1.5"
                >
                  <FlipIcon className="w-3.5 h-3.5 text-[#D6417E]" /> Flip Horiz
                </button>
                <button
                  onClick={() => adjustLayerZ(activeSelectedPiece.id, 'up')}
                  className="text-xs py-2 px-2.5 rounded-xl bg-[#FAF7F8] hover:bg-[#FBE4EA] border border-[#F3C7D3] font-medium flex items-center justify-center gap-1.5"
                >
                  <LayersIcon className="w-3.5 h-3.5 text-[#D6417E]" /> Layer Up
                </button>
                <button
                  onClick={() => adjustScale(activeSelectedPiece.id, 'out')}
                  className="text-xs py-2 px-2.5 rounded-xl bg-[#FAF7F8] hover:bg-[#FBE4EA] border border-[#F3C7D3] font-medium flex items-center justify-center gap-1.5"
                >
                  <ZoomOutIcon className="w-3.5 h-3.5 text-[#D6417E]" /> Zoom Out
                </button>
                <button
                  onClick={() => adjustScale(activeSelectedPiece.id, 'in')}
                  className="text-xs py-2 px-2.5 rounded-xl bg-[#FAF7F8] hover:bg-[#FBE4EA] border border-[#F3C7D3] font-medium flex items-center justify-center gap-1.5"
                >
                  <ZoomInIcon className="w-3.5 h-3.5 text-[#D6417E]" /> Zoom In
                </button>
              </div>

              <div className="flex items-center justify-between mb-4 bg-[#FAF7F8] p-2.5 rounded-2xl border border-[#F3C7D3]">
                <span className="text-xs text-[#8E4A63]">Layer Depth (Z):</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustLayerZ(activeSelectedPiece.id, 'down')}
                    className="w-7 h-7 bg-white hover:bg-[#FBE4EA] border border-[#F3C7D3] rounded-lg text-xs font-bold"
                    title="Tuck under other clothes"
                  >
                    ↓
                  </button>
                  <span className="font-mono text-xs font-bold text-[#34121C]">
                    {activeSelectedTransform.zIndex || 10}
                  </span>
                  <button
                    onClick={() => adjustLayerZ(activeSelectedPiece.id, 'up')}
                    className="w-7 h-7 bg-white hover:bg-[#FBE4EA] border border-[#F3C7D3] rounded-lg text-xs font-bold"
                    title="Layer above other clothes"
                  >
                    ↑
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-[#8E4A63] mb-1">
                    <span>Garment Opacity</span>
                    <span className="font-mono font-bold">{Math.round((activeSelectedTransform.opacity || 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={Math.round((activeSelectedTransform.opacity || 1) * 100)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) / 100;
                      setEquippedItems((prev) => ({
                        ...prev,
                        [activeSelectedPiece.id]: { ...prev[activeSelectedPiece.id], opacity: val }
                      }));
                    }}
                    className="w-full accent-[#D6417E]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#8E4A63] block mb-1">Fabric Blend Mode</label>
                  <select
                    value={activeSelectedTransform.blendMode || 'normal'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEquippedItems((prev) => ({
                        ...prev,
                        [activeSelectedPiece.id]: { ...prev[activeSelectedPiece.id], blendMode: val }
                      }));
                      playSfx('snap');
                    }}
                    className="w-full bg-[#FAF7F8] border border-[#F3C7D3] rounded-xl px-3 py-1.5 text-xs text-[#34121C]"
                  >
                    <option value="normal">Normal (Crisp Game Layer)</option>
                    <option value="multiply">Multiply (Photorealistic Shadow Blend)</option>
                    <option value="darken">Darken (Rich Texture)</option>
                    <option value="overlay">Overlay (Vibrant Tone)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F3C7D3]">
              <div className="flex items-center gap-2 mb-3">
                <LayersIcon className="w-4 h-4 text-[#D6417E]" />
                <h4 className="font-display font-semibold text-base text-[#34121C]">Active Outfit Layers</h4>
              </div>

              {equippedCount === 0 ? (
                <p className="font-body text-xs text-[#8E4A63]">No clothing equipped yet.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(equippedItems)
                    .map(([id, t]) => ({ id, ...t, item: closet.find((c) => c.id === id) }))
                    .filter((e) => e.item)
                    .sort((a, b) => (b.zIndex || 10) - (a.zIndex || 10))
                    .map((eq) => (
                      <div
                        key={eq.id}
                        onClick={() => setSelectedStageItemId(eq.id)}
                        className="flex items-center justify-between p-2 rounded-2xl bg-[#FAF7F8] hover:bg-[#FBE4EA] border border-[#F3C7D3] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={eq.item.url} alt="" className="w-8 h-8 object-contain rounded-lg bg-white p-0.5 border" />
                          <div className="text-left">
                            <p className="font-mono text-xs font-semibold text-[#34121C] truncate max-w-[120px]">{eq.item.name}</p>
                            <p className="font-mono text-[9px] uppercase text-[#8E4A63]">Layer Z: {eq.zIndex || 10}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEquipItem(eq.item);
                          }}
                          className="text-[#8E4A63] hover:text-[#A61E4D] p-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Lookbook Gallery */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F3C7D3] flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-semibold text-base text-[#34121C]">Saved Lookbook</h4>
              <span className="font-mono text-xs text-[#D6417E]">{savedLooks.length}</span>
            </div>

            {savedLooks.length === 0 ? (
              <p className="font-body text-xs text-[#8E4A63]">Click 'Save Look' to pin current combinations here.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto">
                {savedLooks.map((look) => (
                  <div
                    key={look.id}
                    onClick={() => loadSavedLook(look)}
                    className="p-2 rounded-2xl bg-[#FAF7F8] hover:bg-[#FBE4EA] border border-[#F3C7D3] cursor-pointer text-center group transition-all"
                  >
                    <span className="text-xl">✨</span>
                    <p className="font-mono text-[10px] font-semibold mt-1 text-[#34121C]">{look.itemsCount} Pieces</p>
                    <p className="font-mono text-[9px] text-[#8E4A63]">{look.createdAt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};
