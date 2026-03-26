'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function ErrorSimple({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'error');

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[300px]">
        <h1 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
          {content.title as string}
        </h1>
        <p className={`mt-3 text-base ${c.textSecondary} max-w-md`}>
          {content.subtitle as string}
        </p>
        <button className={`mt-6 ${c.btnPrimary} px-6 py-3 rounded-lg text-sm font-medium`}>
          {content.ctaText as string || 'Go Back'}
        </button>
      </div>
    </section>
  );
}
