'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function AboutCentered({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'about');
  const id = sectionId || '';

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-6`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
        </h2>
        {content.description && (
          <p className={`text-lg ${c.textSecondary} mb-8`}><EditableText sectionId={id} fieldKey="description" value={content.description as string} placeholder="Add description..." /></p>
        )}
        {content.mission && (
          <blockquote className={`border-t border-b ${c.border} py-6 mt-8`}>
            <p className={`${c.textSecondary} italic text-lg`}><EditableText sectionId={id} fieldKey="mission" value={content.mission as string} placeholder="Add mission..." /></p>
          </blockquote>
        )}
      </div>
    </section>
  );
}
