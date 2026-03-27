'use client';
import { useState } from 'react';
import { sectionRegistry } from '@/lib/registry';
import { useBuilderStore } from '@/lib/store';
import { SectionCategory } from '@/lib/types';
import * as Icons from 'lucide-react';
import { ChevronRight, Search } from 'lucide-react';
import VariantThumbnail from './VariantThumbnail';

export default function SectionCatalog() {
  const addSection = useBuilderStore((s) => s.addSection);
  const sidebarSearch = useBuilderStore((s) => s.sidebarSearch);
  const setSidebarSearch = useBuilderStore((s) => s.setSidebarSearch);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const query = sidebarSearch.toLowerCase().trim();

  const filteredRegistry = sectionRegistry
    .map((def) => {
      if (!query) return def;
      const categoryMatch = def.categoryLabel.toLowerCase().includes(query);
      const matchingVariants = def.variants.filter((v) =>
        v.variantName.toLowerCase().includes(query)
      );
      if (categoryMatch) return def;
      if (matchingVariants.length > 0) return { ...def, variants: matchingVariants };
      return null;
    })
    .filter(Boolean) as typeof sectionRegistry;

  return (
    <nav aria-label="Section catalog" className="w-[240px] border-r border-[#e6e6e6] bg-white overflow-y-auto flex-shrink-0">
      {/* Header + Search */}
      <div className="flex flex-col gap-[12px] p-[12px]">
        <div className="flex flex-col gap-[12px] py-[4px]">
          <h2 className="text-[14px] font-medium leading-[14px] tracking-[-0.28px] text-[#1c1c1c]">
            Select Sections
          </h2>
          {/* Search */}
          <div className="bg-[#f5f5f5] flex items-center gap-[8px] h-[36px] rounded-[8px] px-[12px]">
            <Search className="w-[14px] h-[14px] text-[#1c1c1c] flex-shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search"
              aria-label="Search sections"
              className="flex-1 bg-transparent text-[12px] text-[#1c1c1c] placeholder:text-[#1c1c1c] placeholder:opacity-50 outline-none"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="bg-[#e6e6e6] h-px opacity-60 w-full" />

        {/* Category list */}
        <div className="flex flex-col gap-[2px] p-[4px]">
          {filteredRegistry.map((def) => {
            const isOpen = openCategories.has(def.category) || !!query;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const IconComponent = (Icons as any)[def.icon] || Icons.Box;
            return (
              <div key={def.category}>
                <button
                  onClick={() => toggleCategory(def.category)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between h-[36px] px-[12px] rounded-[8px] hover:bg-[#f5f5f5] transition-colors"
                >
                  <div className="flex items-center gap-[8px]">
                    <IconComponent className="w-[14px] h-[14px] text-[#1c1c1c]" aria-hidden="true" />
                    <span className="text-[12px] font-normal text-[#1c1c1c] whitespace-nowrap">{def.categoryLabel}</span>
                  </div>
                  <ChevronRight
                    className={`w-[14px] h-[14px] text-[#1c1c1c] transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="grid grid-cols-2 gap-1.5 px-2 mt-1 mb-2" role="group" aria-label={`${def.categoryLabel} variants`}>
                    {def.variants.map((variant) => (
                      <button
                        key={variant.variantId}
                        onClick={() => addSection(def.category as SectionCategory, variant.variantId)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/structr-section', JSON.stringify({
                            category: def.category,
                            variantId: variant.variantId,
                          }));
                          e.dataTransfer.effectAllowed = 'copy';
                          // Create a clean drag ghost — must stay in DOM until browser captures it
                          const ghost = document.createElement('div');
                          ghost.id = 'structr-drag-ghost';
                          ghost.textContent = variant.variantName;
                          ghost.style.cssText = 'position:absolute;top:-9999px;left:-9999px;padding:8px 16px;background:#1c1c1c;color:white;border-radius:8px;font-size:12px;font-family:Inter,sans-serif;font-weight:500;white-space:nowrap;';
                          document.body.appendChild(ghost);
                          e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
                          // Remove after a short delay so browser has time to capture
                          setTimeout(() => ghost.remove(), 100);
                        }}
                        onDragEnd={() => {
                          document.getElementById('structr-drag-ghost')?.remove();
                        }}
                        aria-label={`Add ${variant.variantName} section`}
                        className="flex flex-col items-center p-2 rounded-[8px] border border-[#e6e6e6] hover:border-[#1c1c1c] hover:bg-[#f5f5f5] transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c1c] cursor-grab active:cursor-grabbing"
                      >
                        <VariantThumbnail variantId={variant.variantId} variantName={variant.variantName} />
                        <span className="text-[11px] text-[#808080] group-hover:text-[#1c1c1c] mt-1.5 text-center leading-tight">
                          {variant.variantName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {filteredRegistry.length === 0 && query && (
            <p className="text-[12px] text-[#808080] text-center py-6">No sections match &ldquo;{sidebarSearch}&rdquo;</p>
          )}
        </div>
      </div>
    </nav>
  );
}
