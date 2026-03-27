'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function BannerFloating({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'banner');
  const id = sectionId || '';

  return (
    <div className="py-4 px-6">
      <div className={`max-w-2xl mx-auto ${c.bgCard} border ${c.border} rounded-xl shadow-md px-6 py-4 flex items-center gap-4`}>
        <p className={`text-sm ${c.textSecondary} flex-1`}>
            <EditableText sectionId={id} fieldKey="text" value={content.text as string} placeholder="Add text..." />
        </p>

        {content.ctaText && (
          <button className={`${c.btnPrimary} text-sm font-medium px-4 py-1.5 rounded-lg whitespace-nowrap`}>
            <EditableText sectionId={id} fieldKey="ctaText" value={content.ctaText as string} placeholder="Add ctatext..." />
          </button>
        )}

        {content.dismissible && (
          <button className={`${c.textMuted} hover:opacity-80 text-lg leading-none`}>
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
