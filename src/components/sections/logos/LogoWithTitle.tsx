'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function LogoWithTitle({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const logos = (content.logos as Array<{ name: string }>) || [];

  return (
    <section className={`py-10 md:py-16 px-4 md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/3 shrink-0">
          <h2 className={`text-2xl font-bold ${c.text}`}>
            {(content.title as string) || 'Trusted by leading companies'}
          </h2>
        </div>
        <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-8">
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
