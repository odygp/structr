'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';

export default function BlogList({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const posts = (content.posts as Array<{ title: string; excerpt: string; author: string; date: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'From the Blog'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>{content.subtitle as string}</p>
          )}
        </div>
        <div className="space-y-8">
          {posts.map((post, index) => (
            <div
              key={index}
              className={`flex flex-col @md:flex-row gap-6 border-b ${c.borderLight} pb-8`}
            >
              <div className={`w-full @md:w-56 h-40 ${c.bgPlaceholder} rounded-lg shrink-0`} />
              <div className="flex flex-col justify-center">
                <h3 className={`text-xl font-semibold ${c.text} mb-2`}>{post.title}</h3>
                <p className={`text-sm ${c.textSecondary} mb-3 line-clamp-2`}>{post.excerpt}</p>
                <div className={`flex items-center gap-4 text-xs ${c.textMuted}`}>
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
