'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function FeaturesIconList({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const features = (content.features as Array<{ title: string; description: string }>) || [];

  return (
    <section className={`${c.bg} px-8 py-24`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl md:text-3xl font-bold ${c.text}`}>
            {content.title as string}
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            {content.subtitle as string}
          </p>
        </div>
        <div className={`divide-y ${c.divider}`}>
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-5 py-6">
              <div className={`w-10 h-10 ${c.bgPlaceholder} rounded-lg flex-shrink-0 mt-1`} />
              <div>
                <h3 className={`text-base font-semibold ${c.text}`}>{feature.title}</h3>
                <p className={`mt-1 text-sm ${c.textSecondary} leading-relaxed`}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
