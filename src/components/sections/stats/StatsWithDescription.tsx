'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function StatsWithDescription({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const stats = (content.stats as Array<{ value: string; label: string }>) || [];

  return (
    <section className={`py-12 md:py-20 px-4 md:px-6 ${c.bgAlt}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl md:text-3xl font-bold ${c.text}`}>
            {(content.title as string) || 'By the Numbers'}
          </h2>
        </div>

        <div className={`${c.bgMuted} rounded-2xl p-12`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className={`text-4xl font-bold ${c.text} mb-3`}>
                  {stat.value}
                </p>
                <p className={`text-sm ${c.textSecondary} leading-relaxed`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
