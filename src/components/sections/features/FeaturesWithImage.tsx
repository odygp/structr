'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import EditableText from '@/components/builder/EditableText';

export default function FeaturesWithImage({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const features = (content.features as Array<{ title: string; description: string }>) || [];
  return (
    <section className={`${c.bg} px-8 py-24`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        </div>
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-12 items-center">
          <div className={`${c.bgPlaceholder} rounded-xl w-full h-80`} />
          <div className="space-y-8">
            {features.map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-10 h-10 ${c.bgPlaceholder} rounded-lg flex-shrink-0`} />
                <div>
                  <h3 className={`text-lg font-semibold ${c.text}`}>{feature.title}</h3>
                  <p className={`mt-1 text-sm ${c.textSecondary} leading-relaxed`}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
