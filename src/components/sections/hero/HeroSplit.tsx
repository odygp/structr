'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import EditableText from '@/components/builder/EditableText';

export default function HeroSplit({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  return (
    <section className={`${c.bg} px-8 py-24`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 @lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className={`text-3xl @md:text-5xl font-bold ${c.text} leading-tight`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h1>
          <p className={`mt-4 @md:mt-6 text-lg @md:text-xl ${c.textSecondary} leading-relaxed`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          {(content.showPrimaryButton || content.showSecondaryButton) && (
            <div className="mt-10 flex flex-col @sm:flex-row items-center gap-3 @sm:gap-4">
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
        <div className={`${c.bgPlaceholder} rounded-2xl aspect-[4/3] w-full`} />
      </div>
    </section>
  );
}
