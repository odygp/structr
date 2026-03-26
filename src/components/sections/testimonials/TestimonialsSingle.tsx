'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function TestimonialsSingle({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const testimonials = content.testimonials || [];
  const testimonial = (testimonials as any[])[0];

  if (!testimonial) return null;

  return (
    <section className={`py-20 px-6 ${c.bgAlt}`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            {content.title || 'What Our Customers Say'}
          </h2>
        </div>

        <div className="text-center">
          <p className={`text-2xl ${c.textSecondary} leading-relaxed mb-8`}>
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-full ${c.bgPlaceholder}`} />
            <div>
              <p className={`text-base font-semibold ${c.text}`}>
                {testimonial.author}
              </p>
              <p className="text-sm text-gray-400">
                {testimonial.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
