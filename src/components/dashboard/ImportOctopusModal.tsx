'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, FileText, AlertCircle } from 'lucide-react';
import PageSelector, { type PageItem } from './PageSelector';

interface ParsedPage {
  name: string;
  level: number;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
}

export default function ImportOctopusModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedPages, setParsedPages] = useState<ParsedPage[]>([]);
  const [pageItems, setPageItems] = useState<PageItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();

  const acceptedTypes = '.csv,.xlsx,.xls,.xml,.txt';

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setError('');
    setParsing(true);
    setStatus('Parsing file...');

    const name = f.name.replace(/\.\w+$/, '').replace(/[-_]/g, ' ');
    setProjectName(name.charAt(0).toUpperCase() + name.slice(1));

    try {
      const formData = new FormData();
      formData.append('file', f);
      formData.append('projectName', name);
      formData.append('parseOnly', 'true');

      const res = await fetch('/api/import/octopus', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse file');

      const pages: ParsedPage[] = data.pages || [];
      setParsedPages(pages);
      setPageItems(pages.map(p => ({
        name: p.name,
        checked: true,
        description: p.description,
        level: p.level,
      })));
      setStatus(`Found ${pages.length} pages`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file');
      setParsedPages([]);
      setPageItems([]);
    } finally {
      setParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleImport = async () => {
    const selectedNames = pageItems.filter(p => p.checked).map(p => p.name);
    if (selectedNames.length === 0 || importing) return;

    setImporting(true);
    setStatus('Creating project...');

    try {
      const formData = new FormData();
      formData.append('file', file!);
      formData.append('projectName', projectName || 'Octopus Import');
      formData.append('selectedPages', JSON.stringify(selectedNames));

      const res = await fetch('/api/import/octopus', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setStatus('Redirecting...');
      router.push(`/builder?project=${data.projectId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
      setImporting(false);
    }
  };

  const togglePage = (index: number) => {
    setPageItems(prev => prev.map((p, i) => i === index ? { ...p, checked: !p.checked } : p));
  };

  const addCustomPage = (name: string) => {
    setPageItems(prev => [...prev, { name, checked: true, level: 0 }]);
    setParsedPages(prev => [...prev, { name, level: 0, sortOrder: prev.length }]);
  };

  const selectedCount = pageItems.filter(p => p.checked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] w-[520px] max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-[24px] pb-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[32px] h-[32px] bg-[#f5f4f2] rounded-[8px] flex items-center justify-center">
              <Upload size={16} className="text-[#1c1c1c]" />
            </div>
            <h2 className="text-[18px] font-medium tracking-[-0.36px] text-[#1c1c1c]">Import from Octopus.do</h2>
          </div>
          <button onClick={onClose} className="p-[8px] hover:bg-[#f5f5f5] rounded-[8px] transition-colors">
            <X size={16} className="text-[#808080]" />
          </button>
        </div>

        <div className="px-[24px] flex-1 overflow-y-auto">
          {/* File drop zone */}
          {!file && (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-[16px] p-[32px] text-center transition-colors cursor-pointer ${
                dragOver ? 'border-[#1c1c1c] bg-[#f5f4f2]' : 'border-[#e6e6e6] hover:border-[#808080]'
              }`}
              onClick={() => document.getElementById('octopus-file')?.click()}
            >
              <Upload size={24} className="mx-auto mb-[12px] text-[#808080]" />
              <p className="text-[14px] font-medium text-[#1c1c1c] mb-[4px]">
                Drop your Octopus.do export here
              </p>
              <p className="text-[12px] text-[#808080]">
                Supports CSV, Excel, XML, and TXT files
              </p>
              <input
                id="octopus-file"
                type="file"
                accept={acceptedTypes}
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {/* Parsing state */}
          {parsing && (
            <div className="flex items-center gap-[12px] py-[24px]">
              <Loader2 size={16} className="animate-spin text-[#808080]" />
              <span className="text-[14px] text-[#808080]">{status}</span>
            </div>
          )}

          {/* File selected + pages with checkboxes */}
          {file && !parsing && pageItems.length > 0 && (
            <>
              {/* File info */}
              <div className="flex items-center gap-[10px] bg-[#f5f4f2] rounded-[12px] p-[12px] mb-[16px]">
                <FileText size={16} className="text-[#808080]" />
                <span className="text-[13px] text-[#1c1c1c] flex-1">{file.name}</span>
                <button
                  onClick={() => { setFile(null); setParsedPages([]); setPageItems([]); setError(''); }}
                  className="text-[12px] text-[#808080] hover:text-[#1c1c1c]"
                >
                  Change
                </button>
              </div>

              {/* Project name */}
              <div className="mb-[16px]">
                <label className="text-[11px] text-[#808080] mb-[4px] block">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full h-[36px] bg-[#f5f5f5] rounded-[8px] px-[12px] text-[13px] text-[#1c1c1c] border-0 focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                />
              </div>

              {/* Page selector with checkboxes */}
              <div className="mb-[16px]">
                <label className="text-[11px] text-[#808080] mb-[8px] block">Select pages to import</label>
                <PageSelector
                  pages={pageItems}
                  onToggle={togglePage}
                  onAddCustom={addCustomPage}
                  showHierarchy
                  maxHeight="240px"
                />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-[8px] bg-red-50 text-red-600 rounded-[12px] p-[12px] mb-[16px]">
              <AlertCircle size={14} />
              <span className="text-[13px]">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-[24px] pt-[16px] flex gap-[8px]">
          <button
            onClick={onClose}
            className="flex-1 h-[40px] border border-[#e6e6e6] rounded-[12px] text-[14px] font-medium text-[#1c1c1c] hover:bg-[#f5f5f5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={selectedCount === 0 || importing}
            className="flex-1 h-[40px] bg-[#1c1c1c] text-white rounded-[12px] text-[14px] font-medium disabled:opacity-40 hover:bg-[#333] transition-colors flex items-center justify-center gap-[8px]"
          >
            {importing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {status}
              </>
            ) : (
              `Import ${selectedCount} Pages`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
