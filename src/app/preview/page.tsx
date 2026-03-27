'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { componentRegistry } from '@/components/sections';
import type { PlacedSection, ContentValue, ColorMode } from '@/lib/types';

interface PreviewPage {
  name: string;
  sections: PlacedSection[];
}

interface PreviewProject {
  name: string;
  pages: PreviewPage[];
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const encoded = searchParams.get('d');
  const [project, setProject] = useState<PreviewProject | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (projectId) {
          // Load from Supabase via API
          const res = await fetch(`/api/preview/${projectId}`);
          if (!res.ok) throw new Error('Project not found');
          const data = await res.json();

          // Convert DB format to preview format
          const pages: PreviewPage[] = (data.structr_pages || [])
            .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
            .map((p: { name: string; structr_sections?: { category: string; variant_id: string; content: Record<string, unknown>; color_mode: string; sort_order: number }[] }) => ({
              name: p.name,
              sections: (p.structr_sections || [])
                .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
                .map((s: { category: string; variant_id: string; content: Record<string, unknown>; color_mode: string }) => ({
                  id: crypto.randomUUID(),
                  category: s.category,
                  variantId: s.variant_id,
                  content: s.content as Record<string, ContentValue>,
                  colorMode: (s.color_mode || 'light') as ColorMode,
                })),
            }));

          setProject({ name: data.name, pages });
        } else if (encoded) {
          // Load from compressed URL param (legacy share)
          const res = await fetch(`/api/share?d=${encoded}`);
          if (!res.ok) throw new Error('Invalid share link');
          const data = await res.json();
          setProject({
            name: data.name || 'Shared Project',
            pages: data.pages || [{ name: 'Home', sections: data.sections || [] }],
          });
        } else {
          throw new Error('No project specified');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, encoded]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Preview unavailable</h1>
          <p className="text-sm text-gray-500">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  const currentPage = project.pages[activePage];

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
            <span className="text-sm font-medium text-gray-900">{project.name}</span>
          </div>

          {/* Page tabs */}
          {project.pages.length > 1 && (
            <div className="flex items-center gap-1">
              {project.pages.map((page, i) => (
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

          <a
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Built with Structr
          </a>
        </div>
      </div>

      {/* Sections */}
      <main>
        {currentPage?.sections.map((section) => {
          const Component = componentRegistry[section.variantId];
          if (!Component) return null;
          return (
            <div key={section.id}>
              <Component
                content={section.content}
                colorMode={section.colorMode}
              />
            </div>
          );
        })}

        {(!currentPage?.sections || currentPage.sections.length === 0) && (
          <div className="py-20 text-center text-gray-400 text-sm">
            This page has no sections yet.
          </div>
        )}
      </main>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <PreviewContent />
    </Suspense>
  );
}
