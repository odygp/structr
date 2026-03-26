'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function HeroMinimal({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  return (
    <section className={`${c.bgAlt} px-8 py-32`}>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className={`text-6xl font-bold ${c.text} leading-tight`}>
          {content.title as string}
        </h1>
        {content.showPrimaryButton !== false && content.ctaText && (
          <div className="mt-12">
            <button className={`${c.btnPrimary} rounded-lg px-8 py-4 text-base font-medium`}>
              {content.ctaText as string}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
