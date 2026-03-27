'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function BlogMinimal({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'blog');
  const id = sectionId || '';
  const posts = (content.posts as Array<{ title: string; excerpt: string; author: string; date: string }>) || [];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-3xl mx-auto">
        <h2 className={`text-center text-2xl @md:text-3xl font-bold ${c.text} mb-12`}>
          {(content.title as string) || 'From the Blog'}
        </h2>
        <div className={`${c.divider} divide-y`}>
          {posts.map((post, index) => (
            <div key={index} className="flex items-center justify-between py-5">
              <h3 className={`text-lg font-medium ${c.text}`}>{post.title}</h3>
              <span className={`text-sm ${c.textMuted} shrink-0 ml-6`}>{post.date}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
