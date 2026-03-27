'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function FeaturesGrid({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'features');
  const gridCols = getGridColsClass(content._columns);
  const features = (content.features as Array<{title: string; description: string}>) || [];
  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        </div>
        <div className={`mt-16 grid ${gridCols} gap-8`}>
          {features.map((feature, i) => (
            <div key={i} className={`${c.bgAlt} rounded-xl p-8`}>
              <div className={`w-10 h-10 ${c.bgPlaceholder} rounded-lg`} />
              <h3 className={`mt-5 text-lg font-semibold ${c.text}`}>{feature.title}</h3>
              <p className={`mt-2 text-sm ${c.textSecondary} leading-relaxed`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
