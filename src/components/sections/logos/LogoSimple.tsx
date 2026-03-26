'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function LogoSimple({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const logos = (content.logos as Array<{ name: string }>) || [];

  return (
    <section className={`py-10 @md:py-16 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className={`text-center text-lg font-medium ${c.textSecondary} mb-10`}>
          {(content.title as string) || 'Trusted by leading companies'}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {logos.map((logo, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className={`w-24 h-12 ${c.bgPlaceholder} rounded-lg`} />
              <span className={`text-xs ${c.textMuted}`}>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
