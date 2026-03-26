'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function FaqSideTitle({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const questions = (content.questions as Array<{ question: string; answer: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 @md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'Frequently Asked Questions'}
          </h2>
          {content.subtitle && (
            <p className={c.textSecondary}>{content.subtitle as string}</p>
          )}
        </div>
        <div className="md:col-span-8">
          <div className={`divide-y ${c.divider} border-t border-b ${c.border}`}>
            {questions.map((item, index) => (
              <div key={index} className="py-6">
                <h3 className={`text-lg font-semibold ${c.text} mb-2`}>
                  {item.question}
                </h3>
                <p className={c.textSecondary}>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
