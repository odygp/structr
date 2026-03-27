'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function CtaSimple({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'cta');
  const id = sectionId || '';

  return (
    <section className={`py-10 @md:py-16 px-4 @md:px-6 ${c.bg} border-t border-b ${c.border}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-2xl font-bold ${c.text} mb-6`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
        </h2>
        {content.showPrimaryButton !== false && content.ctaText && (
          <button className={`${c.btnPrimary} font-medium rounded-lg px-6 py-3`}>
            <EditableText sectionId={id} fieldKey="ctaText" value={content.ctaText as string} placeholder="Add ctatext..." />
          </button>
        )}
      </div>
    </section>
  );
}
