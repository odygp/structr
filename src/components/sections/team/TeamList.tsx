'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function TeamList({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const members = content.members || [];

  return (
    <section className={`py-12 md:py-20 px-4 md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl md:text-3xl font-bold ${c.text} mb-4`}>
            {content.title || 'Our Team'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>{content.subtitle}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {(members as Array<{ name: string; role: string }>).map((member, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${c.bgAvatar} flex-shrink-0`} />
              <div>
                <h3 className={`font-semibold ${c.text} text-sm`}>{member.name}</h3>
                <p className={`text-xs ${c.textSecondary}`}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
