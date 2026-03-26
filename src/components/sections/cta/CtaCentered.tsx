'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function CtaCentered({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'cta');

  return (
    <section className={`${spacing} ${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-900'}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl @md:text-3xl font-bold text-white mb-4">
          {content.title || 'Ready to get started?'}
        </h2>
        {content.subtitle && (
          <p className="text-lg text-gray-300 mb-8">{content.subtitle}</p>
        )}
        {(content.showPrimaryButton || content.showSecondaryButton) && (
          <div className="flex flex-col @sm:flex-row items-center justify-center gap-4">
            {content.showPrimaryButton !== false && content.ctaText && (
              <button className="bg-white text-gray-900 font-semibold rounded-lg px-6 py-3">
                {content.ctaText}
              </button>
            )}
            {content.showSecondaryButton && content.ctaSecondaryText && (
              <button className="border border-white text-white font-semibold rounded-lg px-6 py-3">
                {content.ctaSecondaryText}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
