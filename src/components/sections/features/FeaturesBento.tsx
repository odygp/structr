'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function FeaturesBento({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const features = (content.features as Array<{ title: string; description: string }>) || [];

  return (
    <section className={`${c.bg} px-8 py-24`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            {content.title as string}
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            {content.subtitle as string}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`${c.bgAlt} rounded-xl p-8 ${i === 0 ? 'md:col-span-2' : ''}`}
            >
              <div className={`w-full h-32 ${c.bgPlaceholder} rounded-lg mb-6`} />
              <h3 className={`text-lg font-semibold ${c.text}`}>{feature.title}</h3>
              <p className={`mt-2 text-sm ${c.textSecondary} leading-relaxed`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
