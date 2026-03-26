'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function AboutTimeline({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');

  const missionText = (content.mission as string) || '';
  const milestones = missionText
    ? missionText.split('.').map((s: string) => s.trim()).filter(Boolean).slice(0, 3)
    : ['Founded the company', 'Expanded globally', 'Reached new milestones'];

  return (
    <section className={`py-20 px-6 ${c.bg}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-2xl md:text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'About Us'}
          </h2>
          {content.description && (
            <p className={`text-lg ${c.textSecondary} max-w-2xl mx-auto`}>
              {content.description as string}
            </p>
          )}
        </div>
        <div className={`relative pl-8 border-l-2 ${c.border} space-y-12`}>
          {milestones.map((milestone, index) => (
            <div key={index} className="relative">
              <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full ${c.text === 'text-white' ? 'bg-white' : 'bg-gray-900'}`} />
              <p className={`${c.textSecondary} leading-relaxed`}>{milestone}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
