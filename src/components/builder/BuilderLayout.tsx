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
      />

      <div className="flex flex-1 overflow-hidden">
        <SectionCatalog />
        <Canvas liveMessage={liveMessage} setLiveMessage={setLiveMessage} />

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
