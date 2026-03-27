'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function PricingSimple({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'pricing');
  const id = sectionId || '';
  const plans = (content.plans as Array<{ name: string; price: string; period?: string; description?: string; features?: string; ctaText?: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Pricing Plans" />
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>
        <div className={`divide-y ${c.divider}`}>
          {plans.map((plan, index) => {
            const features = typeof plan.features === 'string'
              ? plan.features.split(',').map((f: string) => f.trim())
              : [];
            return (
              <div key={index} className="py-8 flex flex-col @md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold ${c.text}`}>{plan.name}</h3>
                  <div className="mt-1">
                    <span className={`text-2xl @md:text-3xl font-bold ${c.text}`}>{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
                    )}
                  </div>
                  {features.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      {features.map((feature: string, i: number) => (
                        <li key={i} className={`text-sm ${c.textSecondary}`}>&#8226; {feature}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button className={`${c.btnPrimary} rounded-lg px-6 py-3 text-sm font-medium whitespace-nowrap`}>
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
