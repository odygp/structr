'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function AboutCentered({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-6`}>
          {content.title || 'About Us'}
        </h2>
        {content.description && (
          <p className={`text-lg ${c.textSecondary} mb-8`}>{content.description}</p>
        )}
        {content.mission && (
          <blockquote className={`border-t border-b ${c.border} py-6 mt-8`}>
            <p className={`${c.textSecondary} italic text-lg`}>{content.mission}</p>
          </blockquote>
        )}
      </div>
    </section>
  );
}
