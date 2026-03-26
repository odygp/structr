'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function GalleryCarousel({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const images = (content.images as { caption: string }[]) || [];

  return (
    <section className={`py-10 @md:py-16 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={`text-2xl font-bold ${c.text}`}>
            {(content.title as string) || 'Gallery'}
          </h2>
        </div>

        <div className="flex overflow-hidden gap-4">
          {images.slice(0, 3).map((image, index) => (
            <div key={index} className="flex-1 min-w-0">
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
