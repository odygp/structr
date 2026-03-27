'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function BannerCookie({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'banner');
  const id = sectionId || '';

  return (
    <div className="fixed bottom-0 left-0 right-0 py-4 px-6 z-50">
      <div className={`max-w-3xl mx-auto ${c.bgCard} border ${c.border} rounded-2xl shadow-lg px-6 py-5 flex flex-col @sm:flex-row items-start sm:items-center gap-4`}>
        <div className="flex-1">
          <p className={`text-sm ${c.textSecondary} leading-relaxed`}>
            {(content.text as string) || 'We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className={`${c.btnSecondary} text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap`}>
            Decline
          </button>
          <button className={`${c.btnPrimary} text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap`}>
            {(content.ctaText as string) || 'Accept'}
          </button>
        </div>

        {content.dismissible && (
          <button className={`${c.textMuted} hover:opacity-80 text-lg leading-none absolute top-3 right-4`}>
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
