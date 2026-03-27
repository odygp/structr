'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function LogoGrid({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'logos');
  const id = sectionId || '';
  const logos = (content.logos as Array<{ name: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className={`text-center text-2xl font-bold ${c.text} mb-12`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
        </h2>
        <div className="grid grid-cols-2 @sm:grid-cols-3 gap-6">
          {logos.map((logo, index) => (
            <div
              key={index}
              className={`${c.bgCard} border ${c.border} rounded-xl p-6 flex flex-col items-center justify-center gap-3`}
            >
              <div className={`w-24 h-12 ${c.bgPlaceholder} rounded-lg`} />
              <span className={`text-sm ${c.textSecondary} font-medium`}>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
