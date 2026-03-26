'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';

export default function GalleryGrid({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'gallery');
  const gridCols = getGridColsClass(content._columns);
  const images = (content.images as { caption: string }[]) || [];

  return (
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={`text-2xl font-bold ${c.text}`}>
            {(content.title as string) || 'Gallery'}
          </h2>
          {content.subtitle && (
            <p className={`mt-2 ${c.textSecondary}`}>
              {content.subtitle as string}
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
