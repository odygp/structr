'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function Features2Column({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const features = (content.features as Array<{ title: string; description: string }>) || [];
  return (
    <section className={`${c.bg} px-8 py-24`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            {content.title as string}
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            {content.subtitle as string}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 @md:grid-cols-2 gap-10">
          {features.map((feature, i) => (
            <div key={i} className="flex gap-5">
              <div className={`w-12 h-12 ${c.bgPlaceholder} rounded-lg flex-shrink-0`} />
              <div>
                <h3 className={`text-lg font-semibold ${c.text}`}>{feature.title}</h3>
                <p className={`mt-2 text-sm ${c.textSecondary} leading-relaxed`}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
