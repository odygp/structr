'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function TestimonialsCarousel({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'testimonials');
  const gridCols = getGridColsClass(content._columns);
  const id = sectionId || '';
  const testimonials = (content.testimonials as any[]) || [];

  return (
    <section className={`${spacing} ${c.bgAlt}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
        </div>

        <div className="relative flex items-center">
          {/* Left arrow */}
          <button className={`flex-shrink-0 w-10 h-10 rounded-full border ${c.border} ${c.bg} flex items-center justify-center ${c.textSecondary} mr-4`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* Cards */}
          <div className={`flex-1 grid grid-cols-1 ${gridCols} gap-6`}>
            {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
              <div
                key={index}
                className={`${c.bg} rounded-2xl p-8 border ${c.border}`}
              >
                <p className={`${c.textSecondary} mb-6 leading-relaxed`}>
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${c.bgPlaceholder} flex-shrink-0`} />
                  <div>
                    <p className={`text-sm font-semibold ${c.text}`}>
                      {testimonial.author}
                    </p>
                    <p className={`text-sm ${c.textMuted}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button className={`flex-shrink-0 w-10 h-10 rounded-full border ${c.border} ${c.bg} flex items-center justify-center ${c.textSecondary} ml-4`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
