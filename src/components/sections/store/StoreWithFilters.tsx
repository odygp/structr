'use client';

import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function StoreWithFilters({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'store');
  const gridCols = getGridColsClass(content._columns);
  const products = Array.isArray(content.products) ? content.products : [];
  const categories = ['All', 'Category 1', 'Category 2', 'Category 3', 'Category 4'];

  return (
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col @md:flex-row @md:items-end @md:justify-between gap-4 mb-8">
          <div>
            <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}><EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Products" /></h2>
            {content.subtitle && <p className={`mt-2 ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>}
          </div>
          {content.ctaText && (
            <button className={`${c.btnPrimary} rounded-lg px-5 py-2.5 text-sm font-medium self-start @md:self-auto`}>
              <EditableText sectionId={id} fieldKey="ctaText" value={content.ctaText as string} placeholder="View All" />
            </button>
          )}
        </div>

        {/* Horizontal filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === 0
                  ? `${c.btnPrimary}`
                  : `${c.bgAlt} ${c.textSecondary} border ${c.border}`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className={`grid ${gridCols} gap-6`}>
          {products.map((product: any, i: number) => (
            <div key={i} className={`${c.bgCard} border ${c.border} rounded-xl overflow-hidden group`}>
              <div className={`${c.bgPlaceholder} h-48 @md:h-56`} />
              <div className="p-4">
                <h3 className={`font-semibold ${c.text} mb-1`}>{product.title || `Product ${i + 1}`}</h3>
                <p className={`text-sm ${c.textSecondary} mb-3 line-clamp-2`}>{product.description || 'Product description goes here.'}</p>
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${c.text}`}>{product.price || '$29.99'}</span>
                  <button className={`${c.btnPrimary} rounded-lg px-3 py-1.5 text-xs font-medium`}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
