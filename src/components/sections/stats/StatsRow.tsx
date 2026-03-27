'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function StatsRow({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'stats');
  const gridCols = getGridColsClass(content._columns);
  const stats = (content.stats as Array<{ value: string; label: string }>) || [];

  return (
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
        </div>

        <div className={`grid ${gridCols} gap-8`}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className={`text-4xl font-bold ${c.text} mb-2`}>
                {stat.value}
              </p>
              <p className={`text-sm ${c.textSecondary}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
