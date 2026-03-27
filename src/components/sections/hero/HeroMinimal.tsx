'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function HeroMinimal({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'hero');
  const id = sectionId || '';
  return (
    <section className={`${c.bgAlt} ${spacing}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className={`text-6xl font-bold ${c.text} leading-tight`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h1>
        {content.showPrimaryButton !== false && content.ctaText && (
          <div className="mt-12">
            <button className={`${c.btnPrimary} rounded-lg px-8 py-4 text-base font-medium`}>
              <EditableText sectionId={id} fieldKey="ctaText" value={content.ctaText as string} placeholder="CTA" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
