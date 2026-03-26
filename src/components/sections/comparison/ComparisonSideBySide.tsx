'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function ComparisonSideBySide({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'comparison');
  const items = (content.items as Array<{ title: string; description: string; features: string; ctaText: string }>) || [];

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
        <div className="mt-12 grid grid-cols-1 @md:grid-cols-2 gap-8">
          {items.slice(0, 2).map((item, i) => (
            <div key={i} className={`${c.bgAlt} rounded-xl p-8`}>
              <h3 className={`text-xl font-bold ${c.text}`}>{item.title}</h3>
              <p className={`mt-2 text-sm ${c.textSecondary}`}>{item.description}</p>
              <ul className="mt-6 space-y-3">
                {(item.features || '').split(',').map((feat, j) => (
                  <li key={j} className={`flex items-center gap-2 text-sm ${c.text}`}>
                    <span className={c.textMuted}>{'\u2713'}</span>
                    {feat.trim()}
                  </li>
                ))}
              </ul>
              <button className={`mt-8 w-full ${c.btnPrimary} px-5 py-3 rounded-lg text-sm font-medium`}>
                {item.ctaText || 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
