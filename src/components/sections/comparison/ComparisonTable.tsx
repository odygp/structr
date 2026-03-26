'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function ComparisonTable({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'comparison');
  const items = (content.items as Array<{ feature: string; option1: string; option2: string; option3: string }>) || [];

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
        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${c.border}`}>
                <th className={`py-3 pr-4 text-sm font-semibold ${c.text}`}>Feature</th>
                <th className={`py-3 px-4 text-sm font-semibold ${c.text} text-center`}>Starter</th>
                <th className={`py-3 px-4 text-sm font-semibold ${c.text} text-center`}>Pro</th>
                <th className={`py-3 pl-4 text-sm font-semibold ${c.text} text-center`}>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className={`border-b ${c.border}`}>
                  <td className={`py-3 pr-4 text-sm ${c.text}`}>{item.feature}</td>
                  <td className={`py-3 px-4 text-sm text-center ${item.option1 === 'true' ? c.text : c.textMuted}`}>
                    {item.option1 === 'true' ? '\u2713' : '\u2014'}
                  </td>
                  <td className={`py-3 px-4 text-sm text-center ${item.option2 === 'true' ? c.text : c.textMuted}`}>
                    {item.option2 === 'true' ? '\u2713' : '\u2014'}
                  </td>
                  <td className={`py-3 pl-4 text-sm text-center ${item.option3 === 'true' ? c.text : c.textMuted}`}>
                    {item.option3 === 'true' ? '\u2713' : '\u2014'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
