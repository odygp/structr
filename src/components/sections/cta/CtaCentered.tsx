'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function CtaCentered({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'cta');

  return (
    <section className={`${spacing} ${c.bgAlt}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl @md:text-3xl font-bold ${c.text} mb-4">
          <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Ready to get started?" />
        </h2>
        {content.subtitle && (
          <p className="text-lg ${c.textSecondary} mb-8">
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        )}
        {(content.showPrimaryButton || content.showSecondaryButton) && (
          <div className="flex flex-col @sm:flex-row items-center justify-center gap-4">
            {content.showPrimaryButton !== false && content.ctaText && (
              <button className="${c.btnPrimary} font-semibold rounded-lg px-6 py-3">
                <EditableText sectionId={id} fieldKey="ctaText" value={content.ctaText as string} placeholder="CTA" />
              </button>
            )}
            {content.showSecondaryButton && content.ctaSecondaryText && (
              <button className="${c.btnSecondary} font-semibold rounded-lg px-6 py-3">
                <EditableText sectionId={id} fieldKey="ctaSecondaryText" value={content.ctaSecondaryText as string} placeholder="Secondary" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
