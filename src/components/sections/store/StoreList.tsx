'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function StoreList({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'store');
  const products = (content.products as Array<{ title: string; description: string; price: string }>) || [];

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            {content.title as string}
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            {content.subtitle as string}
          </p>
        </div>
        <div className="mt-12 space-y-4">
          {products.map((product, i) => (
            <div key={i} className={`${c.bgAlt} rounded-xl p-4 flex gap-5 items-center`}>
              {/* Image placeholder */}
              <div className={`${c.bgPlaceholder} w-24 h-24 @md:w-32 @md:h-32 rounded-lg flex-shrink-0`} />
              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-semibold ${c.text}`}>{product.title}</h3>
                <p className={`mt-1 text-sm ${c.textSecondary} line-clamp-2`}>{product.description}</p>
                <div className="mt-3 flex items-center gap-4">
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
