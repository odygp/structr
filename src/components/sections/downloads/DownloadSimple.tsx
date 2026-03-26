'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function DownloadSimple({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'downloads');

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-12 items-center">
          {/* Left: description */}
          <div>
            <h2 className={`text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
            <p className={`mt-4 text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          </div>
          {/* Right: app store buttons */}
          <div className="flex flex-col @md:flex-row gap-4 @md:justify-end">
            <div className={`${c.bgAlt} rounded-xl px-6 py-4 flex items-center gap-3`}>
              <div className={`w-10 h-10 ${c.bgPlaceholder} rounded-lg`} />
              <div>
                <span className={`text-xs ${c.textMuted}`}>Download on the</span>
                <p className={`text-sm font-semibold ${c.text}`}>App Store</p>
              </div>
            </div>
            <div className={`${c.bgAlt} rounded-xl px-6 py-4 flex items-center gap-3`}>
              <div className={`w-10 h-10 ${c.bgPlaceholder} rounded-lg`} />
              <div>
                <span className={`text-xs ${c.textMuted}`}>Get it on</span>
                <p className={`text-sm font-semibold ${c.text}`}>Google Play</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
