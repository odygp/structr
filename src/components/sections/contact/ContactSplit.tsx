'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function ContactSplit({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-12">
        <div>
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {content.title || 'Contact Us'}
          </h2>
          {content.subtitle && (
            <p className={`${c.textSecondary} mb-8`}>{content.subtitle}</p>
          )}
          <div className="space-y-4">
            {content.email && (
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
                <span className={c.textSecondary}>{content.email}</span>
              </div>
            )}
            {content.phone && (
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
                <span className={c.textSecondary}>{content.phone}</span>
              </div>
            )}
            {content.address && (
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
                <span className={c.textSecondary}>{content.address}</span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className={`w-full border rounded-lg px-4 py-3 ${c.input}`}
            readOnly
          />
          <input
            type="email"
            placeholder="Your Email"
            className={`w-full border rounded-lg px-4 py-3 ${c.input}`}
            readOnly
          />
          <textarea
            placeholder="Your Message"
            rows={4}
            className={`w-full border rounded-lg px-4 py-3 ${c.input} resize-none`}
            readOnly
          />
          <button className={`${c.btnPrimary} font-semibold rounded-lg px-6 py-3 w-full`}>
            Send Message
          </button>
        </div>
      </div>
    </section>
  );
}
