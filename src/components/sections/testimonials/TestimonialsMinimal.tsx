'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function TestimonialsMinimal({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'testimonials');
  const id = sectionId || '';
  const testimonials = (content.testimonials as Array<{ quote: string; author: string; role: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
        </div>
        <div className="space-y-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="text-center">
              <p className={`text-xl ${c.textSecondary} leading-relaxed italic`}>
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6">
                <p className={`text-sm font-semibold ${c.text}`}>{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
