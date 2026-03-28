'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, X, Loader2, ArrowLeft } from 'lucide-react';
import PageSelector, { type PageItem } from './PageSelector';

export default function ImportWebsiteModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [discovering, setDiscovering] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [pages, setPages] = useState<PageItem[]>([]);
  const [step, setStep] = useState<'url' | 'pages'>('url');
  const [normalizedUrl, setNormalizedUrl] = useState('');
  const router = useRouter();

  const handleDiscover = async () => {
    if (!url.trim() || discovering) return;

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;

    setDiscovering(true);
    setError('');
    setNormalizedUrl(cleanUrl);

    try {
      const res = await fetch('/api/import/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl, discoverOnly: true }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        throw new Error(res.ok ? 'Invalid server response' : `Server error (${res.status})`);
      }
      if (!res.ok) throw new Error(data.error || 'Discovery failed');

      const discovered = (data.pages || []).map((p: { name: string }) => ({
        name: p.name,
        checked: true,
      }));

      setPages(discovered);
      setStep('pages');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setDiscovering(false);
    }
  };

  const handleImport = async () => {
    const selectedNames = pages.filter(p => p.checked).map(p => p.name);
    if (selectedNames.length === 0) return;

    setImporting(true);
    setError('');

    try {
      const res = await fetch('/api/import/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, selectedPages: selectedNames }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      router.push(`/builder?project=${data.projectId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setImporting(false);
    }
  };

  const togglePage = (index: number) => {
    setPages(prev => prev.map((p, i) => i === index ? { ...p, checked: !p.checked } : p));
  };

  const addCustomPage = (name: string) => {
    setPages(prev => [...prev, { name, checked: true }]);
  };

  const selectedCount = pages.filter(p => p.checked).length;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[16px] w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {step === 'pages' && (
              <button onClick={() => setStep('url')} className="text-[#808080] hover:text-[#1c1c1c] mr-1">
                <ArrowLeft size={16} />
              </button>
            )}
            <Globe size={18} className="text-[#808080]" />
            <h2 className="text-[16px] font-semibold text-[#1c1c1c]">
              {step === 'url' ? 'Import a website' : 'Select pages to import'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#808080] hover:text-[#1c1c1c]">
            <X size={18} />
          </button>
        </div>

        {step === 'url' && (
          <>
            <p className="text-[13px] text-[#808080] mb-4">
              Enter a URL and we&apos;ll discover the pages. You can then choose which ones to import.
            </p>

            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDiscover()}
              disabled={discovering}
              className="w-full px-4 py-3 border border-[#e6e6e6] rounded-[12px] bg-white text-[13px] text-[#1c1c1c] placeholder:text-[#808080] focus:outline-none focus:border-[#1c1c1c] mb-3 disabled:opacity-50"
              autoFocus
            />

            {error && <div className="text-[12px] text-red-500 mb-3">{error}</div>}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={discovering}
                className="flex-1 py-2.5 text-[13px] font-medium text-[#1c1c1c] border border-[#e6e6e6] rounded-[12px] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscover}
                disabled={!url.trim() || discovering}
                className="flex-1 py-2.5 text-[13px] font-medium text-white bg-[#1c1c1c] rounded-[12px] hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {discovering ? (
                  <><Loader2 size={14} className="animate-spin" /> Discovering...</>
                ) : (
                  'Discover Pages'
                )}
              </button>
            </div>
          </>
        )}

        {step === 'pages' && (
          <>
            <p className="text-[13px] text-[#808080] mb-3">
              We found {pages.length} pages. Select the ones you want to import.
            </p>

            <PageSelector
              pages={pages}
              onToggle={togglePage}
              onAddCustom={addCustomPage}
              maxHeight="280px"
            />

            {error && <div className="text-[12px] text-red-500 mt-3">{error}</div>}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep('url')}
                disabled={importing}
                className="flex-1 py-2.5 text-[13px] font-medium text-[#1c1c1c] border border-[#e6e6e6] rounded-[12px] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={selectedCount === 0 || importing}
                className="flex-1 py-2.5 text-[13px] font-medium text-white bg-[#1c1c1c] rounded-[12px] hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {importing ? (
                  <><Loader2 size={14} className="animate-spin" /> Importing...</>
                ) : (
                  `Import ${selectedCount} Pages`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
