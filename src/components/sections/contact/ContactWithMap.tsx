'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function ContactWithMap({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-3`}>
            {content.title || 'Get in Touch'}
          </h2>
          {content.subtitle && (
            <p className={`${c.textSecondary} max-w-xl mx-auto`}>{content.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-2 gap-10">
          {/* Form */}
          <div>
            <div className="space-y-4 mb-6">
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
                rows={5}
                className={`w-full border rounded-lg px-4 py-3 ${c.input} resize-none`}
                readOnly
              />
              <button className={`${c.btnPrimary} font-semibold rounded-lg px-6 py-3 w-full`}>
                Send Message
              </button>
            </div>

            <div className="space-y-3">
              {content.email && (
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
                  <span className={`text-sm ${c.textSecondary}`}>{content.email}</span>
                </div>
              )}
              {content.phone && (
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
                  <span className={`text-sm ${c.textSecondary}`}>{content.phone}</span>
                </div>
              )}
              {content.address && (
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 ${c.bgAvatar} rounded`} />
                  <span className={`text-sm ${c.textSecondary}`}>{content.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Map placeholder */}
          <div className={`${c.bgPlaceholder} rounded-xl flex flex-col items-center justify-center min-h-[360px]`}>
            <svg className={`w-10 h-10 ${c.textMuted} mb-3`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className={`text-sm ${c.textMuted}`}>Map placeholder</span>
          </div>
        </div>
      </div>
    </section>
  );
}
