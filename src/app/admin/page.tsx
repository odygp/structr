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

interface UsageData {
  kpis: { totalCalls: number; totalCost: number; totalInputTokens: number; totalOutputTokens: number; todayCalls: number; todayCost: number; avgCostPerCall: number };
  byModel: { model: string; calls: number; cost: number; inputTokens: number; outputTokens: number }[];
  byEndpoint: { endpoint: string; calls: number; cost: number }[];
  topProjects: { projectId: string; projectName: string; userEmail: string; calls: number; cost: number; tokens: number }[];
  topUsers: { userId: string; calls: number; cost: number; tokens: number }[];
  recentCalls: { endpoint: string; model: string; inputTokens: number; outputTokens: number; cost: number; durationMs: number; createdAt: string }[];
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [section, setSection] = useState<'requests' | 'usage'>('requests');
  const [requests, setRequests] = useState<ComponentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    if (section === 'requests') loadRequests(activeTab);
    if (section === 'usage') loadUsage();
  }, [user, authLoading, activeTab, section]);

  const loadUsage = async () => {
    setUsageLoading(true);
    try {
      const res = await fetch('/api/admin/usage');
      if (res.ok) setUsageData(await res.json());
    } catch {}
    setUsageLoading(false);
  };

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
        {/* Section toggle */}
        <div className="flex items-center gap-[4px] mb-[32px]">
          <button
            onClick={() => setSection('requests')}
            className={`px-[20px] py-[10px] rounded-[12px] text-[14px] font-medium transition-colors ${
              section === 'requests' ? 'bg-[#34322d] text-white' : 'bg-[#efefef] text-[#34322d] hover:bg-[#e6e6e6]'
            }`}
          >
            Component Requests
          </button>
          <button
            onClick={() => setSection('usage')}
            className={`px-[20px] py-[10px] rounded-[12px] text-[14px] font-medium transition-colors ${
              section === 'usage' ? 'bg-[#34322d] text-white' : 'bg-[#efefef] text-[#34322d] hover:bg-[#e6e6e6]'
            }`}
          >
            AI Usage & Costs
          </button>
        </div>

        {/* Usage Dashboard */}
        {section === 'usage' && (
          <div className="flex flex-col gap-[24px]">
            <h1 className="text-[24px] font-medium tracking-[-0.48px] text-[#34322d]">AI Usage & Costs</h1>

            {usageLoading || !usageData ? (
              <div className="grid grid-cols-4 gap-[12px]">
                {[1,2,3,4].map(i => <div key={i} className="bg-white border border-[#ebebeb] rounded-[20px] p-[24px] h-[100px] animate-pulse" />)}
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-[12px]">
                  {[
                    { label: 'Total Calls', value: usageData.kpis.totalCalls, sub: `$${usageData.kpis.totalCost.toFixed(4)} total` },
                    { label: 'Today', value: usageData.kpis.todayCalls, sub: `$${usageData.kpis.todayCost.toFixed(4)} today` },
                    { label: 'Avg Cost/Call', value: `$${usageData.kpis.avgCostPerCall.toFixed(4)}`, sub: `${((usageData.kpis.totalInputTokens + usageData.kpis.totalOutputTokens) / 1000).toFixed(0)}K total tokens` },
                    { label: 'Input vs Output', value: `${((usageData.kpis.totalInputTokens / (usageData.kpis.totalInputTokens + usageData.kpis.totalOutputTokens || 1)) * 100).toFixed(0)}% / ${((usageData.kpis.totalOutputTokens / (usageData.kpis.totalInputTokens + usageData.kpis.totalOutputTokens || 1)) * 100).toFixed(0)}%`, sub: 'input / output ratio' },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-white border border-[#ebebeb] rounded-[20px] p-[20px]">
                      <p className="text-[12px] font-medium text-[#34322d] opacity-50 mb-[8px]">{kpi.label}</p>
                      <p className="text-[24px] font-medium text-[#34322d] tracking-[-0.48px]">{kpi.value}</p>
                      <p className="text-[11px] text-[#34322d] opacity-40 mt-[4px]">{kpi.sub}</p>
                    </div>
                  ))}
                </div>

                {/* By Model + By Endpoint */}
                <div className="grid grid-cols-2 gap-[12px]">
                  <div className="bg-white border border-[#ebebeb] rounded-[20px] p-[20px]">
                    <p className="text-[14px] font-medium text-[#34322d] mb-[12px]">By Model</p>
                    <div className="flex flex-col gap-[8px]">
                      {usageData.byModel.map(m => (
                        <div key={m.model} className="flex items-center justify-between text-[12px]">
                          <span className="text-[#34322d] font-medium truncate max-w-[200px]">{m.model.split('-').slice(0, 2).join('-')}</span>
                          <div className="flex items-center gap-[12px] text-[#34322d] opacity-60">
                            <span>{m.calls} calls</span>
                            <span className="font-medium text-[#34322d]">${m.cost.toFixed(4)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-[#ebebeb] rounded-[20px] p-[20px]">
                    <p className="text-[14px] font-medium text-[#34322d] mb-[12px]">By Endpoint</p>
                    <div className="flex flex-col gap-[8px]">
                      {usageData.byEndpoint.map(e => (
                        <div key={e.endpoint} className="flex items-center justify-between text-[12px]">
                          <span className="text-[#34322d] font-medium truncate max-w-[200px]">{e.endpoint.replace('/api/', '')}</span>
                          <div className="flex items-center gap-[12px] text-[#34322d] opacity-60">
                            <span>{e.calls} calls</span>
                            <span className="font-medium text-[#34322d]">${e.cost.toFixed(4)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Projects Table */}
                <div className="bg-white border border-[#ebebeb] rounded-[20px] p-[20px]">
                  <p className="text-[14px] font-medium text-[#34322d] mb-[12px]">Most Expensive Projects</p>
                  {usageData.topProjects.length === 0 ? (
                    <p className="text-[12px] text-[#34322d] opacity-40 text-center py-[16px]">No data yet</p>
                  ) : (
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-[#ebebeb]">
                          <th className="text-left py-[8px] font-medium text-[#34322d] opacity-50">Project</th>
                          <th className="text-left py-[8px] font-medium text-[#34322d] opacity-50">User</th>
                          <th className="text-right py-[8px] font-medium text-[#34322d] opacity-50">Calls</th>
                          <th className="text-right py-[8px] font-medium text-[#34322d] opacity-50">Tokens</th>
                          <th className="text-right py-[8px] font-medium text-[#34322d] opacity-50">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageData.topProjects.map(p => (
                          <tr key={p.projectId} className="border-b border-[#f5f5f5]">
                            <td className="py-[8px] text-[#34322d] font-medium">{p.projectName}</td>
                            <td className="py-[8px] text-[#34322d] opacity-60">{p.userEmail}</td>
                            <td className="py-[8px] text-[#34322d] opacity-60 text-right">{p.calls}</td>
                            <td className="py-[8px] text-[#34322d] opacity-60 text-right">{(p.tokens / 1000).toFixed(1)}K</td>
                            <td className="py-[8px] text-[#34322d] font-medium text-right">${p.cost.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Recent Calls Table */}
                <div className="bg-white border border-[#ebebeb] rounded-[20px] p-[20px]">
                  <p className="text-[14px] font-medium text-[#34322d] mb-[12px]">Recent API Calls</p>
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-[#ebebeb]">
                        <th className="text-left py-[8px] font-medium text-[#34322d] opacity-50">Time</th>
                        <th className="text-left py-[8px] font-medium text-[#34322d] opacity-50">Endpoint</th>
                        <th className="text-left py-[8px] font-medium text-[#34322d] opacity-50">Model</th>
                        <th className="text-right py-[8px] font-medium text-[#34322d] opacity-50">In / Out</th>
                        <th className="text-right py-[8px] font-medium text-[#34322d] opacity-50">Cost</th>
                        <th className="text-right py-[8px] font-medium text-[#34322d] opacity-50">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageData.recentCalls.map((c, i) => (
                        <tr key={i} className="border-b border-[#f5f5f5]">
                          <td className="py-[8px] text-[#34322d] opacity-60">{new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="py-[8px] text-[#34322d] font-medium">{c.endpoint.replace('/api/', '')}</td>
                          <td className="py-[8px] text-[#34322d] opacity-60">{c.model.split('-').slice(0, 2).join('-')}</td>
                          <td className="py-[8px] text-[#34322d] opacity-60 text-right">{c.inputTokens} / {c.outputTokens}</td>
                          <td className="py-[8px] text-[#34322d] font-medium text-right">${c.cost.toFixed(4)}</td>
                          <td className="py-[8px] text-[#34322d] opacity-60 text-right">{c.durationMs ? `${(c.durationMs / 1000).toFixed(1)}s` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Component Requests Section */}
        {section === 'requests' && (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}
