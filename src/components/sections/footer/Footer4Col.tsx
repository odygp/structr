'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function Footer4Col({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'footer');
  const columns = content.columns || [];

  return (
    <footer className={`${c.bg} ${spacing}`}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 @md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 @md:col-span-1">
            <div className="text-white font-bold text-xl mb-4">
              {content.logo || 'Logo'}
            </div>
            {content.description && (
              <p className="text-gray-400 text-sm">{content.description}</p>
            )}
          </div>
          {(columns as Array<{ title: string; links: string }>).map((col, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {(col.links || '').split(',').map((link: string, i: number) => (
                  <li key={i}>
                    <span className="text-gray-400 text-sm hover:text-gray-300 cursor-pointer">
                      {link.trim()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 pt-8">
          <p className="text-gray-400 text-sm text-center">
            {content.copyright || '\u00A9 2026 Company. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
