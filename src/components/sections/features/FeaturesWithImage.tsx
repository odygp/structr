'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function FeaturesWithImage({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const features = (content.features as Array<{ title: string; description: string }>) || [];
  return (
    <section className={`${c.bg} px-8 py-24`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            {content.title as string}
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            {content.subtitle as string}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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
