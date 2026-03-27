'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function FaqCentered({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'faq');
  const id = sectionId || '';
  const questions = (content.questions as Array<{ question: string; answer: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="FAQ" />
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
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
