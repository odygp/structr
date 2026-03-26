'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import EditableText from '@/components/builder/EditableText';

export default function BannerMinimal({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';

  return (
    <div className={`${c.bgAlt} border-t border-b ${c.border} px-4 py-3`}>
      <p className={`text-sm ${c.textSecondary} text-center`}>
        {(content.text as string) || 'Minimal banner text'}
      </p>
    </div>
  );
}
