'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function TeamWithBio({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
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
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Meet the Team" />
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-8">
          {members.map((member, index) => (
            <div key={index} className={`${c.bgCard} border ${c.border} rounded-xl p-8 flex gap-6`}>
              <div className={`w-20 h-20 rounded-full ${c.bgAvatar} flex-shrink-0`} />
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${c.text}`}>{member.name}</h3>
                <p className={`text-sm ${c.textMuted} mb-3`}>{member.role}</p>
                <p className={`text-sm ${c.textSecondary} leading-relaxed`}>
                  A dedicated professional bringing expertise and passion to the team every day.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
