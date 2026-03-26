'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function TestimonialsCards({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'testimonials');
  const gridCols = getGridColsClass(content._columns);
  const testimonials = content.testimonials || [];

  return (
    <section className={`${spacing} ${c.bgAlt}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            {content.title || 'What Our Customers Say'}
          </h2>
        </div>

        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {(testimonials as any[]).map((testimonial: any, index: number) => (
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
                  <p className="text-sm text-gray-500">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
