'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function FaqCentered({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const questions = (content.questions as Array<{ question: string; answer: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'Frequently Asked Questions'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>{content.subtitle as string}</p>
          )}
        </div>
        <div className="space-y-6">
          {questions.map((item, index) => (
            <div key={index} className={`${c.bgAlt} rounded-xl p-6`}>
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
