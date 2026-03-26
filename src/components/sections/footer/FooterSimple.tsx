'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function FooterSimple({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const columns = content.columns || [];
  const allLinks = (columns as Array<{ links: string }>).flatMap((col) =>
    (col.links || '').split(',').map((link: string) => link.trim()).filter(Boolean)
  );

  return (
    <footer className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-900'} py-8 @md:py-12 px-4 @md:px-6`}>
      <div className="max-w-5xl mx-auto text-center">
        <div className="text-white font-bold text-xl mb-6">
          {content.logo || 'Logo'}
        </div>
        {allLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            {allLinks.map((link: string, index: number) => (
              <span key={index} className="text-gray-400 text-sm hover:text-gray-300 cursor-pointer">
                {link}
              </span>
            ))}
          </div>
        )}
        <p className="text-gray-400 text-sm">
          {content.copyright || '\u00A9 2026 Company. All rights reserved.'}
        </p>
      </div>
    </footer>
  );
}
