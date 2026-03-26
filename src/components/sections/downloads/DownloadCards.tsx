'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function DownloadCards({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'downloads');
  const items = (content.items as Array<{ title: string; description: string; ctaText: string }>) || [];

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} className={`${c.bgAlt} rounded-xl p-6 flex flex-col items-center text-center`}>
              {/* App icon placeholder */}
              <div className={`w-16 h-16 ${c.bgPlaceholder} rounded-2xl`} />
              <h3 className={`mt-4 text-lg font-semibold ${c.text}`}>{item.title}</h3>
              <p className={`mt-2 text-sm ${c.textSecondary} leading-relaxed`}>{item.description}</p>
              <button className={`mt-6 ${c.btnPrimary} px-5 py-2.5 rounded-lg text-sm font-medium`}>
                {item.ctaText || 'Download'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
