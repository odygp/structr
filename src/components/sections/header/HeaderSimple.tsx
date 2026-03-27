'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function HeaderSimple({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'header');
  const links = (content.links as Array<{label: string}>) || [];
  return (
    <header className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className={`text-xl font-bold ${c.text}`}><EditableText sectionId={id} fieldKey="logo" value={content.logo as string} placeholder="Logo" /></div>
        <nav className="hidden @md:flex items-center gap-8">
          {links.map((link, i) => (
            <span key={i} className={`text-sm ${c.textSecondary} cursor-default`}>{link.label}</span>
          ))}
        </nav>
        <button className={`${c.btnPrimary} text-sm px-4 py-2 rounded-lg`}><EditableText sectionId={id} fieldKey="ctaText" value={content.ctaText as string} placeholder="CTA" /></button>
      </div>
    </header>
  );
}
