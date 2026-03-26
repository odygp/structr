'use client';

import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function StoreSideFilters({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'store');
  const products = Array.isArray(content.products) ? content.products : [];

  const filterGroups = [
    { title: 'Category', options: ['All Products', 'Electronics', 'Clothing', 'Accessories'] },
    { title: 'Price Range', options: ['Under $25', '$25 - $50', '$50 - $100', 'Over $100'] },
    { title: 'Rating', options: ['4 Stars & Up', '3 Stars & Up', '2 Stars & Up'] },
    { title: 'Availability', options: ['In Stock', 'Pre-order'] },
  ];

  return (
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>{content.title || 'Products'}</h2>
          {content.subtitle && <p className={`mt-2 ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>}
        </div>

        <div className="flex flex-col @lg:flex-row gap-8">
          {/* Sidebar filters */}
          <div className="@lg:w-64 flex-shrink-0">
            {/* Mobile: horizontal scroll filter summary */}
            <div className="@lg:hidden flex flex-wrap gap-2 mb-4">
              <button className={`${c.btnPrimary} rounded-full px-4 py-2 text-sm font-medium`}>All Filters</button>
              <button className={`${c.bgAlt} ${c.textSecondary} border ${c.border} rounded-full px-3 py-2 text-xs`}>Category</button>
              <button className={`${c.bgAlt} ${c.textSecondary} border ${c.border} rounded-full px-3 py-2 text-xs`}>Price</button>
              <button className={`${c.bgAlt} ${c.textSecondary} border ${c.border} rounded-full px-3 py-2 text-xs`}>Rating</button>
            </div>

            {/* Desktop: full sidebar */}
            <div className="hidden @lg:block space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${c.text}`}>Filters</h3>
                <button className={`text-sm ${c.textSecondary} hover:underline`}>Clear all</button>
              </div>

              {filterGroups.map((group, gi) => (
                <div key={gi} className={`pb-5 border-b ${c.border}`}>
                  <h4 className={`text-sm font-medium ${c.text} mb-3`}>{group.title}</h4>
                  <div className="space-y-2">
                    {group.options.map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-2.5 text-sm ${c.textSecondary} cursor-pointer`}>
                        <div className={`w-4 h-4 rounded border-2 ${c.border} flex items-center justify-center`}>
                          {oi === 0 && <div className={`w-2 h-2 rounded-sm ${colorMode === 'dark' ? 'bg-white' : 'bg-gray-900'}`} />}
                        </div>
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Price range slider placeholder */}
              <div>
                <h4 className={`text-sm font-medium ${c.text} mb-3`}>Price</h4>
                <div className={`h-1.5 rounded-full ${c.bgMuted} relative`}>
                  <div className={`absolute left-[15%] right-[30%] h-full rounded-full ${colorMode === 'dark' ? 'bg-white' : 'bg-gray-900'}`} />
                  <div className={`absolute left-[15%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${colorMode === 'dark' ? 'bg-white' : 'bg-gray-900'} border-2 ${c.bg}`} />
                  <div className={`absolute right-[30%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${colorMode === 'dark' ? 'bg-white' : 'bg-gray-900'} border-2 ${c.bg}`} />
                </div>
                <div className={`flex justify-between mt-2 text-xs ${c.textSecondary}`}>
                  <span>$25</span>
                  <span>$75</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${c.border}`}>
              <span className={`text-sm ${c.textSecondary}`}>{products.length} products</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${c.textSecondary}`}>Sort by:</span>
                <div className={`${c.bgCard} border ${c.border} rounded-lg px-3 py-1.5 text-sm ${c.text}`}>
                  Popular
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-2 @lg:grid-cols-3 gap-5">
              {products.map((product: any, i: number) => (
                <div key={i} className={`${c.bgCard} border ${c.border} rounded-xl overflow-hidden`}>
                  <div className={`${c.bgPlaceholder} h-44`} />
                  <div className="p-4">
                    <div className={`text-xs ${c.textMuted} mb-1`}>{product.category || 'Category'}</div>
                    <h3 className={`font-semibold ${c.text} mb-1`}>{product.title || `Product ${i + 1}`}</h3>
                    <p className={`text-sm ${c.textSecondary} mb-3 line-clamp-2`}>{product.description || 'Product description.'}</p>
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
        </div>
      </div>
    </section>
  );
}
