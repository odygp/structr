'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function StoreGrid({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'store');
  const products = (content.products as Array<{ title: string; description: string; price: string }>) || [];

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <div key={i} className={`${c.bgAlt} rounded-xl overflow-hidden`}>
              {/* Image placeholder */}
              <div className={`${c.bgPlaceholder} h-48 w-full`} />
              <div className="p-5">
                <h3 className={`text-base font-semibold ${c.text}`}>{product.title}</h3>
                <p className={`mt-1 text-sm ${c.textSecondary} line-clamp-2`}>{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-lg font-bold ${c.text}`}>{product.price}</span>
                  <button className={`${c.btnPrimary} px-4 py-2 rounded-lg text-xs font-medium`}>
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
