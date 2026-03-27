'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function FooterSimple({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'footer');
  const id = sectionId || '';
  const columns = content.columns || [];
  const allLinks = (columns as Array<{ links: string }>).flatMap((col) =>
    (col.links || '').split(',').map((link: string) => link.trim()).filter(Boolean)
  );

  return (
    <footer className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-900'} py-8 @md:py-12 px-4 @md:px-6`}>
      <div className="max-w-5xl mx-auto text-center">
        <div className="text-white font-bold text-xl mb-6">
            <EditableText sectionId={id} fieldKey="logo" value={content.logo as string} placeholder="Add logo..." />
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
            <EditableText sectionId={id} fieldKey="copyright" value={content.copyright as string} placeholder="Add copyright..." />
        </p>
      </div>
    </footer>
  );
}
