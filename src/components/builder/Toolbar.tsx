'use client';
import { useRef, useState, useEffect, useCallback, forwardRef } from 'react';
import { useBuilderStore, ViewportSize } from '@/lib/store';
import { exportPageToHTML } from '@/lib/export-html';
import {
  ArrowLeft,
  ChevronDown,
  Undo2,
  Redo2,
  MessageSquare,
  Share2,
  Upload,
  Download,
  FileJson,
  FileCode,
  X,
  Link2,
  Check,
} from 'lucide-react';

/* ── Pill button helper ── */
const Pill = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }>(
  ({ children, className = '', ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={`bg-[#f5f4f2] flex items-center justify-center gap-[10px] px-[10px] py-[8px] rounded-[12px] text-[14px] font-medium leading-[14px] tracking-[-0.28px] text-[#1c1c1c] whitespace-nowrap transition-colors hover:bg-[#edece9] ${className}`}
    >
      {children}
    </button>
  )
);
Pill.displayName = 'Pill';

function Divider() {
  return <div className="bg-[#f5f4f2] h-[16px] w-px flex-shrink-0" aria-hidden="true" />;
}

/* ── Share logic (preserved) ── */
function useShare() {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const activeProjectId = useBuilderStore((s) => s.activeProjectId);
  const exportProjectJSON = useBuilderStore((s) => s.exportProjectJSON);

  const handleShare = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeProjectId);
      let shareUrl: string;
      if (isUUID) {
        shareUrl = `${window.location.origin}/preview?project=${activeProjectId}`;
      } else {
        const json = exportProjectJSON();
        const pako = await import('pako');
        const compressed = pako.deflate(json);
        let binary = '';
        const bytes = new Uint8Array(compressed);
        for (let i = 0; i < bytes.length; i += 8192) {
          binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 8192)));
        }
        const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        shareUrl = `${window.location.origin}/preview?d=${base64}`;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const json = exportProjectJSON();
      const pako = await import('pako');
      const compressed = pako.deflate(json);
      let binary = '';
      const bytes = new Uint8Array(compressed);
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 8192)));
      }
      const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      prompt('Copy this share link:', `${window.location.origin}/preview?d=${base64}`);
    } finally {
      setGenerating(false);
    }
  };
  return { copied, handleShare };
}

/* ── Circular progress indicator ── */
function CircularProgress({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="animate-spin flex-shrink-0">
      <circle cx="8" cy="8" r="6" fill="none" stroke="#e6e6e6" strokeWidth="2" />
      <circle cx="8" cy="8" r="6" fill="none" stroke="#1c1c1c" strokeWidth="2"
        strokeDasharray="37.7" strokeDashoffset="28" strokeLinecap="round" />
    </svg>
  );
}

/* ── Toolbar props ── */
interface PendingPageInfo {
  name: string;
  loading: boolean;
  done: boolean;
  error?: boolean;
}

interface ToolbarProps {
  commentsOpen?: boolean;
  onToggleComments?: () => void;
  commentCount?: number;
  pendingPages?: PendingPageInfo[];
  onOpenAiChat?: () => void;
}

