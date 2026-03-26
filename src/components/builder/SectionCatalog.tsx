'use client';
import { useState } from 'react';
import { sectionRegistry } from '@/lib/registry';
import { useBuilderStore } from '@/lib/store';
import { SectionCategory } from '@/lib/types';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronRight, Plus, Search, Sparkles } from 'lucide-react';
import VariantThumbnail from './VariantThumbnail';

const templates = [
  { id: 'saas-landing', label: 'SaaS Landing' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'blog', label: 'Blog' },
];

export default function SectionCatalog() {
  const addSection = useBuilderStore((s) => s.addSection);
  const applyTemplate = useBuilderStore((s) => s.applyTemplate);
  const sidebarSearch = useBuilderStore((s) => s.sidebarSearch);
  const setSidebarSearch = useBuilderStore((s) => s.setSidebarSearch);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['hero']));

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
    <nav aria-label="Section catalog" className="w-72 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 text-sm">Sections</h2>
        <p className="text-xs text-gray-500 mt-1">Click to add to your page</p>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
          <input
            type="text"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Search sections..."
            aria-label="Search sections"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Templates */}
      {!query && (
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-gray-700">Templates</span>
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Page templates">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  const sections = useBuilderStore.getState().getActivePage()?.sections || [];
                  if (sections.length > 0 && !window.confirm('This will replace all sections on this page. Continue?')) return;
                  applyTemplate(t.id);
                }}
                aria-label={`Apply ${t.label} template`}
                className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-lg transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-2">
        {filteredRegistry.map((def) => {
          const isOpen = openCategories.has(def.category) || !!query;
          const IconComponent = (Icons as any)[def.icon] || Icons.Box;
          return (
            <div key={def.category} className="mb-1">
              <button
                onClick={() => toggleCategory(def.category)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <IconComponent className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <span className="flex-1 text-left">{def.categoryLabel}</span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" aria-hidden="true" />
                )}
              </button>
              {isOpen && (
                <div className="grid grid-cols-2 gap-1.5 px-2 mt-1 mb-2" role="group" aria-label={`${def.categoryLabel} variants`}>
                  {def.variants.map((variant) => (
                    <button
                      key={variant.variantId}
                      onClick={() =>
                        addSection(def.category as SectionCategory, variant.variantId)
                      }
                      aria-label={`Add ${variant.variantName} section`}
                      className="flex flex-col items-center p-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition-colors group outline-none"
                    >
                      <VariantThumbnail variantId={variant.variantId} variantName={variant.variantName} />
                      <span className="text-[11px] text-gray-600 group-hover:text-blue-600 mt-1.5 text-center leading-tight">{variant.variantName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filteredRegistry.length === 0 && query && (
          <p className="text-xs text-gray-500 text-center py-6" role="status">No sections match &ldquo;{sidebarSearch}&rdquo;</p>
        )}
      </div>
    </nav>
  );
}
