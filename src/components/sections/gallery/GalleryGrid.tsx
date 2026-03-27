'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function GalleryGrid({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'gallery');
  const gridCols = getGridColsClass(content._columns);
  const images = (content.images as { caption: string }[]) || [];

  return (
    <section className={`${spacing} ${c.bg}`}>
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

        <div className={`grid grid-cols-1 @sm:grid-cols-2 ${gridCols} gap-6`}>
          {images.map((image, index) => (
            <div key={index}>
              <div className={`${c.bgPlaceholder} rounded-xl aspect-video`} />
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
