import React, { useState } from 'react';
import { Garment, GarmentCategory } from '../types';

interface ClosetScreenProps {
  garments: Garment[];
  onAddGarmentClick: () => void;
  onSelectGarment: (garment: Garment) => void;
  onDeleteGarment: (id: string) => void;
  onArchiveGarment: (id: string) => void;
  onRestoreGarment: (id: string) => void;
  onStyleWithPieces: (garmentIds: string[]) => void;
}

export const ClosetScreen: React.FC<ClosetScreenProps> = ({
  garments,
  onAddGarmentClick,
  onSelectGarment,
  onDeleteGarment,
  onArchiveGarment,
  onRestoreGarment,
  onStyleWithPieces
}) => {
  const [viewMode, setViewMode] = useState<'closet' | 'archive'>('closet');
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'name'>('latest');

  const categories: { key: GarmentCategory; label: string }[] = [
    { key: 'all', label: 'All Pieces' },
    { key: 'tops', label: 'Tops' },
    { key: 'bottoms', label: 'Bottoms' },
    { key: 'dresses', label: 'Dresses' },
    { key: 'shoes', label: 'Shoes' },
    { key: 'bags', label: 'Bags' },
    { key: 'accessories', label: 'Accessories' }
  ];

  // Active vs Archived separation
  const activeGarments = garments.filter((g) => !g.isArchived);
  const archivedGarments = garments.filter((g) => g.isArchived === true);

  const displayedSource = viewMode === 'closet' ? activeGarments : archivedGarments;

  const filteredGarments = displayedSource
    .filter((item) => {
      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.material && item.material.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const toggleSelectPiece = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10 pb-16 animate-fadeIn">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-primary)] rounded-full text-xs font-sans uppercase tracking-widest font-semibold shadow-[var(--theme-shadow-sm)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]"></span>
          Personal Wardrobe
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl text-[var(--theme-heading)] font-normal tracking-tight">
              {viewMode === 'closet' ? 'My Closet' : 'Your Archived Clothes'}
            </h1>
            <p className="font-sans text-[var(--theme-body)] text-base sm:text-lg max-w-xl mt-1 leading-relaxed">
              {viewMode === 'closet'
                ? 'Only the clothes and accessories you own. NOOR styles looks strictly from this collection.'
                : 'Items in your archive are safely stored and will not be used in outfit recommendations until restored.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Style Selected Quick Action */}
            {viewMode === 'closet' && selectedIds.length > 0 && (
              <button
                onClick={() => onStyleWithPieces(selectedIds)}
                className="px-5 py-2.5 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full text-xs font-serif flex items-center gap-2 transition-all shadow-[var(--theme-shadow-md)] cursor-pointer"
              >
                <span>Style {selectedIds.length} Selected</span>
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
              </button>
            )}

            <button
              onClick={onAddGarmentClick}
              className="px-6 py-3 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full text-xs font-sans uppercase tracking-wider font-semibold transition-all flex items-center gap-2 flex-shrink-0 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>+ Add Clothes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode Switcher: My Closet vs Archive */}
      <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
        <div className="flex items-center gap-2 p-1 bg-[var(--theme-surface)] rounded-full border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)]">
          <button
            onClick={() => {
              setViewMode('closet');
              setSelectedIds([]);
            }}
            className={`px-5 py-2 rounded-full text-xs font-sans uppercase tracking-wider font-medium transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'closet'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-[var(--theme-shadow-sm)]'
                : 'text-[var(--theme-body)] hover:text-[var(--theme-heading)]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">checkroom</span>
            <span>Active Closet ({activeGarments.length})</span>
          </button>

          <button
            onClick={() => {
              setViewMode('archive');
              setSelectedIds([]);
            }}
            className={`px-5 py-2 rounded-full text-xs font-sans uppercase tracking-wider font-medium transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'archive'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-[var(--theme-shadow-sm)]'
                : 'text-[var(--theme-body)] hover:text-[var(--theme-heading)]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">archive</span>
            <span>Archive ({archivedGarments.length})</span>
          </button>
        </div>

        {/* View mode notice */}
        <span className="text-xs font-sans text-[var(--theme-muted)] hidden md:inline">
          {viewMode === 'closet'
            ? `${activeGarments.length} pieces ready to style`
            : `${archivedGarments.length} archived pieces hidden from recommendations`}
        </span>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-muted)]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your clothes..."
            className="w-full pl-12 pr-4 py-3 bg-[var(--theme-surface)] border border-[var(--theme-border)] focus:border-[var(--theme-primary)] rounded-full text-sm text-[var(--theme-heading)] placeholder-[var(--theme-muted)] outline-none transition-all shadow-[var(--theme-shadow-sm)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--theme-muted)] hover:text-[var(--theme-heading)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Sort & Quick Actions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-full text-xs font-sans uppercase tracking-wider text-[var(--theme-heading)] focus:border-[var(--theme-primary)] focus:outline-none shadow-[var(--theme-shadow-sm)] cursor-pointer"
          >
            <option value="latest">Sort: Recently Added</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--theme-border)]">
        {categories.map((cat) => {
          const count =
            cat.key === 'all'
              ? displayedSource.length
              : displayedSource.filter((g) => g.category === cat.key).length;

          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] font-semibold shadow-[var(--theme-shadow-sm)]'
                  : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-body)] hover:text-[var(--theme-heading)] hover:border-[var(--theme-border-hover)]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.key
                    ? 'bg-white/20 text-[var(--theme-primary-text)]'
                    : 'bg-[var(--theme-surface-subtle)] text-[var(--theme-primary)] font-medium'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Garments Grid */}
      {filteredGarments.length === 0 ? (
        <div className="p-12 text-center bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-border)] space-y-4 shadow-[var(--theme-shadow-sm)] max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[var(--theme-surface-subtle)] text-[var(--theme-primary)] mx-auto flex items-center justify-center border border-[var(--theme-border)]">
            <span className="material-symbols-outlined text-3xl">
              {viewMode === 'closet' ? 'checkroom' : 'archive'}
            </span>
          </div>
          <h3 className="font-serif text-2xl text-[var(--theme-heading)]">
            {viewMode === 'closet' ? 'Your closet is empty' : 'No archived clothes'}
          </h3>
          <p className="text-xs font-sans text-[var(--theme-body)] leading-relaxed">
            {viewMode === 'closet'
              ? 'Add photos of your clothes and accessories to let NOOR style personalized outfits for you.'
              : 'Items you archive from your closet will appear here so you can easily restore them whenever you want.'}
          </p>
          {viewMode === 'closet' && (
            <button
              onClick={onAddGarmentClick}
              className="px-6 py-3 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] rounded-full text-xs font-sans uppercase tracking-wider font-semibold shadow-[var(--theme-shadow-sm)] cursor-pointer inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              <span>+ Add Clothes</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Render Garment Cards */}
          {filteredGarments.map((garment) => {
            const isSelected = selectedIds.includes(garment.id);

            return (
              <div
                key={garment.id}
                onClick={() => onSelectGarment(garment)}
                className={`group relative bg-[var(--theme-surface)] rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[var(--theme-primary)] shadow-[var(--theme-shadow-md)] ring-2 ring-[var(--theme-primary)]/40'
                    : 'border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] hover:shadow-[var(--theme-shadow-md)]'
                }`}
              >
                {/* Image Container with Arch/Aspect */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[var(--theme-surface-subtle)]">
                  <img
                    src={garment.image}
                    alt={garment.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Selection Checkbox (closet mode only) */}
                  {viewMode === 'closet' && (
                    <button
                      type="button"
                      onClick={(e) => toggleSelectPiece(garment.id, e)}
                      className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-text)] shadow-[var(--theme-shadow-sm)]'
                          : 'bg-white/90 text-transparent hover:text-[var(--theme-primary)] border border-[var(--theme-border)]'
                      }`}
                      title={isSelected ? 'Deselect piece' : 'Select for styling'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isSelected ? 'check' : 'add'}
                      </span>
                    </button>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-[var(--theme-glass)] backdrop-blur-md rounded-full text-[10px] font-sans tracking-widest uppercase text-[var(--theme-heading)] font-semibold border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)]">
                    {garment.category}
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    {viewMode === 'closet' ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveGarment(garment.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-amber-50 text-[var(--theme-body)] hover:text-amber-800 flex items-center justify-center shadow-[var(--theme-shadow-sm)] border border-[var(--theme-border)] cursor-pointer transition-colors"
                          title="Move to Archive (hide from outfit recommendations)"
                        >
                          <span className="material-symbols-outlined text-[16px]">archive</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove "${garment.name}" from your closet?`)) {
                              onDeleteGarment(garment.id);
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-[var(--theme-muted)] hover:text-rose-700 flex items-center justify-center shadow-[var(--theme-shadow-sm)] border border-[var(--theme-border)] cursor-pointer transition-colors"
                          title="Delete piece permanently"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestoreGarment(garment.id);
                        }}
                        className="px-3 py-1.5 rounded-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-[var(--theme-primary-text)] font-sans text-xs font-semibold flex items-center gap-1 shadow-[var(--theme-shadow-sm)] cursor-pointer transition-colors"
                        title="Restore to Active Closet"
                      >
                        <span className="material-symbols-outlined text-[14px]">unarchive</span>
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Info Block */}
                <div className="p-4 space-y-1.5 bg-[var(--theme-surface)]">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-base text-[var(--theme-heading)] group-hover:text-[var(--theme-primary)] transition-colors leading-snug line-clamp-1">
                      {garment.name}
                    </h3>
                  </div>

                  <p className="font-sans text-xs text-[var(--theme-body)] line-clamp-1">
                    {garment.material || garment.notes || garment.brand || 'Personal wardrobe piece'}
                  </p>

                  {/* In archive mode, show restore footer */}
                  {viewMode === 'archive' && (
                    <div className="pt-2 border-t border-[var(--theme-border)] flex items-center justify-between">
                      <span className="text-[10px] font-sans text-amber-700 uppercase font-semibold">
                        Archived
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestoreGarment(garment.id);
                        }}
                        className="text-xs font-sans text-[var(--theme-primary)] hover:underline font-medium cursor-pointer"
                      >
                        Restore to Closet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add New Piece Card (in closet mode) */}
          {viewMode === 'closet' && (
            <div
              onClick={onAddGarmentClick}
              className="border border-dashed border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-subtle)] rounded-3xl aspect-[3/4] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 group shadow-[var(--theme-shadow-sm)]"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--theme-surface-subtle)] border border-[var(--theme-border)] shadow-[var(--theme-shadow-sm)] flex items-center justify-center text-[var(--theme-primary)] group-hover:scale-110 transition-transform mb-3">
                <span className="material-symbols-outlined text-3xl">photo_camera</span>
              </div>
              <h3 className="font-serif text-lg text-[var(--theme-heading)] group-hover:text-[var(--theme-primary)] transition-colors">
                + Add Clothes
              </h3>
              <p className="font-sans text-xs text-[var(--theme-body)] mt-1 max-w-[180px]">
                Snap a photo or upload from your device
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClosetScreen;
