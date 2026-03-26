'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function FaqTwoColumn({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const questions = content.questions || [];

  return (
    <section className={`py-20 px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${c.text} mb-4`}>
            {content.title || 'Frequently Asked Questions'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>{content.subtitle}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(questions as any[]).map((item: { question: string; answer: string }, index: number) => (
            <div key={index} className={`border-b ${c.border} pb-6`}>
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
