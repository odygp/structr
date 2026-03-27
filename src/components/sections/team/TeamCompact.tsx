'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function TeamCompact({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'team');
  const gridCols = getGridColsClass(content._columns);
  const id = sectionId || '';
  const members = (content.members as Array<{ name: string; role: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'Our Team'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>
        <div className="grid grid-cols-2 @sm:grid-cols-3 @md:grid-cols-6 gap-6">
          {members.map((member, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 rounded-full ${c.bgAvatar} mx-auto mb-2`} />
              <h3 className={`text-sm font-semibold ${c.text}`}>{member.name}</h3>
              <p className={`text-xs ${c.textSecondary}`}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
