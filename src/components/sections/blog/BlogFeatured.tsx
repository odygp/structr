'use client';

import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function BlogFeatured({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'blog');
  const gridCols = getGridColsClass(content._columns);
  const id = sectionId || '';
  const posts = (content.posts as Array<{ title: string; excerpt: string; author: string; date: string }>) || [];
  const featured = posts[0];
  const secondary = posts.slice(1, 3);

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="From the Blog" />
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>

        {featured && (
          <div className={`mb-10 border ${c.border} rounded-xl overflow-hidden`}>
            <div className={`w-full h-72 ${c.bgPlaceholder}`} />
            <div className="p-8">
              <h3 className={`text-2xl font-bold ${c.text} mb-3`}>{featured.title}</h3>
              <p className={`${c.textSecondary} mb-4 line-clamp-3`}>{featured.excerpt}</p>
              <div className={`flex items-center gap-4 text-sm ${c.textMuted}`}>
                <span>{featured.author}</span>
                <span>{featured.date}</span>
              </div>
            </div>
          </div>
        )}

        {secondary.length > 0 && (
          <div className="grid grid-cols-1 @md:grid-cols-2 gap-8">
            {secondary.map((post, index) => (
              <div key={index} className={`border ${c.border} rounded-xl overflow-hidden`}>
                <div className={`w-full h-48 ${c.bgPlaceholder}`} />
                <div className="p-6">
                  <h3 className={`text-lg font-semibold ${c.text} mb-2`}>{post.title}</h3>
                  <p className={`text-sm ${c.textSecondary} mb-3 line-clamp-2`}>{post.excerpt}</p>
                  <div className={`flex items-center gap-4 text-xs ${c.textMuted}`}>
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
