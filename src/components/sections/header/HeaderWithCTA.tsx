'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function HeaderWithCTA({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'header');
  const id = sectionId || '';
  const links = (content.links as Array<{ label: string }>) || [];
  return (
    <header className={`${c.bg} border-b ${c.border} ${spacing}`}>
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
            <EditableText sectionId={id} fieldKey="ctaText" value={content.ctaText as string} placeholder="Add ctatext..." />
          </button>
        </div>
      </div>
    </header>
  );
}
