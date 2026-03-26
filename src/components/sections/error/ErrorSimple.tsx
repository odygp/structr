'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function ErrorSimple({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'error');

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[300px]">
        <h1 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h1>
        <p className={`mt-3 text-base ${c.textSecondary} max-w-md`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        <button className={`mt-6 ${c.btnPrimary} px-6 py-3 rounded-lg text-sm font-medium`}>
          {content.ctaText as string || 'Go Back'}
        </button>
      </div>
    </section>
  );
}
