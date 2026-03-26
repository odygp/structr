'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function ProcessSteps({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'process');
  const steps = (content.steps as Array<{ title: string; description: string }>) || [];

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            {content.title as string}
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            {content.subtitle as string}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full ${c.btnPrimary} flex items-center justify-center text-lg font-bold`}>
                {i + 1}
              </div>
              <h3 className={`mt-4 text-lg font-semibold ${c.text}`}>{step.title}</h3>
              <p className={`mt-2 text-sm ${c.textSecondary} leading-relaxed`}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
