'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useBuilderStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import Toolbar from './Toolbar';
import SectionCatalog from './SectionCatalog';
import Canvas from './Canvas';
import ContentEditor from './ContentEditor';
import DocumentSidebar from './DocumentSidebar';
import AiSectionChat from './AiSectionChat';
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
  const updateContent = useBuilderStore((s) => s.updateContent);

  const [liveMessage, setLiveMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#F2F2F2');
  const [pendingPages, setPendingPages] = useState<{ name: string; url: string; sortOrder: number; loading: boolean; done: boolean; error?: boolean }[]>([]);

  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  // Get selected section data for AI chat
  const activeProject = useBuilderStore((s) => s.projects.find(p => p.id === s.activeProjectId));
  const activePage = activeProject?.pages.find(p => p.id === activeProject.activePageId);
  const selectedSection = activePage?.sections.find(s => s.id === selectedSectionId);

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

  // Initial load
  useEffect(() => {
    if (!projectId) return;
    const existing = useBuilderStore.getState().projects.find(p => p.id === projectId);
    if (!existing || existing.pages.length === 0 || (existing.pages.length === 1 && existing.pages[0].sections.length === 0)) {
      reloadProject();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Poll server-side import queue
  useEffect(() => {
    if (!projectId) return;
    let active = true;
    let completedSoFar = 0;

    const poll = async () => {
      if (!active) return;
      try {
        const res = await fetch(`/api/import/queue?projectId=${projectId}`);
        if (!res.ok) return;
        const data = await res.json();
        const jobs = data.jobs || [];
        if (jobs.length === 0) return;

        const mapped = jobs.map((j: { page_name: string; sort_order: number; status: string }) => ({
          name: j.page_name, url: '', sortOrder: j.sort_order,
          loading: j.status === 'processing',
          done: j.status === 'completed' || j.status === 'failed' || j.status === 'skipped',
          error: j.status === 'failed' || j.status === 'skipped',
        }));
        setPendingPages(mapped);

        const newCompleted = data.summary.completed;
        if (newCompleted > completedSoFar) {
          completedSoFar = newCompleted;
          await reloadProject();
        }

        if (data.allDone) {
          setTimeout(() => { if (active) setPendingPages([]); }, 3000);
          return;
        }
        setTimeout(poll, 3000);
      } catch {
        setTimeout(poll, 5000);
      }
    };
    poll();
    return () => { active = false; };
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
    setAiChatOpen(false);
    if (!commentsOpen) selectSection(null);
  };

  const handleOpenAiChat = useCallback(() => {
    setAiChatOpen(true);
    setCommentsOpen(false);
  }, []);

  const handleCloseAiChat = useCallback(() => {
    setAiChatOpen(false);
    setAiGenerating(false);
  }, []);

  const handleAiApply = useCallback((updatedContent: Record<string, unknown>) => {
    if (!selectedSectionId) return;
    for (const [key, value] of Object.entries(updatedContent)) {
      updateContent(selectedSectionId, key, value as string | boolean | Array<Record<string, string>>);
    }
  }, [selectedSectionId, updateContent]);

  // Clicking a section exits comments mode
  useEffect(() => {
    if (selectedSectionId && commentsOpen) setCommentsOpen(false);
  }, [selectedSectionId, commentsOpen]);

  // Close AI chat when deselecting section
  useEffect(() => {
    if (!selectedSectionId && aiChatOpen) setAiChatOpen(false);
  }, [selectedSectionId, aiChatOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target?.isContentEditable;

      if (e.key === 'Escape') {
        if (aiChatOpen) { handleCloseAiChat(); return; }
        if (commentsOpen) { setCommentsOpen(false); return; }
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
  }, [selectedSectionId, commentsOpen, aiChatOpen, undo, redo, duplicateSection, copySection, pasteSection, removeSection, handleCloseAiChat]);

  const unresolvedCount = comments.filter(c => !c.parent_id && !c.resolved).length;

  // Get category label for selected section
  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  };

  // Determine right sidebar content
  const renderRightSidebar = () => {
    if (commentsOpen) {
      return <CommentsSidebar comments={comments} onResolve={resolveComment} />;
    }
    if (aiChatOpen && selectedSection) {
      return (
        <AiSectionChat
          sectionName={`${getCategoryLabel(selectedSection.category)} Section`}
          sectionId={selectedSection.id}
          category={selectedSection.category}
          variantId={selectedSection.variantId}
          content={selectedSection.content}
          projectId={projectId || undefined}
          onClose={handleCloseAiChat}
          onApply={handleAiApply}
          generating={aiGenerating}
          onSetGenerating={setAiGenerating}
        />
      );
    }
    if (selectedSectionId) {
      return <ContentEditor onEditWithAi={handleOpenAiChat} />;
    }
    return <DocumentSidebar backgroundColor={backgroundColor} onBackgroundColorChange={setBackgroundColor} />;
  };

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
        onOpenAiChat={handleOpenAiChat}
      />

      <div className="flex flex-1 overflow-hidden">
        <SectionCatalog />
        <Canvas
          liveMessage={liveMessage}
          setLiveMessage={setLiveMessage}
          isImporting={pendingPages.length > 0 && !pendingPages[0].done}
          backgroundColor={backgroundColor}
          onEditWithAi={handleOpenAiChat}
          aiGeneratingSectionId={aiGenerating ? selectedSectionId : null}
        />
        {renderRightSidebar()}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveMessage}</div>
    </div>
  );
}
