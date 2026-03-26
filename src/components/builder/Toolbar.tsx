'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBuilderStore, ViewportSize } from '@/lib/store';
import { exportPageToHTML } from '@/lib/export-html';
import {
  Undo2,
  Redo2,
  Share2,
  Upload,
  ChevronDown,
  Download,
  FileJson,
  FileCode,
  X,
} from 'lucide-react';

export default function Toolbar() {
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
  const activeProject = useBuilderStore((s) =>
    s.projects.find((p) => p.id === s.activeProjectId)
  );
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

  // Close dropdowns on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showExportMenu) {
        setShowExportMenu(false);
        exportButtonRef.current?.focus();
      }
      if (showPageMenu) {
        setShowPageMenu(false);
        pageButtonRef.current?.focus();
      }
    }
  }, [showExportMenu, showPageMenu]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus first menu item when dropdown opens
  useEffect(() => {
    if (showExportMenu && exportMenuRef.current) {
      const firstButton = exportMenuRef.current.querySelector('button');
      firstButton?.focus();
    }
  }, [showExportMenu]);

  useEffect(() => {
    if (showPageMenu && pageMenuRef.current) {
      const firstItem = pageMenuRef.current.querySelector('[role="menuitem"]');
      (firstItem as HTMLElement)?.focus();
    }
  }, [showPageMenu]);

  const handleExportHTML = () => {
    if (sections.length === 0) return;
    const html = exportPageToHTML(projectName, sections);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    exportButtonRef.current?.focus();
  };

  const handleExportJSON = () => {
    const json = exportProjectJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    exportButtonRef.current?.focus();
  };

  const handleExportFigma = async () => {
    const json = exportProjectJSON();
    try {
      // Compress and encode as URL
      const pako = await import('pako');
      const compressed = pako.deflate(json);
      // Convert to base64url
      const base64 = btoa(String.fromCharCode(...compressed))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const shareUrl = `${window.location.origin}/api/share?d=${base64}`;

      await navigator.clipboard.writeText(shareUrl);
      alert(`Share URL copied to clipboard!\n\nOpen the Structr plugin in Figma, paste this URL, and click Import.\n\nURL: ${shareUrl.substring(0, 80)}...`);
    } catch {
      // Fallback: copy raw JSON
      try {
        await navigator.clipboard.writeText(json);
        alert('JSON copied to clipboard!\n\nOpen the Structr plugin in Figma and paste the JSON to import.');
      } catch {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-figma.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
    setShowExportMenu(false);
    exportButtonRef.current?.focus();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        try { importProjectJSON(text); } catch { /* ignore */ }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Keyboard navigation within export menu
  const handleExportMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = exportMenuRef.current?.querySelectorAll('button:not([disabled])');
      if (!items) return;
      const arr = Array.from(items) as HTMLElement[];
      const idx = arr.indexOf(document.activeElement as HTMLElement);
      const next = e.key === 'ArrowDown' ? (idx + 1) % arr.length : (idx - 1 + arr.length) % arr.length;
      arr[next]?.focus();
    }
  };

  // Keyboard navigation within page menu
  const handlePageMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = pageMenuRef.current?.querySelectorAll('[role="menuitem"]');
      if (!items) return;
      const arr = Array.from(items) as HTMLElement[];
      const idx = arr.indexOf(document.activeElement as HTMLElement);
      const next = e.key === 'ArrowDown' ? (idx + 1) % arr.length : (idx - 1 + arr.length) % arr.length;
      arr[next]?.focus();
    }
  };

  const viewportOptions: { value: ViewportSize; label: string }[] = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'mobile', label: 'Mobile' },
  ];

  return (
    <div role="toolbar" aria-label="Builder toolbar" className="h-[56px] border-b border-gray-200 bg-white flex items-center px-[10px] flex-shrink-0">
      {/* Left group: Logo | Project | Page */}
      <div className="flex items-center h-8 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 h-8 px-[10px]">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-gray-900" aria-hidden="true" />
          <span className="font-semibold text-gray-900 text-[13px] leading-none">Structr</span>
        </div>

        <div className="h-4 w-px bg-gray-200 mx-[5px]" aria-hidden="true" />

        {/* Project name */}
        <input
          type="text"
          value={projectName}
          onChange={(e) => renameProject(activeProjectId, e.target.value)}
          aria-label="Project name"
          className="h-8 text-[13px] text-gray-700 placeholder-gray-500 bg-transparent rounded-md px-[10px] outline-none transition-all border border-transparent hover:border-gray-400 focus:border-gray-900 focus:text-gray-900 w-[100px]"
          placeholder="Project name"
        />

        <div className="h-4 w-px bg-gray-200 mx-[5px]" aria-hidden="true" />

        {/* Page selector */}
        <div className="relative flex items-center">
          {/* Editable page name */}
          <input
            type="text"
            value={activePage?.name || 'Home'}
            onChange={(e) => {
              if (activePage) renamePage(activePage.id, e.target.value);
            }}
            aria-label="Page name"
            className="h-8 text-[13px] font-medium text-gray-900 bg-transparent rounded-md pl-[10px] pr-1 outline-none transition-all border border-transparent hover:border-gray-400 focus:border-gray-900 w-[80px]"
          />
          <span className="text-[11px] text-gray-500 mr-1" aria-hidden="true">({sections.length})</span>
          {/* Dropdown trigger */}
          <button
            ref={pageButtonRef}
            onClick={() => setShowPageMenu(!showPageMenu)}
            aria-expanded={showPageMenu}
            aria-haspopup="true"
            aria-label={`Switch page. Current: ${activePage?.name || 'Home'}, ${sections.length} sections`}
            className="h-8 px-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>

          {showPageMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setShowPageMenu(false); pageButtonRef.current?.focus(); }} />
              <div
                ref={pageMenuRef}
                role="menu"
                aria-label="Pages"
                onKeyDown={handlePageMenuKeyDown}
                className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1"
              >
                <div className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider" aria-hidden="true">Pages</div>
                {pages.map((page) => (
                  <div
                    key={page.id}
                    role="menuitem"
                    tabIndex={0}
                    className={`flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer group ${
                      page.id === activeProject?.activePageId
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-current={page.id === activeProject?.activePageId ? 'page' : undefined}
                    onClick={() => { switchPage(page.id); setShowPageMenu(false); setEditingPageId(null); pageButtonRef.current?.focus(); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        switchPage(page.id); setShowPageMenu(false); setEditingPageId(null); pageButtonRef.current?.focus();
                      }
                    }}
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingPageId(page.id); setEditingPageName(page.name); }}
                  >
                    {editingPageId === page.id ? (
                      <input
                        type="text"
                        value={editingPageName}
                        onChange={(e) => setEditingPageName(e.target.value)}
                        onBlur={() => { renamePage(page.id, editingPageName); setEditingPageId(null); }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { renamePage(page.id, editingPageName); setEditingPageId(null); }
                          if (e.key === 'Escape') setEditingPageId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Rename page ${page.name}`}
                        autoFocus
                        className="flex-1 text-[13px] text-gray-900 px-1 py-0 border border-blue-400 rounded outline-none bg-white"
                      />
                    ) : (
                      <span className="flex-1">{page.name}</span>
                    )}
                    {pages.length > 1 && editingPageId !== page.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                        aria-label={`Delete page ${page.name}`}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded focus:opacity-100"
                      >
                        <X className="w-3 h-3 text-gray-500" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    role="menuitem"
                    onClick={() => { addPage('New Page'); setShowPageMenu(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                  >
                    + Add page
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right group */}
      <div className="flex items-center h-8 flex-shrink-0">
        {/* Viewport toggle */}
        <div role="radiogroup" aria-label="Viewport size" className="flex items-center h-8 bg-gray-100 rounded-lg p-[2px]">
          {viewportOptions.map(({ value, label }) => (
            <button
              key={value}
              role="radio"
              aria-checked={viewport === value}
              onClick={() => setViewport(value)}
              className={`h-[28px] px-3 text-[12px] font-medium rounded-md transition-colors ${
                viewport === value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200 mx-3" aria-hidden="true" />

        {/* Undo / Redo */}
        <div className="flex items-center">
          <button
            onClick={undo}
            aria-label="Undo (Ctrl+Z)"
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Undo2 className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={redo}
            aria-label="Redo (Ctrl+Shift+Z)"
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Redo2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="h-4 w-px bg-gray-200 mx-3" aria-hidden="true" />

        {/* Share / Import */}
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Import JSON project"
          className="flex items-center gap-1.5 h-8 px-[10px] text-[13px] text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          Share
          <Share2 className="w-4 h-4 text-gray-600" aria-hidden="true" />
        </button>

        {/* Export dropdown */}
        <div className="relative">
          <button
            ref={exportButtonRef}
            onClick={() => setShowExportMenu(!showExportMenu)}
            aria-expanded={showExportMenu}
            aria-haspopup="true"
            aria-label="Export options"
            className="flex items-center gap-1.5 h-8 px-[10px] text-[13px] text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            Export
            <Upload className="w-4 h-4 text-gray-600" aria-hidden="true" />
          </button>

          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setShowExportMenu(false); exportButtonRef.current?.focus(); }} />
              <div
                ref={exportMenuRef}
                role="menu"
                aria-label="Export options"
                onKeyDown={handleExportMenuKeyDown}
                className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1"
              >
                <button
                  role="menuitem"
                  onClick={handleExportHTML}
                  disabled={sections.length === 0}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  <FileCode className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  Export HTML
                </button>
                <button
                  role="menuitem"
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
                >
                  <FileJson className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  Export JSON
                </button>
                <button
                  role="menuitem"
                  onClick={handleExportFigma}
                  disabled={sections.length === 0}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Share2 className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  Export to Figma
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    role="menuitem"
                    onClick={() => { fileInputRef.current?.click(); setShowExportMenu(false); exportButtonRef.current?.focus(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 text-gray-600" aria-hidden="true" />
                    Import JSON
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          aria-label="Import JSON file"
          className="hidden"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
