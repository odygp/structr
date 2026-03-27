'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function FooterCentered({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'footer');
  const id = sectionId || '';
  const columns = (content.columns as Array<{ title: string; links: string }>) || [];
  const allLinks = columns.flatMap((col) =>
    (col.links || '').split(',').map((l: string) => l.trim()).filter(Boolean)
  );

  return (
    <footer className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-900'} pt-10 @md:pt-16 pb-6 @md:pb-8 px-4 @md:px-6`}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-white font-bold text-xl mb-4">
            <EditableText sectionId={id} fieldKey="logo" value={content.logo as string} placeholder="Add logo..." />
        </div>
        {content.description && (
          <p className="text-gray-400 text-sm mb-8 max-w-lg mx-auto">
            <EditableText sectionId={id} fieldKey="description" value={content.description as string} placeholder="Add description..." />
          </p>
        )}
        {allLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            {allLinks.map((link, i) => (
              <span key={i} className="text-gray-400 text-sm hover:text-gray-300 cursor-pointer">
                {link}
              </span>
            ))}
          </div>
        )}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-gray-400 text-sm">
            <EditableText sectionId={id} fieldKey="copyright" value={content.copyright as string} placeholder="Add copyright..." />
          </p>
        </div>
      </div>
    </footer>
  );
}
