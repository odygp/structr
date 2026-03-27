'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function AboutWithStats({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'about');
  const id = sectionId || '';

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          {content.description && (
            <p className={`${c.textSecondary} mb-6`}>{content.description as string}</p>
          )}
          {content.mission && (
            <p className={`${c.textSecondary} italic`}>{content.mission as string}</p>
          )}
        </div>
        <div className="grid grid-cols-2 @md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className={`text-4xl font-bold ${c.text} mb-1`}>10+</p>
            <p className={`text-sm ${c.textSecondary}`}>Years</p>
          </div>
          <div className="text-center">
            <p className={`text-4xl font-bold ${c.text} mb-1`}>500+</p>
            <p className={`text-sm ${c.textSecondary}`}>Clients</p>
          </div>
          <div className="text-center">
            <p className={`text-4xl font-bold ${c.text} mb-1`}>50+</p>
            <p className={`text-sm ${c.textSecondary}`}>Team Members</p>
          </div>
          <div className="text-center">
            <p className={`text-4xl font-bold ${c.text} mb-1`}>99%</p>
            <p className={`text-sm ${c.textSecondary}`}>Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
}
