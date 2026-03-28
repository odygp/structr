'use client';

import { useState } from 'react';
import { Globe, Copy, Check, ExternalLink, RotateCcw, XCircle } from 'lucide-react';

interface PublishPopoverProps {
  projectId: string;
  currentSlug: string | null;
  isPublished: boolean;
  onPublished: (data: { slug: string; version_number: number; url: string }) => void;
  onUnpublished: () => void;
  onClose: () => void;
}

export default function PublishPopover({
  projectId,
  currentSlug,
  isPublished,
  onPublished,
  onUnpublished,
  onClose,
}: PublishPopoverProps) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const publishedUrl = currentSlug ? `${window.location.origin}/p/${currentSlug}` : '';

  async function handlePublish() {
    setPublishing(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error) || 'Failed to publish';
        setError(msg);
        return;
      }
      const data = await res.json();
      onPublished(data);
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to unpublish');
        return;
      }
      onUnpublished();
    } catch {
      setError('Failed to unpublish');
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-1 w-[300px] bg-white border border-[#e6e6e6] rounded-[12px] shadow-lg z-50 py-3 px-3">
        {isPublished ? (
          <>
            {/* Published state */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-[13px] font-medium text-[#1c1c1c]">Published</span>
            </div>

            {/* Published URL */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-[#f5f4f2] rounded-[8px] px-2.5 py-2 text-[12px] text-[#1c1c1c] truncate">
                /p/{currentSlug}
              </div>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-[#f5f5f5] rounded-[6px]"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#808080]" />}
              </button>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-[#f5f5f5] rounded-[6px]"
                title="Open published site"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#808080]" />
              </a>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#1c1c1c] hover:bg-[#f5f5f5] rounded-[8px] transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#808080]" />
                {publishing ? 'Re-publishing...' : 'Re-publish latest changes'}
              </button>
              <button
                onClick={handleUnpublish}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-[8px] transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Unpublish
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Not published yet */}
            <div className="text-center py-2">
              <Globe className="w-8 h-8 text-[#808080] mx-auto mb-2" />
              <p className="text-[13px] text-[#1c1c1c] font-medium mb-1">Publish your project</p>
              <p className="text-[12px] text-[#808080] mb-3">
                Make it available at a public URL. Edits won&apos;t affect the published version until you re-publish.
              </p>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full px-4 py-2.5 bg-[#1c1c1c] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#333] disabled:opacity-50"
              >
                {publishing ? 'Publishing...' : 'Publish now'}
              </button>
            </div>
          </>
        )}

        {error && <p className="text-[11px] text-red-500 mt-2 text-center">{error}</p>}
      </div>
    </>
  );
}
