'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function ContactCards({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');

  return (
    <section className={`py-20 px-6 ${c.bgAlt}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'Contact Us'}
          </h2>
          {content.subtitle && (
            <p className={c.textSecondary}>{content.subtitle as string}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`${c.bgCard} border ${c.border} rounded-xl p-8 text-center`}>
            <div className={`w-12 h-12 ${c.bgPlaceholder} rounded-lg mx-auto mb-4`} />
            <h3 className={`font-semibold ${c.text} mb-2`}>Email</h3>
            <p className={`text-sm ${c.textSecondary}`}>{(content.email as string) || 'hello@company.com'}</p>
          </div>
          <div className={`${c.bgCard} border ${c.border} rounded-xl p-8 text-center`}>
            <div className={`w-12 h-12 ${c.bgPlaceholder} rounded-lg mx-auto mb-4`} />
            <h3 className={`font-semibold ${c.text} mb-2`}>Phone</h3>
            <p className={`text-sm ${c.textSecondary}`}>{(content.phone as string) || '(555) 123-4567'}</p>
          </div>
          <div className={`${c.bgCard} border ${c.border} rounded-xl p-8 text-center`}>
            <div className={`w-12 h-12 ${c.bgPlaceholder} rounded-lg mx-auto mb-4`} />
            <h3 className={`font-semibold ${c.text} mb-2`}>Address</h3>
            <p className={`text-sm ${c.textSecondary}`}>{(content.address as string) || '123 Main St, City'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
