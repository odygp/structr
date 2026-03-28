'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { componentRegistry } from '@/components/sections';
import CommentSystem from '@/components/preview/CommentSystem';
import type { ContentValue, ColorMode, SectionCategory } from '@/lib/types';

interface PublishedSection {
  id: string;
  category: SectionCategory;
  variantId: string;
  content: Record<string, ContentValue>;
  colorMode: ColorMode;
}

interface PublishedPage {
  name: string;
  sections: PublishedSection[];
}

interface PublishedData {
  project_id: string;
  name: string;
  slug: string;
  version: number;
  published_at: string;
  pages: { name: string; sort_order: number; sections: { category: string; variant_id: string; content: Record<string, unknown>; color_mode: string; sort_order: number }[] }[];
}

export default function PublishedProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<PublishedData | null>(null);
  const [pages, setPages] = useState<PublishedPage[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/p/${slug}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Not found');
        }
        const d: PublishedData = await res.json();
        setData(d);

        // Convert snapshot format to render format
        const converted: PublishedPage[] = (d.pages || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(p => ({
            name: p.name,
            sections: (p.sections || [])
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(s => ({
                id: crypto.randomUUID(),
                category: s.category as SectionCategory,
                variantId: s.variant_id,
                content: s.content as Record<string, ContentValue>,
                colorMode: (s.color_mode || 'light') as ColorMode,
              })),
          }));
        setPages(converted);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
          <p className="text-sm text-gray-500">{error || 'This project is not published'}</p>
        </div>
      </div>
    );
  }

  const currentPage = pages[activePage];

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal top bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#1a1a1a" />
              <path d="M7 7h14v14H7V7zm2 2v10h10V9H9z" fill="white" />
              <path d="M7 7l14 14M21 7L7 21" stroke="white" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium text-gray-900">{data.name}</span>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">v{data.version}</span>
          </div>

          {pages.length > 1 && (
            <div className="flex items-center gap-1">
              {pages.map((page, i) => (
                <button
                  key={i}
                  onClick={() => setActivePage(i)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    i === activePage
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page.name}
                </button>
              ))}
            </div>
          )}

          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Built with Structr
          </a>
        </div>
      </div>

      {/* Sections */}
      <main className="@container">
        {currentPage?.sections.map((section) => {
          const Component = componentRegistry[section.variantId];
          if (!Component) return null;
          return (
            <div key={section.id}>
              <Component content={section.content} colorMode={section.colorMode} />
            </div>
          );
        })}
        {(!currentPage?.sections || currentPage.sections.length === 0) && (
          <div className="py-20 text-center text-gray-400 text-sm">
            This page has no sections yet.
          </div>
        )}
      </main>

      {/* Comment system */}
      {data.project_id && (
        <CommentSystem
          projectId={data.project_id}
          activePage={activePage}
          sectionCount={currentPage?.sections.length || 0}
        />
      )}
    </div>
  );
}
