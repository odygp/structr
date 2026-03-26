'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import EditableText from '@/components/builder/EditableText';

export default function PricingComparison({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const plans = (content.plans as any[]) || [];

  // Collect unique feature names from all plans
  const allFeatures: string[] = [];
  plans.forEach((plan: any) => {
    const featureList = typeof plan.features === 'string'
      ? plan.features.split(',').map((f: string) => f.trim())
      : [];
    featureList.forEach((f: string) => {
      if (!allFeatures.includes(f)) allFeatures.push(f);
    });
  });

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {content.title || 'Compare Plans'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary} max-w-2xl mx-auto`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${c.border}`}>
                <th className={`text-left py-4 px-4 text-sm font-semibold ${c.text}`}>Features</th>
                {plans.map((plan: any, i: number) => (
                  <th key={i} className={`text-center py-4 px-4 text-sm font-semibold ${c.text}`}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature, fi) => (
                <tr key={fi} className={`border-b ${c.border}`}>
                  <td className={`py-3 px-4 text-sm ${c.textSecondary}`}>{feature}</td>
                  {plans.map((plan: any, pi: number) => {
                    const planFeatures = typeof plan.features === 'string'
                      ? plan.features.split(',').map((f: string) => f.trim())
                      : [];
                    const hasFeature = planFeatures.includes(feature);
                    return (
                      <td key={pi} className="text-center py-3 px-4 text-sm">
                        <span className={hasFeature ? c.text : c.textMuted}>
                          {hasFeature ? '✓' : '—'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
