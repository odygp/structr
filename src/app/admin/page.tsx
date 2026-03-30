'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Check, X, Eye, EyeOff, ExternalLink, Clock, CheckCircle, XCircle, Hammer, Inbox, Copy, Sparkles } from 'lucide-react';
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
  group_id: string | null;
  duplicate_count: number;
  novelty_score: number | null;
  agent_notes: string | null;
}

const STATUS_TABS = [
  { value: 'inbox', label: 'Inbox', icon: Inbox },
  { value: 'pending', label: 'Review Queue', icon: Clock },
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
  const [section, setSection] = useState<'requests' | 'usage' | 'prompt' | 'competition'>('requests');
  const [requests, setRequests] = useState<ComponentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptSaving, setPromptSaving] = useState(false);
  const [promptSaved, setPromptSaved] = useState(false);
  const [promptUpdatedAt, setPromptUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    if (section === 'requests') loadRequests(activeTab);
    if (section === 'usage') loadUsage();
    if (section === 'prompt') loadPrompt();
  }, [user, authLoading, activeTab, section]);

  const loadPrompt = async () => {
    setPromptLoading(true);
    try {
      const res = await fetch('/api/admin/settings?key=system_prompt');
      if (res.ok) {
        const data = await res.json();
        setPromptText(data.value);
        setPromptUpdatedAt(data.updated_at);
      }
    } catch {}
    setPromptLoading(false);
  };

  const savePrompt = async () => {
    setPromptSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'system_prompt', value: promptText }),
      });
      if (res.ok) {
        setPromptSaved(true);
        setPromptUpdatedAt(new Date().toISOString());
        setTimeout(() => setPromptSaved(false), 2000);
      }
    } catch {}
    setPromptSaving(false);
  };

  const downloadPrompt = () => {
    const blob = new Blob([promptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `structr-system-prompt-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const generateBuildPrompt = (req: ComponentRequest) => {
    const variantId = `${req.suggested_category}-${req.suggested_variant_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;

    const prompt = `## Build a new Structr section: ${req.suggested_category} / ${req.suggested_variant_name}

### What to build
- **Category:** ${req.suggested_category}
- **Variant ID:** ${variantId}
- **Variant Name:** ${req.suggested_variant_name}
- **Description:** ${req.description}
${req.source_url ? `- **Source URL:** ${req.source_url} (visit this page and analyze the section's HTML structure)` : ''}
${req.source_page_name ? `- **Source Page:** ${req.source_page_name}` : ''}

### Instructions

1. ${req.source_url ? `**Visit the source URL** and analyze the actual HTML/CSS of this section pattern. Understand the layout grid, content hierarchy, and responsive behavior.` : 'Use the description and preview HTML below as reference.'}

2. **Read an existing component** as a pattern reference:
   - Read \`src/components/sections/hero/HeroCentered.tsx\` for the standard component structure
   - Read \`src/components/sections/features/FeaturesGrid.tsx\` for array content patterns
   - Read \`src/lib/registry.ts\` to understand the contentSchema format

3. **Create the component file:** \`src/components/sections/${req.suggested_category}/${req.suggested_variant_name.replace(/[^a-zA-Z0-9]+/g, '')}.tsx\`
   - Use \`'use client'\` directive
   - Import: \`getColors\` from \`@/lib/colors\`, \`getSpacingClasses\` from \`@/lib/spacing\`, \`EditableText\` from \`@/components/builder/EditableText\`
   - Props: \`{ content, colorMode, sectionId }\`
   - Use Tailwind CSS with \`@md:\` container query prefixes for responsive
   - Support light/dark color modes via \`getColors()\`
   - Wrap all text in \`<EditableText>\` for inline editing
   - Use gray placeholder rectangles for images (\`bg-[#e5e5e5] rounded-lg\`)

4. **Register the component:**
   - Add import + registry entry in \`src/components/sections/index.ts\`
   - Add variant definition in \`src/lib/registry.ts\` (contentSchema + defaultContent)
   - Add variant ID to \`VALID_VARIANTS\` in \`src/lib/ai/parse-response.ts\`
   - Add variant to the AI system prompt category list in \`src/lib/ai/system-prompt.ts\`

5. **Test:** Run the dev server and add the section from the catalog. Verify it renders, content is editable, and light/dark modes work.

${req.preview_html ? `### Reference preview HTML\n\`\`\`html\n${req.preview_html.slice(0, 2000)}\n\`\`\`` : ''}

After building, update the component request status to 'built' in the database:
\`\`\`sql
UPDATE structr_component_requests SET status = 'built', admin_notes = 'Built as ${variantId}', updated_at = now() WHERE id = '${req.id}';
\`\`\``;

    navigator.clipboard.writeText(prompt);
    setCopiedId(req.id);
    setTimeout(() => setCopiedId(null), 2000);
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
          <button
            onClick={() => setSection('prompt')}
            className={`px-[20px] py-[10px] rounded-[12px] text-[14px] font-medium transition-colors ${
              section === 'prompt' ? 'bg-[#34322d] text-white' : 'bg-[#efefef] text-[#34322d] hover:bg-[#e6e6e6]'
            }`}
          >
            System Prompt
          </button>
          <button
            onClick={() => setSection('competition')}
            className={`px-[20px] py-[10px] rounded-[12px] text-[14px] font-medium transition-colors ${
              section === 'competition' ? 'bg-[#34322d] text-white' : 'bg-[#efefef] text-[#34322d] hover:bg-[#e6e6e6]'
            }`}
          >
            Competition
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
        {/* System Prompt Editor */}
        {section === 'prompt' && (
          <div className="flex flex-col gap-[20px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[24px] font-medium tracking-[-0.48px] text-[#34322d]">System Prompt</h1>
                <p className="text-[13px] text-[#808080] mt-1">
                  Edit the AI system prompt used for all wireframe generation. Changes apply immediately.
                </p>
              </div>
              <div className="flex items-center gap-[8px]">
                <button
                  onClick={downloadPrompt}
                  disabled={!promptText}
                  className="px-[16px] py-[8px] text-[13px] font-medium text-[#34322d] bg-[#efefef] hover:bg-[#e6e6e6] rounded-[8px] transition-colors disabled:opacity-40"
                >
                  Download .txt
                </button>
                <button
                  onClick={savePrompt}
                  disabled={promptSaving || !promptText}
                  className="px-[16px] py-[8px] text-[13px] font-medium text-white bg-[#34322d] hover:bg-[#1c1c1c] rounded-[8px] transition-colors disabled:opacity-50"
                >
                  {promptSaving ? 'Saving...' : promptSaved ? 'Saved!' : 'Save changes'}
                </button>
              </div>
            </div>

            {promptLoading ? (
              <div className="bg-white border border-[#ebebeb] rounded-[12px] h-[600px] animate-pulse" />
            ) : (
              <>
                <textarea
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  className="w-full h-[600px] bg-white border border-[#ebebeb] rounded-[12px] p-[16px] text-[13px] font-mono text-[#34322d] leading-relaxed resize-y focus:outline-none focus:border-[#34322d]"
                  placeholder="System prompt will load here..."
                  spellCheck={false}
                />
                <div className="flex items-center justify-between text-[12px] text-[#808080]">
                  <div className="flex items-center gap-[16px]">
                    <span>{promptText.length.toLocaleString()} characters</span>
                    <span>~{Math.round(promptText.length / 4).toLocaleString()} tokens</span>
                  </div>
                  {promptUpdatedAt && (
                    <span>Last updated: {new Date(promptUpdatedAt).toLocaleString()}</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Competition Analysis */}
        {section === 'competition' && (
          <div className="flex flex-col gap-[24px]">
            <div>
              <h1 className="text-[24px] font-medium tracking-[-0.48px] text-[#34322d]">Competitive Analysis</h1>
              <p className="text-[13px] text-[#808080] mt-1">Honest feature-by-feature comparison. Last updated: March 2026.</p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-3 gap-[12px]">
              {[
                { name: 'Relume', focus: 'AI wireframes + component library', price: '$20-250/mo', threat: 'High', color: 'bg-red-50 text-red-700' },
                { name: 'Balsamiq', focus: 'Low-fi sketch wireframes', price: '$12-18/mo', threat: 'Low', color: 'bg-green-50 text-green-700' },
                { name: 'Whimsical', focus: 'Visual workspace (wireframes + flowcharts)', price: '$10-15/mo', threat: 'Medium', color: 'bg-yellow-50 text-yellow-700' },
              ].map(c => (
                <div key={c.name} className="bg-white border border-[#ebebeb] rounded-[16px] p-[20px]">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="text-[16px] font-medium text-[#34322d]">{c.name}</span>
                    <span className={`text-[11px] font-medium px-[8px] py-[2px] rounded-[6px] ${c.color}`}>{c.threat} threat</span>
                  </div>
                  <p className="text-[12px] text-[#34322d] opacity-50 mb-[4px]">{c.focus}</p>
                  <p className="text-[13px] font-medium text-[#34322d]">{c.price}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-[12px]">
              {[
                { name: 'Figma', focus: 'Full design tool + First Draft AI', price: '$0-15/editor/mo', threat: 'Medium', color: 'bg-yellow-50 text-yellow-700' },
                { name: 'Claritee', focus: 'AI wireframes + client approvals', price: '$10-32/mo', threat: 'Medium', color: 'bg-yellow-50 text-yellow-700' },
                { name: 'Octopus.do', focus: 'Sitemap planning', price: '$0-10/mo', threat: 'Low', color: 'bg-green-50 text-green-700' },
              ].map(c => (
                <div key={c.name} className="bg-white border border-[#ebebeb] rounded-[16px] p-[20px]">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="text-[16px] font-medium text-[#34322d]">{c.name}</span>
                    <span className={`text-[11px] font-medium px-[8px] py-[2px] rounded-[6px] ${c.color}`}>{c.threat} threat</span>
                  </div>
                  <p className="text-[12px] text-[#34322d] opacity-50 mb-[4px]">{c.focus}</p>
                  <p className="text-[13px] font-medium text-[#34322d]">{c.price}</p>
                </div>
              ))}
            </div>

            {/* Full comparison table */}
            <div className="bg-white border border-[#ebebeb] rounded-[16px] overflow-hidden">
              <div className="px-[20px] py-[14px] border-b border-[#ebebeb] bg-[#fafafa]">
                <span className="text-[14px] font-medium text-[#34322d]">Feature Comparison Matrix</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[#ebebeb]">
                      <th className="text-left px-[16px] py-[10px] text-[#808080] font-medium min-w-[200px]">Feature</th>
                      <th className="text-center px-[12px] py-[10px] text-[#34322d] font-semibold bg-[#f0fdf4] min-w-[90px]">Structr</th>
                      <th className="text-center px-[12px] py-[10px] text-[#808080] font-medium min-w-[90px]">Relume</th>
                      <th className="text-center px-[12px] py-[10px] text-[#808080] font-medium min-w-[90px]">Balsamiq</th>
                      <th className="text-center px-[12px] py-[10px] text-[#808080] font-medium min-w-[90px]">Whimsical</th>
                      <th className="text-center px-[12px] py-[10px] text-[#808080] font-medium min-w-[90px]">Figma</th>
                      <th className="text-center px-[12px] py-[10px] text-[#808080] font-medium min-w-[90px]">Claritee</th>
                      <th className="text-center px-[12px] py-[10px] text-[#808080] font-medium min-w-[90px]">Octopus.do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { category: 'AI Generation', features: [
                        ['AI full wireframe generation', 'Y', 'Y', 'Y', 'N', 'Y (First Draft)', 'Y', 'N'],
                        ['AI sitemap generation', 'Y', 'Y', 'N', 'N', 'N', 'Y', 'N'],
                        ['AI copy/content writing', 'Y', 'Y', 'N', 'N', 'N', 'N', 'N'],
                        ['AI section-level editing (chat)', 'Y', 'Y (Ask AI)', 'Y', 'N', 'N', 'Y', 'N'],
                        ['AI style guide generation', 'N', 'Y', 'N', 'N', 'N', 'N', 'N'],
                        ['Screenshot to wireframe', 'N', 'N', 'Y', 'N', 'N', 'N', 'N'],
                        ['Multi-language AI generation', 'N', 'Y (20+ langs)', 'N', 'N', 'N', 'N', 'N'],
                      ]},
                      { category: 'Building & Editing', features: [
                        ['Section-based building', 'Y (23 types)', 'Y (1500+ components)', 'N', 'N', 'N', 'Y', 'N'],
                        ['Manual drag-and-drop', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
                        ['Website URL import', 'Y', 'N', 'N', 'N', 'N', 'N', 'N'],
                        ['Guided setup wizard', 'Y', 'N', 'N', 'N', 'N', 'N', 'N'],
                        ['Octopus.do import', 'Y', 'N', 'N', 'N', 'N', 'N', 'N'],
                        ['Reusable linked sections', 'Y', 'N', 'Y (Symbols)', 'N', 'Y (Components)', 'N', 'Y (Symbols)'],
                        ['Client feedback auto-apply', 'Y', 'N', 'N', 'N', 'N', 'N', 'N'],
                        ['Inline content editing', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
                        ['Multi-page projects', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
                      ]},
                      { category: 'Export & Handoff', features: [
                        ['Figma export (structured)', 'Y (JSON)', 'Y (Plugin, detached)', 'N', 'N', 'Native', 'N', 'N'],
                        ['HTML export', 'Y', 'Y (React)', 'N', 'N', 'N', 'N', 'N'],
                        ['JSON export', 'Y', 'N', 'N', 'N', 'N', 'N', 'N'],
                        ['React/Tailwind export', 'N', 'Y (1400+ components)', 'N', 'N', 'N', 'N', 'N'],
                        ['Webflow export', 'N', 'Y', 'N', 'N', 'N', 'N', 'N'],
                        ['PNG/PDF export', 'N', 'N', 'Y', 'Y', 'Y', 'Y', 'Y'],
                        ['SVG export', 'N', 'N', 'N', 'Y', 'Y', 'N', 'N'],
                      ]},
                      { category: 'Collaboration & Sharing', features: [
                        ['Publish to shareable URL', 'Y', 'N', 'N', 'Y (link share)', 'N', 'N', 'N'],
                        ['Team collaboration', 'Y', 'Y (Pro $250/mo)', 'Y (unlimited users)', 'Y (per editor)', 'Y (per editor)', 'Y', 'Y'],
                        ['Client commenting on wireframe', 'Y', 'Y (free viewers)', 'Y', 'Y', 'Y', 'Y', 'N'],
                        ['Version history', 'Y', 'Y', 'Y', 'Y (7d-unlimited)', 'Y', 'N', 'N'],
                        ['Client approval workflow', 'N', 'N', 'N', 'N', 'N', 'Y (audit trail)', 'N'],
                      ]},
                      { category: 'Beyond Wireframing', features: [
                        ['Flowcharts / mind maps', 'N', 'N', 'N', 'Y', 'Y (FigJam)', 'N', 'N'],
                        ['High-fidelity design', 'N', 'N', 'N', 'N', 'Y', 'N', 'N'],
                        ['Interactive prototyping', 'N', 'N', 'Y (AI-powered)', 'N', 'Y (Figma Make)', 'N', 'N'],
                        ['Design system management', 'N', 'Y (style guide)', 'N', 'N', 'Y', 'N', 'N'],
                        ['Docs with embedded diagrams', 'N', 'N', 'N', 'Y', 'N', 'N', 'N'],
                        ['SEO sitemap XML generation', 'N', 'N', 'N', 'N', 'N', 'N', 'Y'],
                      ]},
                      { category: 'Pricing', features: [
                        ['Free tier', '50 stars', 'Homepage only', '14-day trial', '3 boards', '3 files', 'Limited AI', 'Y'],
                        ['Starting paid price', '$19/mo', '$20/mo', '$12/mo', '$10/mo/editor', '$12/mo/editor', '$10/mo', '$10/mo'],
                        ['Pricing model', 'Per account', 'Per project', 'Per project', 'Per editor', 'Per editor', 'Per account', 'Per seat'],
                      ]},
                    ].map(group => (
                      <>
                        <tr key={group.category} className="bg-[#fafafa]">
                          <td colSpan={8} className="px-[16px] py-[8px] text-[11px] font-semibold text-[#34322d] uppercase tracking-wider">{group.category}</td>
                        </tr>
                        {group.features.map(([feature, ...vals], i) => (
                          <tr key={`${group.category}-${i}`} className="border-b border-[#f5f5f5]">
                            <td className="px-[16px] py-[8px] text-[#34322d] font-medium">{feature}</td>
                            {vals.map((v, j) => (
                              <td key={j} className={`text-center px-[12px] py-[8px] ${j === 0 ? 'bg-[#f0fdf4]' : ''} ${
                                v === 'Y' ? 'text-green-600 font-medium' : v === 'N' ? 'text-[#d0d0d0]' : 'text-[#808080]'
                              }`}>
                                {v === 'Y' ? '✓' : v === 'N' ? '—' : v}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature gaps / opportunities */}
            <div className="grid grid-cols-2 gap-[12px]">
              <div className="bg-white border border-[#ebebeb] rounded-[16px] p-[20px]">
                <h3 className="text-[14px] font-medium text-[#34322d] mb-[12px]">Features they have, we don&apos;t</h3>
                <div className="flex flex-col gap-[8px] text-[12px]">
                  {[
                    { feature: 'React/Tailwind export', who: 'Relume', priority: 'High', note: 'Relume has 1,400+ React+Tailwind components. Developers can copy-paste.' },
                    { feature: 'Webflow export', who: 'Relume', priority: 'Medium', note: 'Direct paste into Webflow. Huge for agencies.' },
                    { feature: 'AI style guide generation', who: 'Relume', priority: 'Low', note: 'Generates colors, fonts, spacing from brand input. Nice but not core.' },
                    { feature: 'Multi-language AI generation', who: 'Relume', priority: 'Medium', note: '20+ languages for sitemap + copy. Useful for international teams.' },
                    { feature: 'Screenshot to wireframe', who: 'Balsamiq', priority: 'Medium', note: 'Drop in a screenshot, get wireframe elements. Useful for reverse-engineering.' },
                    { feature: 'Interactive prototyping', who: 'Balsamiq, Figma', priority: 'Low', note: 'Clickable prototypes. Out of scope for our positioning.' },
                    { feature: 'Flowcharts / mind maps', who: 'Whimsical, Figma', priority: 'Low', note: 'Different tool category. Not our lane.' },
                    { feature: 'Client approval audit trail', who: 'Claritee', priority: 'Medium', note: 'Timestamped sign-off. Prevents scope creep for agencies.' },
                    { feature: 'PNG/PDF export', who: 'All except Structr', priority: 'High', note: 'Basic export format we\'re missing. Clients often want a PDF.' },
                  ].map(item => (
                    <div key={item.feature} className="flex items-start gap-[8px] p-[8px] bg-[#fafafa] rounded-[8px]">
                      <span className={`shrink-0 text-[10px] font-medium px-[6px] py-[1px] rounded-[4px] ${
                        item.priority === 'High' ? 'bg-red-50 text-red-600' : item.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-500'
                      }`}>{item.priority}</span>
                      <div>
                        <span className="font-medium text-[#34322d]">{item.feature}</span>
                        <span className="text-[#808080]"> ({item.who})</span>
                        <p className="text-[#808080] mt-[2px]">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#ebebeb] rounded-[16px] p-[20px]">
                <h3 className="text-[14px] font-medium text-[#34322d] mb-[12px]">Our unique advantages</h3>
                <div className="flex flex-col gap-[8px] text-[12px]">
                  {[
                    { feature: 'Website URL import & analysis', note: 'No competitor can paste a URL and recreate the section structure. Relume has nothing like this.' },
                    { feature: 'Client feedback auto-apply', note: 'AI reads comments and applies changes in one click. Completely unique.' },
                    { feature: 'Reusable linked sections (synced)', note: 'Edit one instance, all linked sections update. Relume detaches components on Figma import.' },
                    { feature: 'Structured JSON export', note: 'Section types, content hierarchy, variant IDs. Not flat images or detached layers.' },
                    { feature: 'Guided setup wizard', note: 'Pick industry, choose pages, set tone. No other wireframe tool has this onboarding.' },
                    { feature: 'Octopus.do import', note: 'Niche but valuable. Users can plan in Octopus.do and finish in Structr.' },
                    { feature: 'Manual building is free', note: 'Most competitors require paid plans for core features. We only charge for AI.' },
                    { feature: 'Per-action pricing (stars)', note: 'Pay for what you use. No monthly seat tax. Unique model in this space.' },
                    { feature: 'Publish to public URL', note: 'One-click publish to /p/slug. Clients can view without accounts. Relume requires export first.' },
                  ].map(item => (
                    <div key={item.feature} className="flex items-start gap-[8px] p-[8px] bg-[#f0fdf4] rounded-[8px]">
                      <span className="shrink-0 text-green-600 mt-[2px]">✓</span>
                      <div>
                        <span className="font-medium text-[#34322d]">{item.feature}</span>
                        <p className="text-[#808080] mt-[2px]">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
            {activeTab === 'inbox' ? 'Inbox is empty. New requests from imports and the research agent will appear here.' :
             activeTab === 'pending' ? 'Review queue is empty. The daily curation agent will move items here from the inbox.' :
             `No ${activeTab} requests`}
          </div>
        ) : (
          <div className="flex flex-col gap-[16px]">
            {requests.map(req => (
              <div key={req.id} className="bg-white border border-[#ebebeb] rounded-[20px] overflow-hidden">
                {/* Header */}
                <div className="p-[24px]">
                  <div className="flex items-start justify-between mb-[12px]">
                    <div>
                      <div className="flex items-center gap-[8px] mb-[4px] flex-wrap">
                        <span className="bg-[#efefef] text-[#34322d] text-[12px] font-medium px-[8px] py-[2px] rounded-[6px]">
                          {req.suggested_category}
                        </span>
                        <h3 className="text-[16px] font-medium text-[#34322d]">{req.suggested_variant_name}</h3>
                        {req.novelty_score != null && (
                          <span className={`text-[11px] font-medium px-[6px] py-[1px] rounded-[4px] ${
                            req.novelty_score >= 4 ? 'bg-green-50 text-green-700' :
                            req.novelty_score >= 3 ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-600'
                          }`}>
                            Novelty: {req.novelty_score}/5
                          </span>
                        )}
                        {req.duplicate_count > 1 && (
                          <span className="text-[11px] font-medium px-[6px] py-[1px] rounded-[4px] bg-blue-50 text-blue-700">
                            Seen {req.duplicate_count}x
                          </span>
                        )}
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

                  {/* Agent assessment */}
                  {req.agent_notes && (
                    <div className="flex items-start gap-[8px] p-[10px] bg-[#f0f7ff] border border-[#d0e3ff] rounded-[8px] mb-[16px]">
                      <span className="text-[11px] font-semibold text-blue-600 shrink-0 mt-[1px]">AI</span>
                      <p className="text-[12px] text-[#34322d] opacity-70 leading-[1.4]">{req.agent_notes}</p>
                    </div>
                  )}

                  {/* Inbox status note */}
                  {req.status === 'inbox' && !req.agent_notes && (
                    <div className="text-[11px] text-[#808080] italic mb-[16px]">Waiting for daily curation agent</div>
                  )}

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

                  {/* Build prompt button for approved items */}
                  {activeTab === 'approved' && (
                    <div className="flex items-center gap-[8px] mb-[16px]">
                      <button
                        onClick={() => generateBuildPrompt(req)}
                        className="flex items-center gap-[6px] px-[16px] py-[8px] bg-[#34322d] text-white text-[13px] font-medium rounded-[8px] hover:bg-[#1c1c1c] transition-colors"
                      >
                        {copiedId === req.id ? <><Check size={14} /> Copied to clipboard</> : <><Sparkles size={14} /> Generate Build Prompt</>}
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, 'built')}
                        className="flex items-center gap-[6px] px-[16px] py-[8px] border border-[#ebebeb] text-[#34322d] text-[13px] font-medium rounded-[8px] hover:bg-[#f8f8f8] transition-colors"
                      >
                        <Hammer size={14} /> Mark as Built
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  {(activeTab === 'pending' || activeTab === 'inbox') && (
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
