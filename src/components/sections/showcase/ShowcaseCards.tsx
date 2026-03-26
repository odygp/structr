'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function ShowcaseCards({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'showcase');
  const categories = (content.categories as Array<{ label: string }>) || [];
  const items = (content.items as Array<{ title: string; description: string; category: string; price: string; oldPrice: string }>) || [];

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        {/* Top bar: title + CTA */}
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          <button className={`${c.btnPrimary} px-5 py-2.5 rounded-lg text-sm font-medium`}>
            {content.ctaText as string || 'View All'}
          </button>
        </div>

        {/* Category tabs */}
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat, i) => (
            <span
              key={i}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${
                i === 0 ? c.btnPrimary : `${c.btnSecondary}`
              }`}
            >
              {cat.label}
            </span>
          ))}
        </div>

        {/* Main dark container */}
        <div className={`mt-8 ${c.bgAlt} rounded-2xl p-6 @md:p-8`}>
          <div className="grid grid-cols-1 @lg:grid-cols-12 gap-6">
            {/* Featured card (left) */}
            <div className="@lg:col-span-4 flex flex-col justify-between">
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${c.textMuted}`}>
                  {categories[0]?.label || 'Featured'}
                </span>
                <h3 className={`mt-3 text-xl @md:text-2xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h3>
                <p className={`mt-3 text-sm ${c.textSecondary} leading-relaxed`}>
                  Explore our curated selection of top products and content in this category.
                </p>
              </div>
              <button className={`mt-6 ${c.btnPrimary} px-5 py-2.5 rounded-lg text-sm font-medium w-fit`}>
                {content.ctaText as string || 'Explore'}
              </button>
            </div>

            {/* Product cards (right) */}
            <div className="@lg:col-span-8 grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4">
              {items.slice(0, 3).map((item, i) => (
                <div key={i} className={`${c.bgCard} rounded-xl p-4 flex flex-col`}>
                  {/* Image placeholder */}
                  <div className={`${c.bgPlaceholder} h-40 rounded-lg w-full`} />
                  {/* Category badge */}
                  <span className={`mt-3 inline-block w-fit px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.border} ${c.textMuted}`}>
                    {item.category}
                  </span>
                  {/* Title */}
                  <h4 className={`mt-2 text-sm font-semibold ${c.text}`}>{item.title}</h4>
                  {/* Description */}
                  <p className={`mt-1 text-xs ${c.textSecondary} leading-relaxed line-clamp-2`}>{item.description}</p>
                  {/* Price row */}
                  <div className="mt-auto pt-3 flex items-center gap-2">
                    <span className={`text-sm font-bold ${c.text}`}>{item.price}</span>
                    {item.oldPrice && (
                      <span className={`text-xs ${c.textMuted} line-through`}>{item.oldPrice}</span>
                    )}
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
