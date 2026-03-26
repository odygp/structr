'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function HeroCentered({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'hero');
  return (
    <section className={`${c.bgAlt} ${spacing}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className={`text-5xl font-bold ${c.text} leading-tight`}>
          {content.title as string}
        </h1>
        <p className={`mt-6 text-xl ${c.textSecondary} leading-relaxed`}>
          {content.subtitle as string}
        </p>
        {(content.showPrimaryButton || content.showSecondaryButton) && (
          <div className="mt-10 flex items-center justify-center gap-4">
            {content.showPrimaryButton !== false && content.ctaText && (
              <button className={`${c.btnPrimary} rounded-lg px-6 py-3 text-sm font-medium`}>
                {content.ctaText as string}
              </button>
            )}
            {content.showSecondaryButton && content.ctaSecondaryText && (
              <button className={`${c.btnSecondary} rounded-lg px-6 py-3 text-sm font-medium`}>
                {content.ctaSecondaryText as string}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
