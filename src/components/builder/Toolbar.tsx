'use client';
import { useRef, useState } from 'react';
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
  };

  const handleExportFigma = async () => {
    const json = exportProjectJSON();
    try {
      await navigator.clipboard.writeText(json);
      alert('JSON copied to clipboard!\n\nOpen the Structr plugin in Figma and paste the JSON to import your wireframe.');
    } catch {
      // Fallback: download as file
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-figma.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowExportMenu(false);
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

  const viewportOptions: { value: ViewportSize; label: string }[] = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'mobile', label: 'Mobile' },
  ];

  return (
    <div className="h-[56px] border-b border-gray-200 bg-white flex items-center px-[10px] flex-shrink-0">
      {/* ── Left group: Logo | Project | Page ── */}
      <div className="flex items-center h-8 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 h-8 px-[10px]">
          <div className="w-[14px] h-[14px] rounded-[3px] bg-gray-900" />
          <span className="font-semibold text-gray-900 text-[13px] leading-none">Structr</span>
        </div>

        <div className="h-4 w-px bg-gray-200 mx-[5px]" />

        {/* Project name — hover shows border, focus shows input border */}
        <input
          type="text"
          value={projectName}
          onChange={(e) => renameProject(activeProjectId, e.target.value)}
          className="h-8 text-[13px] text-gray-600 bg-transparent rounded-md px-[10px] outline-none transition-all border border-transparent hover:border-gray-300 focus:border-gray-900 focus:text-gray-900 w-[100px]"
          placeholder="Project name"
        />

        <div className="h-4 w-px bg-gray-200 mx-[5px]" />

        {/* Page selector */}
        <div className="relative">
          <button
            onClick={() => setShowPageMenu(!showPageMenu)}
            className="flex items-center gap-1 h-8 px-[10px] text-[13px] font-medium text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            {activePage?.name || 'Home'}
            <span className="text-[11px] text-gray-400 ml-1">({sections.length})</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showPageMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPageMenu(false)} />
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                <div className="px-3 py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Pages</div>
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className={`flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer group ${
                      page.id === activeProject?.activePageId
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => { switchPage(page.id); setShowPageMenu(false); setEditingPageId(null); }}
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
                        autoFocus
                        className="flex-1 text-[13px] px-1 py-0 border border-blue-400 rounded outline-none bg-white"
                      />
                    ) : (
                      <span className="flex-1">{page.name}</span>
                    )}
                    {pages.length > 1 && editingPageId !== page.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => { addPage('New Page'); setShowPageMenu(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  >
                    + Add page
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Right group ── */}
      <div className="flex items-center h-8 flex-shrink-0">
        {/* Viewport toggle */}
        <div className="flex items-center h-8 bg-gray-100 rounded-lg p-[2px]">
          {viewportOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setViewport(value)}
              className={`h-[28px] px-3 text-[12px] font-medium rounded-md transition-colors ${
                viewport === value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200 mx-3" />

        {/* Undo / Redo */}
        <div className="flex items-center">
          <button
            onClick={undo}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-gray-200 mx-3" />

        {/* Share */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 h-8 px-[10px] text-[13px] text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          title="Import JSON project"
        >
          Share
          <Share2 className="w-4 h-4 text-gray-400" />
        </button>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 h-8 px-[10px] text-[13px] text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            Export
            <Upload className="w-4 h-4 text-gray-400" />
          </button>

          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                <button
                  onClick={handleExportHTML}
                  disabled={sections.length === 0}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  <FileCode className="w-4 h-4 text-gray-400" />
                  Export HTML
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
                >
                  <FileJson className="w-4 h-4 text-gray-400" />
                  Export JSON
                </button>
                <button
                  onClick={handleExportFigma}
                  disabled={sections.length === 0}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Share2 className="w-4 h-4 text-gray-400" />
                  Export to Figma
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => { fileInputRef.current?.click(); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 text-gray-400" />
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
          className="hidden"
        />
      </div>
    </div>
  );
}
