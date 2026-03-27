'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, X, Loader2 } from 'lucide-react';

interface PendingPage {
  url: string;
  name: string;
  sortOrder: number;
}

export default function ImportWebsiteModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleImport = async () => {
    if (!url.trim() || importing) return;

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setImporting(true);
    setError('');
    setStatus('Discovering pages...');

    try {
      // Step 1: Import homepage + discover other pages
      setStatus('Analyzing homepage...');
      const res = await fetch('/api/import/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        throw new Error(res.ok ? 'Invalid server response' : `Server error (${res.status})`);
      }

      if (!res.ok) throw new Error(data.error || 'Import failed');

      const { projectId, pendingPages } = data as {
        projectId: string;
        pendingPages: PendingPage[];
      };

      // Store pending pages in sessionStorage for the builder to pick up
      if (pendingPages && pendingPages.length > 0) {
        sessionStorage.setItem(`structr-import-${projectId}`, JSON.stringify(pendingPages));
      }

      // Navigate to builder immediately with homepage loaded
      router.push(`/builder?project=${projectId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setImporting(false);
      setStatus('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-[#808080]" />
            <h2 className="text-[16px] font-semibold text-[#1c1c1c]">Import a website</h2>
          </div>
          <button onClick={onClose} className="text-[#808080] hover:text-[#1c1c1c]">
            <X size={18} />
          </button>
        </div>

        <p className="text-[13px] text-[#808080] mb-4">
          Enter a URL and we&apos;ll analyze the structure to create a wireframe. The homepage loads first, then other pages import in the background.
        </p>

        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleImport()}
          disabled={importing}
          className="w-full px-4 py-3 border border-[#e6e6e6] rounded-[12px] bg-white text-[13px] text-[#1c1c1c] placeholder:text-[#808080] focus:outline-none focus:border-[#1c1c1c] mb-3 disabled:opacity-50"
          autoFocus
        />

        {error && (
          <div className="text-[12px] text-red-500 mb-3">{error}</div>
        )}

        {status && !error && (
          <div className="flex items-center gap-2 text-[12px] text-[#808080] mb-3">
            <Loader2 size={12} className="animate-spin" />
            {status}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={importing}
            className="flex-1 py-2.5 text-[13px] font-medium text-[#1c1c1c] border border-[#e6e6e6] rounded-[12px] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!url.trim() || importing}
            className="flex-1 py-2.5 text-[13px] font-medium text-white bg-[#1c1c1c] rounded-[12px] hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
