'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function GalleryMasonry({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const images = (content.images as { caption: string }[]) || [];

  return (
    <section className={`py-10 @md:py-16 px-4 @md:px-6 ${c.bg}`}>
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
