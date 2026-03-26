'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import EditableText from '@/components/builder/EditableText';

export default function AboutSplit({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {content.title || 'About Us'}
          </h2>
          {content.description && (
            <p className={`${c.textSecondary} mb-6`}>{content.description}</p>
          )}
          {content.mission && (
            <div className={`border-l-4 ${c.border} pl-4`}>
              <p className={`${c.textSecondary} italic`}>{content.mission}</p>
            </div>
          )}
        </div>
        <div className={`${c.bgPlaceholder} rounded-lg w-full h-72`} />
      </div>
    </section>
  );
}
