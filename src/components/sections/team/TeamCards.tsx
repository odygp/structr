'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function TeamCards({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const members = (content.members as Array<{ name: string; role: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'Our Team'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>{content.subtitle as string}</p>
          )}
        </div>
        <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-4 gap-8">
          {members.map((member, index) => (
            <div key={index} className={`${c.bgAlt} rounded-xl p-6 text-center`}>
              <div className={`w-20 h-20 rounded-full ${c.bgAvatar} mx-auto mb-4`} />
              <h3 className={`font-semibold ${c.text}`}>{member.name}</h3>
              <p className={`text-sm ${c.textSecondary} mt-1`}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
