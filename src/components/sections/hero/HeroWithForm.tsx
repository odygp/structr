'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import EditableText from '@/components/builder/EditableText';

export default function HeroWithForm({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  return (
    <section className={`${c.bgAlt} px-8 py-24`}>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className={`text-3xl @md:text-5xl font-bold ${c.text} leading-tight`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h1>
        <p className={`mt-4 @md:mt-6 text-lg @md:text-xl ${c.textSecondary} leading-relaxed`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
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
