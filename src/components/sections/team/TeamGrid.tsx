'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function TeamGrid({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'team');
  const gridCols = getGridColsClass(content._columns);
  const members = content.members || [];

  return (
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Our Team" />
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>
        <div className={`grid ${gridCols} gap-8`}>
          {(members as Array<{ name: string; role: string }>).map((member, index) => (
            <div key={index} className="text-center">
              <div className={`w-24 h-24 rounded-full ${c.bgAvatar} mx-auto mb-4`} />
              <h3 className={`font-semibold ${c.text}`}>{member.name}</h3>
              <p className={`text-sm ${c.textSecondary}`}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
