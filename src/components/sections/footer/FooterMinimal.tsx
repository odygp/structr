'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function FooterMinimal({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');

  return (
    <footer className={`${c.bgAlt} py-6 @md:py-8 px-4 @md:px-6`}>
      <div className="max-w-5xl mx-auto text-center">
        <p className={`text-sm ${c.textMuted}`}>
          {(content.copyright as string) || '\u00A9 2026 Company. All rights reserved.'}
        </p>
      </div>
    </footer>
  );
}
