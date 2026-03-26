'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function HeaderWithCTA({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const links = (content.links as Array<{ label: string }>) || [];
  return (
    <header className={`${c.bg} border-b ${c.border} px-8 py-4`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className={`text-xl font-bold ${c.text}`}>{content.logo as string}</div>
        <nav className="hidden @md:flex items-center gap-8">
          {links.map((link, i) => (
            <span key={i} className={`text-sm ${c.textSecondary} cursor-default`}>{link.label}</span>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button className={`${c.btnSecondary} text-sm px-4 py-2 rounded-lg`}>
            Log in
          </button>
          <button className={`${c.btnPrimary} text-sm px-4 py-2 rounded-lg`}>
            {content.ctaText as string}
          </button>
        </div>
      </div>
    </header>
  );
}
