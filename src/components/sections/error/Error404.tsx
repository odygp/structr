'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function Error404({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'error');

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[400px]">
        <span className={`text-8xl @md:text-9xl font-extrabold ${c.textMuted}`}>404</span>
        <h1 className={`mt-4 text-2xl @md:text-4xl font-bold ${c.text}`}>
          {content.title as string || 'Page not found'}
        </h1>
        <p className={`mt-4 text-base @md:text-lg ${c.textSecondary} max-w-md`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        <button className={`mt-8 ${c.btnPrimary} px-6 py-3 rounded-lg text-sm font-medium`}>
          {content.ctaText as string || 'Go Home'}
        </button>
      </div>
    </section>
  );
}
