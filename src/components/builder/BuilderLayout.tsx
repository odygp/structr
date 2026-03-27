'use client';
import { useEffect, useState, Suspense } from 'react';
import { useBuilderStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import Toolbar from './Toolbar';
import SectionCatalog from './SectionCatalog';
import Canvas from './Canvas';
import ContentEditor from './ContentEditor';
import { CommentsPanel } from './CommentsOverlay';

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
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
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
  const activeProject = useBuilderStore(s => s.projects.find(p => p.id === s.activeProjectId));
  const pages = activeProject?.pages || [];
  const activePageIndex = pages.findIndex(p => p.id === activeProject?.activePageId);

  const [liveMessage, setLiveMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  // Load comments for this project
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/comments?project=${projectId}`)
      .then(r => r.ok ? r.json() : [])
      .then(setComments)
      .catch(() => {});

    // Poll every 30s for new comments
    const interval = setInterval(() => {
      fetch(`/api/comments?project=${projectId}`)
        .then(r => r.ok ? r.json() : [])
        .then(setComments)
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [projectId]);

  const resolveComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments?id=${commentId}&action=resolve`, { method: 'PATCH' });
      if (res.ok) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
      }
    } catch {}
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target?.isContentEditable;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey && !isEditing) { e.preventDefault(); undo(); }
      if (meta && e.key === 'z' && e.shiftKey && !isEditing) { e.preventDefault(); redo(); }
      if (meta && e.key === 'd' && !isEditing) { e.preventDefault(); if (selectedSectionId) duplicateSection(selectedSectionId); }
      if (meta && e.key === 'c' && !isEditing) { if (selectedSectionId) copySection(selectedSectionId); }
      if (meta && e.key === 'v' && !isEditing) { pasteSection(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditing) {
        if (selectedSectionId) {
          e.preventDefault(); removeSection(selectedSectionId);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedSectionId, undo, redo, duplicateSection, copySection, pasteSection, removeSection]);

  return (
    <div className="h-screen flex flex-col">
      {/* Skip to main content link */}
      <a
        href="#canvas"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:shadow-lg focus:rounded-lg"
      >
        Skip to canvas
      </a>

      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <SectionCatalog />
        <Canvas
          liveMessage={liveMessage}
          setLiveMessage={setLiveMessage}
          comments={comments}
          activePageIndex={activePageIndex >= 0 ? activePageIndex : 0}
        />
        <ContentEditor />
      </div>

      {/* Comments panel */}
      {comments.length > 0 && (
        <CommentsPanel comments={comments} onResolve={resolveComment} />
      )}

      {/* Live region for announcing dynamic changes */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </div>
    </div>
  );
}