export default function Toolbar({ commentsOpen, onToggleComments, commentCount = 0, pendingPages = [], onOpenAiChat }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const pageMenuRef = useRef<HTMLDivElement>(null);
  const pageButtonRef = useRef<HTMLButtonElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPageMenu, setShowPageMenu] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageName, setEditingPageName] = useState('');

  const sections = useBuilderStore((s) => {
    const proj = s.projects.find((p) => p.id === s.activeProjectId);
    const page = proj?.pages.find((pg) => pg.id === proj.activePageId);
    return page?.sections || [];
  });

  const projectName = useBuilderStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId)?.name || 'My Website'
  );
  const activeProjectId = useBuilderStore((s) => s.activeProjectId);
  const activeProject = useBuilderStore((s) => s.projects.find((p) => p.id === s.activeProjectId));
  const pages = activeProject?.pages || [];
  const activePage = pages.find((p) => p.id === activeProject?.activePageId);

  const viewport = useBuilderStore((s) => s.viewport);
  const setViewport = useBuilderStore((s) => s.setViewport);
  const renameProject = useBuilderStore((s) => s.renameProject);
  const switchPage = useBuilderStore((s) => s.switchPage);
  const addPage = useBuilderStore((s) => s.addPage);
  const deletePage = useBuilderStore((s) => s.deletePage);
  const renamePage = useBuilderStore((s) => s.renamePage);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const exportProjectJSON = useBuilderStore((s) => s.exportProjectJSON);
  const importProjectJSON = useBuilderStore((s) => s.importProjectJSON);

  const { copied, handleShare } = useShare();

  // Close dropdowns on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showExportMenu) { setShowExportMenu(false); exportButtonRef.current?.focus(); }
      if (showPageMenu) { setShowPageMenu(false); pageButtonRef.current?.focus(); }
    }
  }, [showExportMenu, showPageMenu]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (showExportMenu && exportMenuRef.current) {
      exportMenuRef.current.querySelector('button')?.focus();
    }
  }, [showExportMenu]);

  useEffect(() => {
    if (showPageMenu && pageMenuRef.current) {
      (pageMenuRef.current.querySelector('[role="menuitem"]') as HTMLElement)?.focus();
    }
  }, [showPageMenu]);

  const handleExportHTML = () => {
    if (sections.length === 0) return;
    const html = exportPageToHTML(projectName, sections);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.html`; a.click();
    URL.revokeObjectURL(url); setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const json = exportProjectJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.json`; a.click();
    URL.revokeObjectURL(url); setShowExportMenu(false);
  };

  const handleExportFigma = async () => {
    const json = exportProjectJSON();
    try {
      const pako = await import('pako');
      const compressed = pako.deflate(json);
      let binary = '';
      const bytes = new Uint8Array(compressed);
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 8192)));
      }
      const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const shareUrl = `${window.location.origin}/api/share?d=${base64}`;
      try { await navigator.clipboard.writeText(shareUrl); alert('Figma share URL copied!\n\nPaste it in the Structr Figma plugin.'); }
      catch { prompt('Copy this URL:', shareUrl); }
    } catch {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-figma.json`; a.click();
      URL.revokeObjectURL(url);
    }
    setShowExportMenu(false);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const t = ev.target?.result; if (typeof t === 'string') { try { importProjectJSON(t); } catch {} } };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = exportMenuRef.current?.querySelectorAll('button:not([disabled])');
      if (!items) return;
      const arr = Array.from(items) as HTMLElement[];
      const idx = arr.indexOf(document.activeElement as HTMLElement);
      arr[e.key === 'ArrowDown' ? (idx + 1) % arr.length : (idx - 1 + arr.length) % arr.length]?.focus();
    }
  };

  const handlePageMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = pageMenuRef.current?.querySelectorAll('[role="menuitem"]');
      if (!items) return;
      const arr = Array.from(items) as HTMLElement[];
      const idx = arr.indexOf(document.activeElement as HTMLElement);
      arr[e.key === 'ArrowDown' ? (idx + 1) % arr.length : (idx - 1 + arr.length) % arr.length]?.focus();
    }
  };

  const viewportOptions: { value: ViewportSize; label: string; w: string }[] = [
    { value: 'desktop', label: 'Desktop', w: 'w-[60px]' },
    { value: 'tablet', label: 'Tablet', w: 'w-[56px]' },
    { value: 'mobile', label: 'Mobile', w: 'w-[56px]' },
  ];

  return (
    <div role="toolbar" aria-label="Builder toolbar" className="border-b border-[#e6e6e6] bg-white flex items-center justify-between p-[10px] flex-shrink-0">
      {/* ── Left group ── */}
      <div className="flex items-center gap-[10px] flex-shrink-0">
        {/* Back arrow */}
        <Pill aria-label="Back to dashboard" onClick={() => window.history.back()}>
          <ArrowLeft className="w-[16px] h-[16px]" />
        </Pill>

        <Divider />

        {/* Project name */}
        <div className="flex items-center justify-center p-[10px]">
          <span className="text-[14px] font-medium leading-[14px] tracking-[-0.28px] text-[#1c1c1c] whitespace-nowrap">
            {projectName}
          </span>
        </div>

        <Divider />

        {/* Page + Version pills */}
        <div className="flex items-center gap-[4px]">
          {/* Page selector pill */}
          <div className="relative">
            <Pill
              ref={pageButtonRef}
              onClick={() => setShowPageMenu(!showPageMenu)}
              aria-expanded={showPageMenu}
              aria-haspopup="true"
              aria-label={`Page: ${activePage?.name || 'Homepage'}`}
            >
              {activePage?.name || 'Homepage'}
              <ChevronDown className="w-[16px] h-[16px]" />
            </Pill>

            {showPageMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => { setShowPageMenu(false); pageButtonRef.current?.focus(); }} />
                <div
                  ref={pageMenuRef}
                  role="menu"
                  aria-label="Pages"
                  onKeyDown={handlePageMenuKeyDown}
                  className="absolute top-full left-0 mt-1 w-56 bg-white border border-[#e6e6e6] rounded-[12px] shadow-lg z-50 py-1"
                >
                  <div className="px-3 py-2 text-[11px] font-medium text-[#808080] uppercase tracking-wider">Pages</div>
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      role="menuitem"
                      tabIndex={0}
                      className={`flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer group ${
                        page.id === activeProject?.activePageId ? 'bg-[#f5f4f2] text-[#1c1c1c]' : 'text-[#1c1c1c] hover:bg-[#f5f5f5]'
                      }`}
                      onClick={() => { switchPage(page.id); setShowPageMenu(false); setEditingPageId(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchPage(page.id); setShowPageMenu(false); } }}
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingPageId(page.id); setEditingPageName(page.name); }}
                    >
                      {editingPageId === page.id ? (
                        <input type="text" value={editingPageName}
                          onChange={(e) => setEditingPageName(e.target.value)}
                          onBlur={() => { renamePage(page.id, editingPageName); setEditingPageId(null); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { renamePage(page.id, editingPageName); setEditingPageId(null); } if (e.key === 'Escape') setEditingPageId(null); }}
                          onClick={(e) => e.stopPropagation()} autoFocus
                          className="flex-1 text-[13px] text-[#1c1c1c] px-1 py-0 border border-[#1c1c1c] rounded outline-none bg-white"
                        />
                      ) : (
                        <span className="flex-1">{page.name}</span>
                      )}
                      {pages.length > 1 && editingPageId !== page.id && (
                        <button onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#e6e6e6] rounded">
                          <X className="w-3 h-3 text-[#808080]" />
                        </button>
                      )}
                    </div>
                  ))}
                  {/* Pending pages (importing in background) */}
                  {pendingPages.length > 0 && (
                    <div className="border-t border-[#e6e6e6] mt-1 pt-1">
                      <div className="px-3 py-1.5 text-[11px] font-medium text-[#808080] uppercase tracking-wider">Importing...</div>
                      {pendingPages.map((pp, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between px-3 py-2 text-[13px] ${
                            pp.done ? 'text-[#1c1c1c] cursor-pointer hover:bg-[#f5f5f5]' : 'text-[#808080] cursor-not-allowed opacity-60'
                          }`}
                          role="menuitem"
                          tabIndex={pp.done ? 0 : -1}
                          aria-disabled={!pp.done}
                        >
                          <span>{pp.name}</span>
                          {pp.loading && <CircularProgress />}
                          {pp.done && !pp.error && (
                            <span className="text-[10px] text-green-600">✓</span>
                          )}
                          {pp.error && (
                            <span className="text-[10px] text-red-500">✗</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-[#e6e6e6] mt-1 pt-1">
                    <button role="menuitem" onClick={() => { addPage('New Page'); setShowPageMenu(false); }}
                      className="w-full text-left px-3 py-2 text-[13px] text-[#808080] hover:bg-[#f5f5f5] hover:text-[#1c1c1c]">
                      + Add page
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Version pill */}
          <Pill>
            v1
            <ChevronDown className="w-[16px] h-[16px]" />
          </Pill>
        </div>
      </div>

      {/* ── Right group ── */}
      <div className="flex items-center gap-[10px] flex-shrink-0">
        {/* Viewport toggle */}
        <div role="radiogroup" aria-label="Viewport size" className="bg-[#f5f5f5] flex items-center rounded-[8px] p-[2px]">
          {viewportOptions.map(({ value, label, w }) => (
            <button key={value} role="radio" aria-checked={viewport === value} onClick={() => setViewport(value)}
              className={`${w} flex items-center justify-center rounded-[6px] text-[11px] whitespace-nowrap transition-colors ${
                viewport === value
                  ? 'bg-white h-[28px] font-medium text-[#1c1c1c]'
                  : 'h-[24px] font-normal text-[#808080]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Divider />

        {/* Undo / Redo */}
        <div className="flex items-center gap-[4px]">
          <Pill onClick={undo} aria-label="Undo" className="opacity-50">
            <Undo2 className="w-[16px] h-[16px]" />
          </Pill>
          <Pill onClick={redo} aria-label="Redo">
            <Redo2 className="w-[16px] h-[16px]" />
          </Pill>
        </div>

        <Divider />

        {/* Comments / Share / Export */}
        <div className="flex items-center gap-[4px]">
          {/* Comments */}
          <Pill onClick={onToggleComments} aria-label="Toggle comments" className="relative">
            {commentCount > 0 && <span>{commentCount} new</span>}
            <MessageSquare className="w-[16px] h-[16px]" />
            {commentCount > 0 && (
              <div className="absolute right-[8px] top-[7px] w-[8px] h-[8px] bg-blue-500 rounded-full" />
            )}
          </Pill>

          {/* Share */}
          <Pill onClick={handleShare} aria-label={copied ? 'Link copied!' : 'Share'}>
            {copied ? 'Copied!' : 'Share'}
            {copied ? <Check className="w-[16px] h-[16px]" /> : <Share2 className="w-[16px] h-[16px]" />}
          </Pill>

          {/* Export */}
          <div className="relative">
            <Pill ref={exportButtonRef} onClick={() => setShowExportMenu(!showExportMenu)}
              aria-expanded={showExportMenu} aria-haspopup="true" aria-label="Export options">
              Export
              <Upload className="w-[16px] h-[16px]" />
            </Pill>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => { setShowExportMenu(false); exportButtonRef.current?.focus(); }} />
                <div ref={exportMenuRef} role="menu" aria-label="Export options" onKeyDown={handleExportMenuKeyDown}
                  className="absolute top-full right-0 mt-1 w-48 bg-white border border-[#e6e6e6] rounded-[12px] shadow-lg z-50 py-1">
                  <button role="menuitem" onClick={handleExportHTML} disabled={sections.length === 0}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#1c1c1c] hover:bg-[#f5f5f5] disabled:opacity-40">
                    <FileCode className="w-4 h-4 text-[#808080]" /> Export HTML
                  </button>
                  <button role="menuitem" onClick={handleExportJSON}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#1c1c1c] hover:bg-[#f5f5f5]">
                    <FileJson className="w-4 h-4 text-[#808080]" /> Export JSON
                  </button>
                  <div className="border-t border-[#e6e6e6] mt-1 pt-1">
                    <div className="px-3 py-1.5 text-[11px] font-medium text-[#808080] uppercase tracking-wider">Figma</div>
                    <button role="menuitem" onClick={handleExportFigma} disabled={sections.length === 0}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#1c1c1c] hover:bg-[#f5f5f5] disabled:opacity-40">
                      <Share2 className="w-4 h-4 text-[#808080]" /> Figma Link
                    </button>
                    <button role="menuitem" onClick={() => {
                      const j = exportProjectJSON();
                      const blob = new Blob([j], { type: 'application/json' });
                      const u = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = u; a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-figma.json`; a.click();
                      URL.revokeObjectURL(u); setShowExportMenu(false);
                    }} disabled={sections.length === 0}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#1c1c1c] hover:bg-[#f5f5f5] disabled:opacity-40">
                      <FileJson className="w-4 h-4 text-[#808080]" /> Figma JSON
                    </button>
                  </div>
                  <div className="border-t border-[#e6e6e6] mt-1 pt-1">
                    <button role="menuitem" onClick={() => { fileInputRef.current?.click(); setShowExportMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#1c1c1c] hover:bg-[#f5f5f5]">
                      <Download className="w-4 h-4 text-[#808080]" /> Import JSON
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* AI button */}
          <button
            onClick={onOpenAiChat}
            aria-label="Edit with AI"
            className="w-[36px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-[#f5f5f5] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1zM3 11l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" stroke="#1c1c1c" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" tabIndex={-1} />
      </div>
    </div>
  );
}
