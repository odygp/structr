'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function HeaderCentered({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const links = (content.links as Array<{label: string}>) || [];
  return (
    <header className={`${c.bg} border-b ${c.border} px-8 py-5`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        <div className={`text-xl font-bold ${c.text}`}>{content.logo as string}</div>
        <nav className="flex items-center gap-8">
          {links.map((link, i) => (
            <span key={i} className={`text-sm ${c.textSecondary} cursor-default`}>{link.label}</span>
          ))}
          <button className={`${c.btnPrimary} text-sm px-4 py-2 rounded-lg ml-2`}>
            {content.ctaText as string}
          </button>
        </nav>
      </div>
    </header>
  );
}
