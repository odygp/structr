'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function CtaWithImage({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bgAlt}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'Ready to get started?'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary} mb-8`}>{content.subtitle as string}</p>
          )}
          {(content.showPrimaryButton || content.showSecondaryButton) && (
            <div className="flex flex-col @sm:flex-row items-center gap-3 @sm:gap-4">
              {content.showPrimaryButton !== false && content.ctaText && (
                <button className={`${c.btnPrimary} font-medium rounded-lg px-6 py-3`}>
                  {content.ctaText as string}
                </button>
              )}
              {content.showSecondaryButton && content.ctaSecondaryText && (
                <button className={`border ${c.border} ${c.textSecondary} font-medium rounded-lg px-6 py-3`}>
                  {content.ctaSecondaryText as string}
                </button>
              )}
            </div>
          )}
        </div>
        <div className={`${c.bgPlaceholder} rounded-xl w-full h-72`} />
      </div>
    </section>
  );
}
