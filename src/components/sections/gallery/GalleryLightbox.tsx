'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function GalleryLightbox({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
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

        <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={index} className="group relative cursor-pointer">
              <div className={`${c.bgPlaceholder} rounded-xl aspect-video`} />
              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
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
