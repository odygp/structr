'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function ProcessTimeline({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'process');
  const steps = (content.steps as Array<{ title: string; description: string }>) || [];

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        </div>
        <div className="mt-16 relative">
          {/* Vertical line */}
          <div className={`absolute left-4 @md:left-1/2 top-0 bottom-0 w-0.5 ${c.bgPlaceholder} -translate-x-1/2`} />
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="relative flex items-start gap-6 @md:gap-8">
                {/* Dot */}
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${c.btnPrimary} flex items-center justify-center text-xs font-bold`}>
                  {i + 1}
                </div>
                {/* Content */}
                <div className="pb-2">
                  <h3 className={`text-lg font-semibold ${c.text}`}>{step.title}</h3>
                  <p className={`mt-1 text-sm ${c.textSecondary} leading-relaxed`}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
