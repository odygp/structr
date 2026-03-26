'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function HeaderSimple({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'header');
  const links = (content.links as Array<{label: string}>) || [];
  return (
    <header className={`${c.bg} border-b ${c.border} ${spacing}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className={`text-xl font-bold ${c.text}`}>{content.logo as string}</div>
        <nav className="hidden @md:flex items-center gap-8">
          {links.map((link, i) => (
            <span key={i} className={`text-sm ${c.textSecondary} cursor-default`}>{link.label}</span>
          ))}
        </nav>
        <button className={`${c.btnPrimary} text-sm px-4 py-2 rounded-lg`}>{content.ctaText as string}</button>
      </div>
    </header>
  );
}
