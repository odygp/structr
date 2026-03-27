'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function CtaWithImage({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'cta');
  const id = sectionId || '';

  return (
    <section className={`${spacing} ${c.bgAlt}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Ready to get started?" />
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary} mb-8`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
          {(content.showPrimaryButton || content.showSecondaryButton) && (
            <div className="flex flex-col @sm:flex-row items-center gap-3 @sm:gap-4">
              {content.showPrimaryButton !== false && content.ctaText && (
                <button className={`${c.btnPrimary} font-medium rounded-lg px-6 py-3`}>
                  <EditableText sectionId={id} fieldKey="ctaText" value={content.ctaText as string} placeholder="CTA" />
                </button>
              )}
              {content.showSecondaryButton && content.ctaSecondaryText && (
                <button className={`border ${c.border} ${c.textSecondary} font-medium rounded-lg px-6 py-3`}>
                  <EditableText sectionId={id} fieldKey="ctaSecondaryText" value={content.ctaSecondaryText as string} placeholder="Secondary" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className={`${c.bgPlaceholder} rounded-xl w-full h-48 @md:h-72`} />
      </div>
    </section>
  );
}
