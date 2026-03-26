'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function ContactMinimal({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');

  return (
    <section className={`py-20 px-6 ${c.bg}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`text-3xl font-bold ${c.text} mb-4`}>
          {(content.title as string) || 'Contact Us'}
        </h2>
        {content.subtitle && (
          <p className={`${c.textSecondary} mb-12`}>{content.subtitle as string}</p>
        )}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          {content.email && (
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
              <span className={c.textSecondary}>{content.email as string}</span>
            </div>
          )}
          {content.phone && (
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
              <span className={c.textSecondary}>{content.phone as string}</span>
            </div>
          )}
          {content.address && (
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
              <span className={c.textSecondary}>{content.address as string}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
