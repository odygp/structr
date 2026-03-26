'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function CtaSimple({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');

  return (
    <section className={`py-10 @md:py-16 px-4 @md:px-6 ${c.bg} border-t border-b ${c.border}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-2xl font-bold ${c.text} mb-6`}>
          {(content.title as string) || 'Ready to get started?'}
        </h2>
        {content.showPrimaryButton !== false && content.ctaText && (
          <button className={`${c.btnPrimary} font-medium rounded-lg px-6 py-3`}>
            {content.ctaText as string}
          </button>
        )}
      </div>
    </section>
  );
}
