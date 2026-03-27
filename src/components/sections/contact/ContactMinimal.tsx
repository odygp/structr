'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function ContactMinimal({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'contact');
  const id = sectionId || '';

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
          <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Contact Us" />
        </h2>
        {content.subtitle && (
          <p className={`${c.textSecondary} mb-12`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        )}
        <div className="flex flex-col @md:flex-row items-center justify-center gap-12">
          {content.email && (
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
              <span className={c.textSecondary}>{content.email as string}</span>
            </div>
          )}
          {content.phone && (
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
              <span className={c.textSecondary}>{content.phone as string}</span>
            </div>
          )}
          {content.address && (
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
              <span className={c.textSecondary}>{content.address as string}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
