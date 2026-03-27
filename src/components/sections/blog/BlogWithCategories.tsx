'use client';
import { SectionContent, ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import { getGridColsClass } from '@/lib/columns';
import EditableText from '@/components/builder/EditableText';

export default function BlogWithCategories({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'blog');
  const gridCols = getGridColsClass(content._columns);
  const id = sectionId || '';
  const posts = (content.posts as Array<{ title: string; excerpt: string; author: string; date: string }>) || [];
  const categories = ['All', 'Design', 'Engineering', 'Product', 'Company'];

  return (
    <section className={`py-12 @md:py-20 px-4 @md:px-6 ${c.bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className={`text-2xl @md:text-3xl font-bold ${c.text} mb-4`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Blog" />
          </h2>
          {content.subtitle && (
            <p className={`text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
          )}
        </div>

        {/* Category pills */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {categories.map((cat, i) => (
            <span
              key={i}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                i === 0
                  ? `${c.btnPrimary}`
                  : `${c.bgMuted} ${c.textSecondary}`
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-3 gap-8">
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
