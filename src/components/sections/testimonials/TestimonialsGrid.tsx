'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function TestimonialsGrid({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'testimonials');
  const gridCols = getGridColsClass(content._columns);
  const id = sectionId || '';
  const testimonials = (content.testimonials as Array<{ quote: string; author: string; role: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bgAlt}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            {(content.title as string) || 'What Our Customers Say'}
          </h2>
        </div>
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-8">
          {testimonials.slice(0, 4).map((testimonial, index) => (
            <div
              key={index}
              className={`${c.bg} rounded-2xl p-8 border ${c.border}`}
            >
              <p className={`${c.textSecondary} mb-6 leading-relaxed`}>
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${c.bgAvatar} flex-shrink-0`} />
                <div>
                  <p className={`text-sm font-semibold ${c.text}`}>{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
