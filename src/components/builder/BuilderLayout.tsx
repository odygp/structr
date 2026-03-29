'use client';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useBuilderStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import Toolbar from './Toolbar';
import SectionCatalog from './SectionCatalog';
import Canvas from './Canvas';
import ContentEditor from './ContentEditor';
import DocumentSidebar from './DocumentSidebar';
import AiSectionChat, { type ChatMessage } from './AiSectionChat';
import ResizeHandle from './ResizeHandle';
import { CommentsSidebar } from './CommentsOverlay';
import ActivityPanel from './ActivityPanel';
import VersionHistory from './VersionHistory';

interface Comment {
  id: string;
  project_id: string;
  page_index: number;
  section_index: number;
  author_name: string;
  message: string;
  resolved: boolean;
  parent_id: string | null;
  user_id: string | null;
  created_at: string;
}

const MIN_SIDEBAR = 180;
const MAX_SIDEBAR = 400;
const DEFAULT_SIDEBAR = 240;

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
  const [activityOpen, setActivityOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<string>('draft');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#F2F2F2');
  const [pendingPages, setPendingPages] = useState<{ name: string; url: string; sortOrder: number; loading: boolean; done: boolean; error?: boolean }[]>([]);

  // Persistent chat history per section
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});

  // Resizable sidebars
  const [leftWidth, setLeftWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('structr-left-width');
      return saved ? parseInt(saved) : DEFAULT_SIDEBAR;
    }
    return DEFAULT_SIDEBAR;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('structr-right-width');
      return saved ? parseInt(saved) : DEFAULT_SIDEBAR;
    }
    return DEFAULT_SIDEBAR;
  });

  // Typewriter: track which section was just AI-edited
  const [aiChangedSectionId, setAiChangedSectionId] = useState<string | null>(null);
  const aiChangedTimeoutRef = useRef<NodeJS.Timeout>(null);

  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  // Load credit balance
  useEffect(() => {
    fetch('/api/credits')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCreditBalance(data.balance); })
      .catch(() => {});
  }, []);

  // Load background color from project settings
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}/settings`)
      .then(r => r.ok ? r.json() : {})
      .then((data: Record<string, string>) => { if (data.backgroundColor) setBackgroundColor(data.backgroundColor); })
      .catch(() => {});
  }, [projectId]);

  const handleBackgroundColorChange = useCallback((color: string) => {
    setBackgroundColor(color);
    if (projectId) {
      fetch(`/api/projects/${projectId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backgroundColor: color }),
      }).catch(() => {});
    }
  }, [projectId]);

  const activeProject = useBuilderStore((s) => s.projects.find(p => p.id === s.activeProjectId));
  const activePage = activeProject?.pages.find(p => p.id === activeProject.activePageId);
  const selectedSection = activePage?.sections.find(s => s.id === selectedSectionId);

  const setViewport = useBuilderStore((s) => s.setViewport);
  const currentViewport = useBuilderStore((s) => s.viewport);

  // Persist sidebar widths
  useEffect(() => { localStorage.setItem('structr-left-width', String(leftWidth)); }, [leftWidth]);
  useEffect(() => { localStorage.setItem('structr-right-width', String(rightWidth)); }, [rightWidth]);

  // Auto-switch viewport when sidebars resize makes canvas too narrow
  useEffect(() => {
    const canvasWidth = window.innerWidth - leftWidth - rightWidth - 8; // 8px for resize handles
    if (canvasWidth < 500 && currentViewport === 'desktop') {
      setViewport('mobile');
    } else if (canvasWidth < 850 && currentViewport === 'desktop') {
      setViewport('tablet');
    } else if (canvasWidth >= 850 && currentViewport !== 'desktop') {
      // Only auto-switch back if user didn't manually choose
    }
  }, [leftWidth, rightWidth, currentViewport, setViewport]);

  const handleLeftResize = useCallback((delta: number) => {
    setLeftWidth(w => Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, w + delta)));
  }, []);

  const handleRightResize = useCallback((delta: number) => {
    setRightWidth(w => Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, w + delta)));
  }, []);

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

  const loadRemoteProject = useBuilderStore((s) => s.loadRemoteProject);
  const reloadProject = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        loadRemoteProject(data);
        if (data.slug !== undefined) setProjectSlug(data.slug);
        if (data.status) setProjectStatus(data.status);
      }
    } catch {}
  };

  useEffect(() => {
    if (!projectId) return;
    const existing = useBuilderStore.getState().projects.find(p => p.id === projectId);
    if (!existing || existing.pages.length === 0 || (existing.pages.length === 1 && existing.pages[0].sections.length === 0)) {
      reloadProject();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Poll import queue
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
          done: ['completed', 'failed', 'skipped'].includes(j.status),
          error: j.status === 'failed' || j.status === 'skipped',
        }));
        setPendingPages(mapped);
        if (data.summary.completed > completedSoFar) { completedSoFar = data.summary.completed; await reloadProject(); }
        if (data.allDone) { setTimeout(() => { if (active) setPendingPages([]); }, 3000); return; }
        setTimeout(poll, 3000);
      } catch { setTimeout(poll, 5000); }
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

  const unresolveComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments?id=${commentId}&action=unresolve`, { method: 'PATCH' });
      if (res.ok) setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: false } : c));
    } catch {}
  };

  const handleToggleComments = () => {
    setCommentsOpen(!commentsOpen);
    setAiChatOpen(false);
    setActivityOpen(false);
    if (!commentsOpen) selectSection(null);
  };

  const handleToggleActivity = () => {
    setActivityOpen(!activityOpen);
    setCommentsOpen(false);
    setAiChatOpen(false);
    setVersionHistoryOpen(false);
    if (!activityOpen) selectSection(null);
  };

  const handleToggleVersionHistory = () => {
    setVersionHistoryOpen(!versionHistoryOpen);
    setCommentsOpen(false);
    setAiChatOpen(false);
    setActivityOpen(false);
    if (!versionHistoryOpen) selectSection(null);
  };

  // Refresh credits after AI actions
  const refreshCredits = useCallback(() => {
    fetch('/api/credits')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCreditBalance(data.balance); })
      .catch(() => {});
  }, []);

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
    // Trigger typewriter animation
    setAiChangedSectionId(selectedSectionId);
    if (aiChangedTimeoutRef.current) clearTimeout(aiChangedTimeoutRef.current);
    aiChangedTimeoutRef.current = setTimeout(() => setAiChangedSectionId(null), 2000);
    // Refresh credit balance after AI usage
    refreshCredits();
  }, [selectedSectionId, updateContent, refreshCredits]);

  const handleChatMessagesChange = useCallback((sectionId: string, messages: ChatMessage[]) => {
    setChatHistory(prev => ({ ...prev, [sectionId]: messages }));
  }, []);

  useEffect(() => {
    if (selectedSectionId && commentsOpen) setCommentsOpen(false);
  }, [selectedSectionId, commentsOpen]);

  useEffect(() => {
    if (!selectedSectionId && aiChatOpen) setAiChatOpen(false);
  }, [selectedSectionId, aiChatOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
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

  const getCategoryLabel = (category: string) => category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');

  const renderRightSidebar = () => {
    if (versionHistoryOpen && projectId) return <VersionHistory projectId={projectId} onRestore={() => { reloadProject(); setVersionHistoryOpen(false); }} />;
    if (activityOpen && projectId) return <ActivityPanel projectId={projectId} />;
    if (commentsOpen) return <CommentsSidebar comments={comments} onResolve={resolveComment} onUnresolve={unresolveComment} />;
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
          initialMessages={chatHistory[selectedSection.id] || []}
          onMessagesChange={(msgs) => handleChatMessagesChange(selectedSection.id, msgs)}
          width={rightWidth}
        />
      );
    }
    if (selectedSectionId) return <ContentEditor onEditWithAi={handleOpenAiChat} />;
    return <DocumentSidebar backgroundColor={backgroundColor} onBackgroundColorChange={handleBackgroundColorChange} />;
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
        onToggleActivity={handleToggleActivity}
        onToggleVersionHistory={handleToggleVersionHistory}
        projectSlug={projectSlug}
        projectStatus={projectStatus}
        creditBalance={creditBalance}
      />

      <div className="flex flex-1 overflow-hidden">
        <SectionCatalog width={leftWidth} />
        <ResizeHandle side="left" onResize={handleLeftResize} />

        <Canvas
          liveMessage={liveMessage}
          setLiveMessage={setLiveMessage}
          isImporting={pendingPages.length > 0 && !pendingPages[0].done}
          backgroundColor={backgroundColor}
          onEditWithAi={handleOpenAiChat}
          aiGeneratingSectionId={aiGenerating ? selectedSectionId : null}
          aiChangedSectionId={aiChangedSectionId}
        />

        <ResizeHandle side="right" onResize={handleRightResize} />
        {renderRightSidebar()}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveMessage}</div>
    </div>
  );
}
