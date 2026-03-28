'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { safeLinks } from '@/lib/safe-content';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function FooterWithNewsletter({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'footer');
  const id = sectionId || '';
  const columns = content.columns || [];

  return (
    <footer className={`${c.bg} ${spacing}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 @md:grid-cols-4 gap-8 mb-12">
          {/* Logo + description + newsletter */}
          <div className="col-span-2 @md:col-span-1">
            <div className="text-white font-bold text-xl mb-3">
            <EditableText sectionId={id} fieldKey="logo" value={content.logo as string} placeholder="Add logo..." />
            </div>
            {content.description && (
              <p className="text-gray-400 text-sm mb-5 leading-relaxed"><EditableText sectionId={id} fieldKey="description" value={content.description as string} placeholder="Add description..." /></p>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 bg-gray-800 border border-gray-600 text-white placeholder-gray-500 text-sm rounded-lg px-3 py-2"
                readOnly
              />
              <button className="bg-white text-gray-900 text-sm font-medium px-3 py-2 rounded-lg whitespace-nowrap shrink-0">
                Subscribe
              </button>
            </div>
          </div>

          {/* Link columns */}
          {(columns as Array<{ title: string; links: string }>).map((col, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {safeLinks(col.links).map((link: string, i: number) => (
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
            <EditableText sectionId={id} fieldKey="copyright" value={content.copyright as string} placeholder="Add copyright..." />
          </p>
        </div>
      </div>
    </footer>
  );
}
