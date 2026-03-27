'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function CtaBanner({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'cta');
  const id = sectionId || '';

  return (
    <section className={`${spacing} ${c.bgAlt}`}>
      <div className="max-w-5xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {content.title || 'Ready to get started?'}
          </h2>
          {content.subtitle && (
            <p className="text-gray-300">
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>
        {content.showPrimaryButton !== false && content.ctaText && (
          <button className="bg-white text-gray-900 font-semibold rounded-lg px-6 py-3 whitespace-nowrap">
            {content.ctaText}
          </button>
        )}
      </div>
    </section>
  );
}
