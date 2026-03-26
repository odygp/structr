'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function CtaNewsletter({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bgAlt}`}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
          {content.title || 'Subscribe to our newsletter'}
        </h2>
        {content.subtitle && (
          <p className={`text-lg ${c.textSecondary} mb-8`}>
            {content.subtitle}
          </p>
        )}
        <div className="flex flex-col @sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className={`flex-1 rounded-lg border px-4 py-3 text-sm ${c.input}`}
          />
          <button className={`${c.btnPrimary} rounded-lg px-6 py-3 text-sm font-medium whitespace-nowrap`}>
            {content.ctaText || 'Subscribe'}
          </button>
        </div>
      </div>
    </section>
  );
}
