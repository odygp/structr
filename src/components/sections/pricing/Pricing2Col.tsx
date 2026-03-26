'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function Pricing2Col({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const plans = content.plans || [];

  return (
    <section className={`py-12 md:py-20 px-4 md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl md:text-3xl font-bold ${c.text} mb-4`}>
            {content.title || 'Pricing Plans'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary} max-w-2xl mx-auto`}>
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {(plans as any[]).slice(0, 2).map((plan: any, index: number) => {
            const isHighlighted = plan.highlighted === true;
            const features = typeof plan.features === 'string'
              ? plan.features.split(',').map((f: string) => f.trim())
              : [];

            return (
              <div
                key={index}
                className={`rounded-2xl p-10 flex flex-col ${
                  isHighlighted
                    ? `${c.hlBg} text-white`
                    : `${c.bg} border ${c.border}`
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isHighlighted ? c.hlText : c.text
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span
                    className={`text-4xl font-bold ${
                      isHighlighted ? c.hlText : c.text
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm ml-1 ${
                        isHighlighted ? c.hlTextSecondary : 'text-gray-500'
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p
                    className={`text-sm mb-6 ${
                      isHighlighted ? c.hlTextSecondary : c.textSecondary
                    }`}
                  >
                    {plan.description}
                  </p>
                )}
                <ul className="flex-1 space-y-3 mb-8">
                  {features.map((feature: string, i: number) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm ${
                        isHighlighted ? c.hlTextSecondary : c.textSecondary
                      }`}
                    >
                      <span className="mt-1">&#8226;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full rounded-lg px-6 py-3 font-medium ${
                    isHighlighted
                      ? c.hlBtn
                      : c.btnPrimary
                  }`}
                >
                  {plan.ctaText || 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
