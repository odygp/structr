'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';

export default function BlogGrid({ content, colorMode }: { content: Record<string, any>; colorMode?: ColorMode }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'blog');
  const gridCols = getGridColsClass(content._columns);
  const posts = (content.posts as Array<{ title: string; excerpt: string; author: string; date: string }>) || [];

  return (
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl md:text-3xl font-bold ${c.text} mb-4`}>
            {(content.title as string) || 'From the Blog'}
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>{content.subtitle as string}</p>
          )}
        </div>
        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {posts.map((post, index) => (
            <div key={index} className={`${c.bgCard} border ${c.border} rounded-xl overflow-hidden`}>
              <div className={`w-full h-48 ${c.bgPlaceholder}`} />
              <div className="p-6">
                <h3 className={`text-lg font-semibold ${c.text} mb-2`}>{post.title}</h3>
                <p className={`text-sm ${c.textSecondary} mb-4 line-clamp-3`}>{post.excerpt}</p>
                <div className={`flex items-center justify-between text-xs ${c.textMuted}`}>
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
