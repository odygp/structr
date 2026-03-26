'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function FeaturesAccordion({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'features');
  const features = (content.features as Array<{ title: string; description: string }>) || [];

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        {/* Centered title */}
        <div className="text-center max-w-2xl mx-auto mb-12 @md:mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          {content.subtitle && (
            <p className={`mt-4 text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>

        {/* Split layout: image + accordion */}
        <div className="grid grid-cols-1 @lg:grid-cols-2 gap-8 @md:gap-12 items-start">
          {/* Image placeholder (left) */}
          <div className={`${c.bgPlaceholder} rounded-xl w-full h-64 @md:h-80 @lg:h-96`} />

          {/* Accordion (right) */}
          <div className={`${c.divider} divide-y`}>
            {features.map((feature, i) => (
              <div key={i} className="py-5">
                <div className="flex items-center justify-between">
                  <h3 className={`text-base font-semibold ${c.text} ${i === 0 ? '' : ''}`}>
                    {feature.title}
                  </h3>
                  <span className={`text-lg ${c.textMuted} flex-shrink-0 ml-4`}>
                    {i === 0 ? '\u2303' : '\u2304'}
                  </span>
                </div>
                {i === 0 && (
                  <p className={`mt-3 text-sm ${c.textSecondary} leading-relaxed`}>
                    {feature.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
