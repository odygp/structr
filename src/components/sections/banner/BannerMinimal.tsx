'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function BannerMinimal({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'banner');
  const id = sectionId || '';

  return (
    <div className={`${c.bgAlt} border-t border-b ${c.border} px-3 @md:px-4 py-2 @md:py-3`}>
      <p className={`text-sm ${c.textSecondary} text-center`}>
            <EditableText sectionId={id} fieldKey="text" value={content.text as string} placeholder="Add text..." />
      </p>
    </div>
  );
}
