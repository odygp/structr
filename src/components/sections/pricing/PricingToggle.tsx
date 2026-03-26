'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function PricingToggle({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const plans = (content.plans as Array<{ name: string; price: string; period?: string; description?: string; features?: string; highlighted?: boolean; ctaText?: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'Pricing Plans'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary} max-w-2xl mx-auto mb-8`}>
              {content.subtitle as string}
            </p>
          )}
          <div className={`inline-flex items-center gap-3 ${c.bgMuted} rounded-full px-1 py-1`}>
            <span className={`${c.bg} ${c.text} text-sm font-medium px-4 py-2 rounded-full shadow-sm`}>
              Monthly
            </span>
            <span className={`${c.textSecondary} text-sm font-medium px-4 py-2`}>
              Annual
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const isHighlighted = plan.highlighted === true;
            const features = typeof plan.features === 'string'
              ? plan.features.split(',').map((f: string) => f.trim())
              : [];
            return (
              <div
                key={index}
                className={`rounded-2xl p-8 flex flex-col ${
                  isHighlighted
                    ? `${c.hlBg} text-white`
                    : `${c.bg} border ${c.border}`
                }`}
              >
                <h3 className={`text-xl font-semibold mb-2 ${isHighlighted ? c.hlText : c.text}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${isHighlighted ? c.hlText : c.text}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ml-1 ${isHighlighted ? c.hlTextSecondary : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className={`text-sm mb-6 ${isHighlighted ? c.hlTextSecondary : c.textSecondary}`}>
                    {plan.description}
                  </p>
                )}
                <ul className="flex-1 space-y-3 mb-8">
                  {features.map((feature: string, i: number) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm ${isHighlighted ? c.hlTextSecondary : c.textSecondary}`}
                    >
                      <span className="mt-1">&#8226;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full rounded-lg px-6 py-3 font-medium ${
                    isHighlighted ? c.hlBtn : c.btnPrimary
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
