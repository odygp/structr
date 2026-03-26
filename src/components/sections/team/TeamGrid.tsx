'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';

export default function TeamGrid({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'team');
  const gridCols = getGridColsClass(content._columns);
  const members = content.members || [];

  return (
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${c.text} mb-4`}>
            {content.title || 'Our Team'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>{content.subtitle}</p>
          )}
        </div>
        <div className={`grid grid-cols-2 ${gridCols} gap-8`}>
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
