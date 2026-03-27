'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function BannerTop({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'banner');
  const id = sectionId || '';

  return (
    <div className={`${c.bgAlt} ${c.text} px-4 py-2`}>
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
        <p className="text-sm flex-1 text-center">
            <EditableText sectionId={id} fieldKey="text" value={content.text as string} placeholder="Add text..." />
        </p>

        {content.ctaText && (
          <button className="text-sm font-medium underline underline-offset-2 whitespace-nowrap hover:opacity-80">
            <EditableText sectionId={id} fieldKey="ctaText" value={content.ctaText as string} placeholder="Add ctatext..." />
          </button>
        )}

        {content.dismissible && (
          <button className="ml-2 text-white/70 hover:text-white text-lg leading-none">
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
