'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function BannerTop({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');

  return (
    <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-900'} text-white px-4 py-2`}>
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
        <p className="text-sm flex-1 text-center">
          {(content.text as string) || 'Announcement text goes here'}
        </p>

        {content.ctaText && (
          <button className="text-sm font-medium underline underline-offset-2 whitespace-nowrap hover:opacity-80">
            {content.ctaText as string}
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
