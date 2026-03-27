'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function AboutSplit({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'about');
  const id = sectionId || '';

  return (
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          {content.description && (
            <p className={`${c.textSecondary} mb-6`}><EditableText sectionId={id} fieldKey="description" value={content.description as string} placeholder="Add description..." /></p>
          )}
          {content.mission && (
            <div className={`border-l-4 ${c.border} pl-4`}>
              <p className={`${c.textSecondary} italic`}><EditableText sectionId={id} fieldKey="mission" value={content.mission as string} placeholder="Add mission..." /></p>
            </div>
          )}
        </div>
        <div className={`${c.bgPlaceholder} rounded-lg w-full h-72`} />
      </div>
    </section>
  );
}
