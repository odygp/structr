'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function FaqAccordion({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'faq');
  const questions = content.questions || [];

  return (
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${c.text} mb-4`}>
            {content.title || 'Frequently Asked Questions'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>{content.subtitle}</p>
          )}
        </div>
        <div className={`divide-y ${c.divider} border-t border-b ${c.border}`}>
          {(questions as any[]).map((item: { question: string; answer: string }, index: number) => (
            <div key={index} className="py-6">
              <h3 className={`text-lg font-semibold ${c.text} mb-2`}>
                {item.question}
              </h3>
              <p className={c.textSecondary}>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
