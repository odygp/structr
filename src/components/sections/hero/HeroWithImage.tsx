'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function HeroWithImage({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  return (
    <section className={`${c.bgAlt} px-8 py-24`}>
      <div className="max-w-5xl mx-auto text-center">
        <h1 className={`text-3xl md:text-5xl font-bold ${c.text} leading-tight`}>
          {content.title as string}
        </h1>
        <p className={`mt-4 md:mt-6 text-lg md:text-xl ${c.textSecondary} leading-relaxed max-w-2xl mx-auto`}>
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
        <div className={`mt-16 ${c.bgPlaceholder} rounded-xl w-full h-80`} />
      </div>
    </section>
  );
}
