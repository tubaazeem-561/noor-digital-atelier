import React, { useState } from 'react';
import { Garment, GarmentCategory, GenderPreference } from '../types';

interface AddGarmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGarment: (garment: Garment) => void;
  currentGender?: GenderPreference;
}

const SAMPLE_GARMENT_PRESETS = [
  {
    name: 'Silk Crepe Top',
    category: 'tops' as const,
    image:
      'https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80',
    color: '#34121C',
    material: '100% Heavy Silk Crepe',
    notes: 'Bias-cut drape with cowl neckline.',
    tags: ['Silk', 'Elegant', 'Top']
  },
  {
    name: 'Fine Gauge Cashmere Knit',
    category: 'tops' as const,
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    color: '#E8DED8',
    material: 'Grade A Baby Cashmere',
    notes: 'Soft ribbed knit with relaxed silhouette.',
    tags: ['Cashmere', 'Warm', 'Essential']
  },
  {
    name: 'Tailored Wide-Leg Trousers',
    category: 'bottoms' as const,
    image:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    color: '#1C1C1E',
    material: 'Virgin Wool Gabardine',
    notes: 'High-waisted crisp front pleat tailoring.',
    tags: ['Trousers', 'Tailored', 'Black']
  }
];

export const AddGarmentModal: React.FC<AddGarmentModalProps> = ({
  isOpen,
  onClose,
  onAddGarment,
  currentGender = 'woman'
}) => {
  const categoryOptionsByGender: Record<GenderPreference, { key: GarmentCategory; label: string }[]> = {
    woman: [
      { key: 'tops', label: 'Top' },
      { key: 'bottoms', label: 'Bottom' },
      { key: 'accessories', label: 'Accessory' },
      { key: 'bags', label: 'Bag' },
      { key: 'shoes', label: 'Shoes' },
      { key: 'hijab', label: 'Hijab' }
    ],
    man: [
      { key: 'shirts/t-shirts', label: 'Shirt / T-Shirt' },
      { key: 'bottoms', label: 'Bottom' },
      { key: 'accessories', label: 'Accessory' },
      { key: 'tie', label: 'Tie' },
      { key: 'shoes', label: 'Shoes' }
    ],
    others: [
      { key: 'tops', label: 'Top' },
      { key: 'shirts/t-shirts', label: 'Shirt / T-Shirt' },
      { key: 'bottoms', label: 'Bottom' },
      { key: 'accessories', label: 'Accessory' },
      { key: 'bags', label: 'Bag' },
      { key: 'shoes', label: 'Shoes' },
      { key: 'hijab', label: 'Hijab' },
      { key: 'tie', label: 'Tie' }
    ]
  };

  const availableCategories = categoryOptionsByGender[currentGender] || categoryOptionsByGender.woman;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory>(availableCategories[0].key);
  const [image, setImage] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a name for this clothing item.');
      return;
    }

    const newGarment: Garment = {
      id: `garment-${Date.now()}`,
      name: name.trim(),
      brand: 'Personal Closet',
      category: category as any,
      image:
        image ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      color: '#E8DED8',
      material: notes || 'Personal piece',
      notes,
      isArchived: false,
      tags: [category]
    };

    onAddGarment(newGarment);
    setName('');
    setImage('');
    setNotes('');
    onClose();
  };

  const handleApplyPreset = (preset: typeof SAMPLE_GARMENT_PRESETS[0]) => {
    setName(preset.name);
    setCategory(preset.category as any);
    setImage(preset.image);
    setNotes(preset.notes);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--theme-surface)] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[var(--theme-border)] shadow-[var(--theme-shadow-lg)] max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
          <div>
            <span className="font-sans text-xs text-[var(--theme-primary)] uppercase tracking-widest font-semibold">
              Personal Closet
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[var(--theme-heading)] mt-0.5">
              + Add Clothes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--theme-surface-subtle)] hover:bg-[var(--theme-surface)] text-[var(--theme-heading)] flex items-center justify-center transition-colors border border-[var(--theme-border)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Upload or Photo Selection area */}
        <div className="space-y-3">
          <label className="block text-xs font-sans uppercase tracking-wider text-[var(--theme-body)] font-semibold">
            Photo of your item
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-28 rounded-2xl bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] overflow-hidden flex items-center justify-center shrink-0">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl text-[var(--theme-muted)]">
                  photo_camera
                </span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <label className="w-full py-2.5 px-4 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] text-xs font-serif rounded-full cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-[var(--theme-shadow-sm)]">
                <span className="material-symbols-outlined text-base">photo_camera</span>
                <span>Take or Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or paste image link..."
                className="w-full px-3.5 py-1.5 bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] focus:border-[var(--theme-primary)] rounded-xl text-xs outline-none font-sans text-[var(--theme-heading)]"
              />
            </div>
          </div>
        </div>

        {/* Quick Example Presets */}
        <div className="p-3 bg-[var(--theme-surface-subtle)] rounded-2xl border border-[var(--theme-border)] space-y-1.5">
          <span className="text-[10px] font-sans uppercase tracking-wider text-[var(--theme-primary)] font-semibold">
            Try a sample item:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_GARMENT_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] text-[11px] font-sans text-[var(--theme-heading)] rounded-lg border border-[var(--theme-border)] transition-colors shadow-[var(--theme-shadow-sm)] cursor-pointer"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-sans uppercase tracking-wider text-[var(--theme-body)] font-semibold">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableCategories.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setCategory(opt.key)}
                  className={`py-2 px-3 rounded-2xl border text-xs font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    category === opt.key
                      ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] border-[var(--theme-primary)] font-semibold shadow-[var(--theme-shadow-sm)]'
                      : 'bg-[var(--theme-surface-subtle)] border-[var(--theme-border)] text-[var(--theme-heading)] hover:border-[var(--theme-primary)]'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-sans uppercase tracking-wider text-[var(--theme-body)] font-semibold">
              Name of item *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Black Top, Blue Jeans, Silk Scarf"
              className="w-full px-4 py-2.5 bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] focus:border-[var(--theme-primary)] rounded-xl text-sm outline-none font-sans text-[var(--theme-heading)]"
            />
          </div>

          {/* Details (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-sans uppercase tracking-wider text-[var(--theme-body)] font-semibold">
              Details (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Silk crepe, favorite evening fit"
              className="w-full px-4 py-2 bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] focus:border-[var(--theme-primary)] rounded-xl text-xs outline-none font-sans text-[var(--theme-heading)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--theme-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full font-serif text-sm text-[var(--theme-body)] hover:bg-[var(--theme-surface-subtle)] hover:text-[var(--theme-heading)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full font-serif text-sm shadow-[var(--theme-shadow-sm)] transition-colors cursor-pointer"
            >
              Save to My Closet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGarmentModal;
