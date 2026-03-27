'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Check, X, Eye, EyeOff, ExternalLink, Clock, CheckCircle, XCircle, Hammer } from 'lucide-react';
import Image from 'next/image';

interface ComponentRequest {
  id: string;
  suggested_category: string;
  suggested_variant_name: string;
  description: string;
  source_url: string | null;
  source_page_name: string | null;
  extracted_content: Record<string, unknown>;
  preview_html: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_TABS = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'approved', label: 'Approved', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', icon: XCircle },
  { value: 'built', label: 'Built', icon: Hammer },
];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ComponentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading || !user) return;
    loadRequests(activeTab);
  }, [user, authLoading, activeTab]);

  const loadRequests = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/component-requests?status=${status}`);
      if (res.ok) setRequests(await res.json());
      else setRequests([]);
    } catch { setRequests([]); }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/component-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, admin_notes: notes[id] || null }),
      });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch {}
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center"><div className="animate-pulse text-[#34322d] opacity-50">Loading...</div></div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center"><p className="text-[#34322d]">Please log in</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Nav */}
      <nav className="flex items-center justify-between p-[16px] border-b border-[#efefef] bg-white">
        <div className="flex items-center gap-[10px]">
          <Image src="/structr-logo.svg" alt="Structr" width={20} height={20} />
          <span className="text-[18px] font-medium leading-[16px] tracking-[-0.36px] text-[#34322d]">Structr</span>
          <span className="text-[14px] text-[#34322d] opacity-40 ml-[8px]">Admin</span>
        </div>
        <a href="/dashboard" className="text-[13px] text-[#34322d] opacity-60 hover:opacity-100">← Dashboard</a>
      </nav>

      <main className="w-[960px] mx-auto pt-[48px] pb-[80px]">
        <h1 className="text-[24px] font-medium tracking-[-0.48px] text-[#34322d] mb-[32px]">Component Requests</h1>

        {/* Tabs */}
        <div className="flex gap-[4px] mb-[32px]">
          {STATUS_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-[6px] px-[16px] py-[10px] rounded-[12px] text-[14px] font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-[#34322d] text-white'
                    : 'bg-[#efefef] text-[#34322d] hover:bg-[#e6e6e6]'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-[16px]">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-[#ebebeb] rounded-[20px] p-[24px] animate-pulse">
                <div className="bg-[#efefef] h-[20px] w-[200px] rounded mb-[12px]" />
                <div className="bg-[#efefef] h-[14px] w-full rounded mb-[8px]" />
                <div className="bg-[#efefef] h-[14px] w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-[64px] text-[#34322d] opacity-40 text-[14px]">
            No {activeTab} requests
          </div>
        ) : (
          <div className="flex flex-col gap-[16px]">
            {requests.map(req => (
              <div key={req.id} className="bg-white border border-[#ebebeb] rounded-[20px] overflow-hidden">
                {/* Header */}
                <div className="p-[24px]">
                  <div className="flex items-start justify-between mb-[12px]">
                    <div>
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <span className="bg-[#efefef] text-[#34322d] text-[12px] font-medium px-[8px] py-[2px] rounded-[6px]">
                          {req.suggested_category}
                        </span>
                        <h3 className="text-[16px] font-medium text-[#34322d]">{req.suggested_variant_name}</h3>
                      </div>
                      {req.source_url && (
                        <a href={req.source_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-[4px] text-[12px] text-[#34322d] opacity-40 hover:opacity-70">
                          <ExternalLink size={10} />
                          {req.source_url.replace(/^https?:\/\//, '').slice(0, 50)}
                          {req.source_page_name && ` → ${req.source_page_name}`}
                        </a>
                      )}
                    </div>
                    <span className="text-[12px] text-[#34322d] opacity-40">
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-[14px] text-[#34322d] opacity-70 leading-[1.5] mb-[16px]">{req.description}</p>

                  {/* Extracted content preview */}
                  {req.extracted_content && Object.keys(req.extracted_content).length > 0 && (
                    <details className="mb-[16px]">
                      <summary className="text-[12px] font-medium text-[#34322d] opacity-50 cursor-pointer hover:opacity-70">
                        Extracted content
                      </summary>
                      <pre className="mt-[8px] bg-[#f8f8f8] rounded-[8px] p-[12px] text-[11px] text-[#34322d] overflow-x-auto max-h-[200px]">
                        {JSON.stringify(req.extracted_content, null, 2)}
                      </pre>
                    </details>
                  )}

                  {/* Preview toggle */}
                  {req.preview_html && (
                    <button
                      onClick={() => setPreviewId(previewId === req.id ? null : req.id)}
                      className="flex items-center gap-[6px] text-[13px] font-medium text-[#34322d] bg-[#efefef] px-[12px] py-[8px] rounded-[8px] hover:bg-[#e6e6e6] transition-colors mb-[16px]"
                    >
                      {previewId === req.id ? <EyeOff size={14} /> : <Eye size={14} />}
                      {previewId === req.id ? 'Hide Preview' : 'Show Live Preview'}
                    </button>
                  )}

                  {/* Action buttons */}
                  {activeTab === 'pending' && (
                    <div className="flex items-center gap-[8px]">
                      <input
                        type="text"
                        placeholder="Admin notes (optional)"
                        value={notes[req.id] || ''}
                        onChange={e => setNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                        className="flex-1 px-[12px] py-[8px] text-[13px] border border-[#ebebeb] rounded-[8px] bg-white text-[#34322d] placeholder:opacity-40 focus:outline-none focus:border-[#34322d]"
                      />
                      <button
                        onClick={() => updateStatus(req.id, 'approved')}
                        className="flex items-center gap-[6px] px-[16px] py-[8px] bg-[#34322d] text-white text-[13px] font-medium rounded-[8px] hover:bg-[#1c1c1c] transition-colors"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, 'rejected')}
                        className="flex items-center gap-[6px] px-[16px] py-[8px] border border-[#ebebeb] text-[#34322d] text-[13px] font-medium rounded-[8px] hover:bg-[#f8f8f8] transition-colors"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Live preview iframe */}
                {previewId === req.id && req.preview_html && (
                  <div className="border-t border-[#ebebeb]">
                    <div className="bg-[#f8f8f8] px-[16px] py-[8px] text-[11px] text-[#34322d] opacity-40 font-medium">
                      LIVE PREVIEW
                    </div>
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;color:#1c1c1c;background:#fff}</style></head><body>${req.preview_html}</body></html>`}
                      className="w-full border-0"
                      style={{ height: 400 }}
                      sandbox="allow-same-origin"
                      title={`Preview: ${req.suggested_variant_name}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
