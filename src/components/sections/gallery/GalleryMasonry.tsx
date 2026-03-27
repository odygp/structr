'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function GalleryMasonry({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'gallery');
  const id = sectionId || '';
  const images = (content.images as { caption: string }[]) || [];

  return (
    <section className={`py-10 @md:py-16 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={`text-2xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Gallery" />
          </h2>
          {content.subtitle && (
            <p className={`mt-2 ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>

        <div className="columns-1 @sm:columns-2 @md:columns-3 gap-4 space-y-4">
          {images.map((image, index) => (
            <div key={index} className="break-inside-avoid">
              <div
                className={`${c.bgPlaceholder} rounded-xl w-full ${
                  index % 2 === 0 ? 'h-48' : 'h-64'
                }`}
              />
              {image.caption && (
                <p className={`mt-2 text-sm ${c.textSecondary} text-center`}>
                  {image.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
