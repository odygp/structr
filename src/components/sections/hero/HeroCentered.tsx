'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function HeroCentered({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'hero');
  const id = sectionId || '';

  return (
    <section className={`${c.bgAlt} ${spacing}`}>
      <div className="max-w-3xl mx-auto text-center">
        <EditableText
          sectionId={id}
          fieldKey="title"
          value={content.title as string}
          placeholder="Add headline..."
          tag="h1"
          className={`text-3xl @md:text-5xl font-bold ${c.text} leading-tight`}
        />
        <EditableText
          sectionId={id}
          fieldKey="subtitle"
          value={content.subtitle as string}
          placeholder="Add subtitle..."
          tag="p"
          className={`mt-4 @md:mt-6 text-lg @md:text-xl ${c.textSecondary} leading-relaxed`}
        />
        {(content.showPrimaryButton || content.showSecondaryButton) && (
          <div className="mt-10 flex flex-col @sm:flex-row items-center justify-center gap-3 @sm:gap-4">
            {content.showPrimaryButton !== false && content.ctaText && (
              <button className={`${c.btnPrimary} rounded-lg px-6 py-3 text-sm font-medium`}>
                <EditableText
                  sectionId={id}
                  fieldKey="ctaText"
                  value={content.ctaText as string}
                  placeholder="Button"
                />
              </button>
            )}
            {content.showSecondaryButton && content.ctaSecondaryText && (
              <button className={`${c.btnSecondary} rounded-lg px-6 py-3 text-sm font-medium`}>
                <EditableText
                  sectionId={id}
                  fieldKey="ctaSecondaryText"
                  value={content.ctaSecondaryText as string}
                  placeholder="Button"
                />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
