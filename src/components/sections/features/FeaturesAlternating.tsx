'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function FeaturesAlternating({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const features = (content.features as Array<{title: string; description: string}>) || [];
  return (
    <section className={`${c.bgAlt} px-8 py-24`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            {content.title as string}
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            {content.subtitle as string}
          </p>
        </div>
        <div className="mt-20 flex flex-col gap-24">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 @lg:grid-cols-2 gap-16 items-center ${
                i % 2 === 1 ? 'lg:direction-rtl' : ''
              }`}
            >
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <h3 className={`text-2xl font-semibold ${c.text}`}>{feature.title}</h3>
                <p className={`mt-4 ${c.textSecondary} leading-relaxed`}>{feature.description}</p>
              </div>
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <div className={`${c.bgPlaceholder} rounded-2xl aspect-[4/3] w-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
