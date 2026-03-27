'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function HeaderMega({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'header');
  const id = sectionId || '';
  const links = (content.links as Array<{ label: string }>) || [];

  return (
    <header className={`${c.bg} border-b ${c.border}`}>
      <div className="max-w-7xl mx-auto ${spacing} flex items-center justify-between">
        <div className={`text-xl font-bold ${c.text}`}>
          {content.logo as string || 'Logo'}
        </div>

        <nav className="hidden @md:flex items-center gap-8">
          {links.map((link, i) => (
            <span key={i} className={`text-sm ${c.textSecondary} cursor-default inline-flex items-center gap-1`}>
              {link.label}
              <span className="text-[10px] opacity-60">&#9662;</span>
            </span>
          ))}
        </nav>

        <button className={`${c.btnPrimary} text-sm font-medium px-5 py-2 rounded-lg`}>
          {(content.ctaText as string) || 'Get Started'}
        </button>
      </div>

      {/* Mega menu placeholder */}
      <div className="max-w-7xl mx-auto px-8 pb-4">
        <div className={`border-2 border-dashed ${c.border} rounded-lg h-32 flex items-center justify-center`}>
          <span className={`text-sm ${c.textMuted}`}>Mega menu dropdown content</span>
        </div>
      </div>
    </header>
  );
}
