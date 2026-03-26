'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';

export default function DownloadSimple({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'downloads');

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-12 items-center">
          {/* Left: description */}
          <div>
            <h2 className={`text-3xl font-bold ${c.text}`}>
              {content.title as string}
            </h2>
            <p className={`mt-4 text-lg ${c.textSecondary}`}>
              {content.subtitle as string}
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
