'use client';
import { useEffect, useState, Suspense } from 'react';
import { useBuilderStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import Toolbar from './Toolbar';
import SectionCatalog from './SectionCatalog';
import Canvas from './Canvas';
import ContentEditor from './ContentEditor';
import { CommentsSidebar } from './CommentsOverlay';

interface Comment {
  id: string;
  project_id: string;
  page_index: number;
  section_index: number;
  author_name: string;
  message: string;
  resolved: boolean;
  parent_id: string | null;
  created_at: string;
}

export default function BuilderLayout() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#f2f2f2]"><div className="animate-pulse text-[#808080]">Loading...</div></div>}>
      <BuilderLayoutInner />
    </Suspense>
  );
}

function BuilderLayoutInner() {
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);
  const copySection = useBuilderStore((s) => s.copySection);
  const pasteSection = useBuilderStore((s) => s.pasteSection);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const selectSection = useBuilderStore((s) => s.selectSection);

  const [liveMessage, setLiveMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [pendingPages, setPendingPages] = useState<{ name: string; url: string; sortOrder: number; loading: boolean; done: boolean; error?: boolean }[]>([]);

  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  // Load comments
  useEffect(() => {
    if (!projectId) return;
    const load = () => fetch(`/api/comments?project=${projectId}`)
      .then(r => r.ok ? r.json() : [])
      .then(setComments)
      .catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  // Load/reload project data from Supabase
  const loadRemoteProject = useBuilderStore((s) => s.loadRemoteProject);
  const reloadProject = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        loadRemoteProject(data);
      }
    } catch {}
  };

  // Initial load: fetch project from Supabase on mount
  useEffect(() => {
    if (!projectId) return;
    // Check if we already have this project loaded
    const existing = useBuilderStore.getState().projects.find(p => p.id === projectId);
    if (!existing || existing.pages.length === 0 || (existing.pages.length === 1 && existing.pages[0].sections.length === 0)) {
      reloadProject();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Background import: process pending pages one by one
  useEffect(() => {
    if (!projectId) return;
    const stored = sessionStorage.getItem(`structr-import-${projectId}`);
    if (!stored) return;
    sessionStorage.removeItem(`structr-import-${projectId}`);

    let pages: { url: string; name: string; sortOrder: number }[];
    try { pages = JSON.parse(stored); } catch { return; }
    if (!pages.length) return;

    const initial = pages.map(p => ({ ...p, loading: false, done: false, error: false }));
    setPendingPages(initial);

    (async () => {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        setPendingPages(prev => prev.map((p, j) => j === i ? { ...p, loading: true } : p));

        try {
          const res = await fetch('/api/import/website/page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId,
              url: page.url,
              name: page.name,
              sortOrder: page.sortOrder,
            }),
          });
          const data = await res.json();
          const success = !data.skipped && data.done;

          setPendingPages(prev => prev.map((p, j) =>
            j === i ? { ...p, loading: false, done: true, error: !success } : p
          ));

          // Reload project from Supabase after each successful page import
          if (success) await reloadProject();
        } catch {
          setPendingPages(prev => prev.map((p, j) =>
            j === i ? { ...p, loading: false, done: true, error: true } : p
          ));
        }
      }

      // Clear pending indicators after all done
      setTimeout(() => setPendingPages([]), 3000);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Background import: Octopus.do pages (same pattern, different API endpoint)
  useEffect(() => {
    if (!projectId) return;
    const stored = sessionStorage.getItem(`structr-octopus-${projectId}`);
    if (!stored) return;
    sessionStorage.removeItem(`structr-octopus-${projectId}`);

    let pages: { name: string; description?: string; seoTitle?: string; seoDescription?: string; sortOrder: number }[];
    try { pages = JSON.parse(stored); } catch { return; }
    if (!pages.length) return;

    const initial = pages.map(p => ({ ...p, url: '', loading: false, done: false, error: false }));
    setPendingPages(initial);

    (async () => {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        setPendingPages(prev => prev.map((p, j) => j === i ? { ...p, loading: true } : p));

        try {
          const res = await fetch('/api/import/octopus/page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId,
              name: page.name,
              description: page.description,
              seoTitle: page.seoTitle,
              seoDescription: page.seoDescription,
              sortOrder: page.sortOrder,
            }),
          });
          const data = await res.json();
          const success = data.done;

          setPendingPages(prev => prev.map((p, j) =>
            j === i ? { ...p, loading: false, done: true, error: !success } : p
          ));

          if (success) await reloadProject();
        } catch {
          setPendingPages(prev => prev.map((p, j) =>
            j === i ? { ...p, loading: false, done: true, error: true } : p
          ));
        }
      }
      setTimeout(() => setPendingPages([]), 3000);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const resolveComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments?id=${commentId}&action=resolve`, { method: 'PATCH' });
      if (res.ok) setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
    } catch {}
  };

  const handleToggleComments = () => {
    setCommentsOpen(!commentsOpen);
    if (!commentsOpen) selectSection(null); // deselect when opening comments
  };

  // Clicking a section exits comments mode
  useEffect(() => {
    if (selectedSectionId && commentsOpen) setCommentsOpen(false);
  }, [selectedSectionId, commentsOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target?.isContentEditable;

      // Esc exits comments mode
      if (e.key === 'Escape' && commentsOpen) {
        setCommentsOpen(false);
        return;
      }

      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey && !isEditing) { e.preventDefault(); undo(); }
      if (meta && e.key === 'z' && e.shiftKey && !isEditing) { e.preventDefault(); redo(); }
      if (meta && e.key === 'd' && !isEditing) { e.preventDefault(); if (selectedSectionId) duplicateSection(selectedSectionId); }
      if (meta && e.key === 'c' && !isEditing) { if (selectedSectionId) copySection(selectedSectionId); }
      if (meta && e.key === 'v' && !isEditing) { pasteSection(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditing) {
        if (selectedSectionId) { e.preventDefault(); removeSection(selectedSectionId); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedSectionId, commentsOpen, undo, redo, duplicateSection, copySection, pasteSection, removeSection]);

  const unresolvedCount = comments.filter(c => !c.parent_id && !c.resolved).length;

  return (
    <div className="h-screen flex flex-col bg-[#f2f2f2]">
      <a href="#canvas" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#1c1c1c] focus:shadow-lg focus:rounded-[12px]">
        Skip to canvas
      </a>

      <Toolbar
        commentsOpen={commentsOpen}
        onToggleComments={handleToggleComments}
        commentCount={unresolvedCount}
        pendingPages={pendingPages}
      />

      <div className="flex flex-1 overflow-hidden">
        <SectionCatalog />
        <Canvas liveMessage={liveMessage} setLiveMessage={setLiveMessage} isImporting={pendingPages.length > 0 && !pendingPages[0].done} />

        {/* Right sidebar: Comments or ContentEditor */}
        {commentsOpen ? (
          <CommentsSidebar comments={comments} onResolve={resolveComment} />
        ) : (
          <ContentEditor />
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveMessage}</div>
    </div>
  );
}
