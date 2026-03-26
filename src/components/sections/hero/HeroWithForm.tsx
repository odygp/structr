'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function HeroWithForm({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  return (
    <section className={`${c.bgAlt} px-8 py-24`}>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className={`text-5xl font-bold ${c.text} leading-tight`}>
          {content.title as string}
        </h1>
        <p className={`mt-6 text-xl ${c.textSecondary} leading-relaxed`}>
          {content.subtitle as string}
        </p>
        <div className="mt-10 flex items-center justify-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className={`flex-1 rounded-lg border px-4 py-3 text-sm ${c.input}`}
          />
          <button className={`${c.btnPrimary} rounded-lg px-6 py-3 text-sm font-medium whitespace-nowrap`}>
            {content.ctaText as string}
          </button>
        </div>
      </div>
    </section>
  );
}
