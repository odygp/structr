'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

type Tab = 'profile' | 'preferences' | 'usage';

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

interface UsageData {
  totalCalls: number;
  totalCost: number;
  daily: { date: string; cost: number }[];
  byEndpoint: { endpoint: string; calls: number; cost: number }[];
  byModel: { model: string; calls: number; cost: number }[];
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  // Preferences state
  const [preferences, setPreferences] = useState({
    defaultViewport: 'desktop',
    defaultAiMode: 'auto',
    defaultBackgroundColor: '#F2F2F2',
  });

  // Usage state
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [lifetimeUsed, setLifetimeUsed] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { window.location.href = '/login'; return; }
    setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
    setEmail(user.email || '');

    // Load preferences
    fetch('/api/preferences')
      .then(r => r.ok ? r.json() : {})
      .then(p => { if (Object.keys(p).length > 0) setPreferences(prev => ({ ...prev, ...p })); })
      .catch(() => {});
  }, [user, authLoading]);

  // Load usage data when tab switches
  useEffect(() => {
    if (activeTab !== 'usage') return;
    setUsageLoading(true);
    Promise.all([
      fetch('/api/credits').then(r => r.ok ? r.json() : null),
      fetch('/api/credits/usage').then(r => r.ok ? r.json() : null),
    ]).then(([credits, usage]) => {
      if (credits) {
        setCreditBalance(credits.balance);
        setLifetimeUsed(credits.lifetime_used);
        setTransactions(credits.transactions || []);
      }
      if (usage) setUsageData(usage);
    }).catch(() => {}).finally(() => setUsageLoading(false));
  }, [activeTab]);

  const savePreferences = async () => {
    setSaving(true);
    try {
      await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally { setSaving(false); }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="animate-pulse text-[#34322d] opacity-50">Loading...</div>
      </div>
    );
  }

  const maxDailyCost = usageData?.daily.length ? Math.max(...usageData.daily.map(d => d.cost)) : 0;

  const endpointLabels: Record<string, string> = {
    'ai/generate': 'Generate',
    'ai/edit-section': 'Edit Section',
    'import/website/page': 'Website Import',
    'import/octopus/page': 'Octopus Import',
    'ai/generate-from-wizard/page': 'Wizard',
    'import/process': 'Import Process',
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="border-b border-[#ebebeb] bg-white">
        <div className="w-[780px] mx-auto flex items-center gap-[16px] h-[54px]">
          <button onClick={() => router.push('/dashboard')} className="text-[#808080] hover:text-[#1c1c1c]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[18px] font-medium text-[#1c1c1c]">Settings</h1>
        </div>
      </div>

      <div className="w-[780px] mx-auto pt-[32px]">
        {/* Tabs */}
        <div className="flex items-center gap-[4px] border-b border-[#ebebeb] mb-[32px]">
          {(['profile', 'preferences', 'usage'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-[16px] py-[10px] text-[14px] font-medium transition-colors relative ${
                activeTab === tab ? 'text-[#1c1c1c]' : 'text-[#808080] hover:text-[#1c1c1c]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#1c1c1c] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-[24px] max-w-[400px]">
            <div>
              <label className="text-[13px] text-[#808080] block mb-[6px]">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full h-[40px] px-[12px] text-[14px] text-[#1c1c1c] border border-[#ebebeb] rounded-[8px] focus:outline-none focus:border-[#1c1c1c]"
              />
            </div>
            <div>
              <label className="text-[13px] text-[#808080] block mb-[6px]">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-[40px] px-[12px] text-[14px] text-[#808080] border border-[#ebebeb] rounded-[8px] bg-[#f5f5f5]"
              />
              <p className="text-[11px] text-[#808080] mt-[4px]">Email cannot be changed</p>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="flex flex-col gap-[24px] max-w-[400px]">
            <div>
              <label className="text-[13px] text-[#808080] block mb-[6px]">Default Viewport</label>
              <select
                value={preferences.defaultViewport}
                onChange={e => setPreferences(p => ({ ...p, defaultViewport: e.target.value }))}
                className="w-full h-[40px] px-[12px] text-[14px] text-[#1c1c1c] border border-[#ebebeb] rounded-[8px] focus:outline-none focus:border-[#1c1c1c] bg-white"
              >
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            <div>
              <label className="text-[13px] text-[#808080] block mb-[6px]">Default AI Mode</label>
              <select
                value={preferences.defaultAiMode}
                onChange={e => setPreferences(p => ({ ...p, defaultAiMode: e.target.value }))}
                className="w-full h-[40px] px-[12px] text-[14px] text-[#1c1c1c] border border-[#ebebeb] rounded-[8px] focus:outline-none focus:border-[#1c1c1c] bg-white"
              >
                <option value="auto">Auto Edit</option>
                <option value="plan">Plan (suggest first)</option>
              </select>
            </div>
            <div>
              <label className="text-[13px] text-[#808080] block mb-[6px]">Default Background Color</label>
              <input
                type="text"
                value={preferences.defaultBackgroundColor}
                onChange={e => setPreferences(p => ({ ...p, defaultBackgroundColor: e.target.value }))}
                className="w-full h-[40px] px-[12px] text-[14px] text-[#1c1c1c] border border-[#ebebeb] rounded-[8px] focus:outline-none focus:border-[#1c1c1c]"
              />
            </div>
            <button
              onClick={savePreferences}
              disabled={saving}
              className="w-[140px] h-[40px] bg-[#1c1c1c] text-white text-[14px] font-medium rounded-[8px] hover:bg-[#333] transition-colors flex items-center justify-center gap-[8px] disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? 'Saved!' : <><Save size={14} /> Save</>}
            </button>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="flex flex-col gap-[28px] max-w-[600px]">
            {usageLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-[#808080]" />
              </div>
            ) : (
              <>
                {/* Credit Balance Card */}
                <div className={`rounded-[12px] border p-[20px] ${
                  creditBalance > 1 ? 'border-green-200 bg-green-50' :
                  creditBalance > 0 ? 'border-amber-200 bg-amber-50' :
                  'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-[12px]">
                    <span className="text-[13px] text-[#808080] font-medium">Credit Balance</span>
                    <span className={`text-[24px] font-semibold ${
                      creditBalance > 1 ? 'text-green-700' :
                      creditBalance > 0 ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      ${creditBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#808080]">
                      Lifetime used: ${lifetimeUsed.toFixed(2)}
                    </span>
                    <button
                      disabled
                      className="text-[12px] font-medium text-[#808080] bg-white border border-[#ebebeb] px-[12px] py-[6px] rounded-[6px] opacity-60 cursor-not-allowed"
                    >
                      Get more credits (coming soon)
                    </button>
                  </div>
                </div>

                {/* Usage Chart - last 30 days */}
                {usageData && usageData.daily.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-medium text-[#1c1c1c] mb-[12px]">Daily AI Usage (last 30 days)</h3>
                    <div className="flex items-end gap-[2px] h-[80px] bg-[#f5f5f5] rounded-[8px] p-[8px]">
                      {usageData.daily.map(d => {
                        const height = maxDailyCost > 0 ? (d.cost / maxDailyCost) * 100 : 0;
                        return (
                          <div
                            key={d.date}
                            className="flex-1 bg-[#1c1c1c] rounded-t-[2px] min-w-[4px] transition-all hover:bg-[#444]"
                            style={{ height: `${Math.max(2, height)}%` }}
                            title={`${d.date}: $${d.cost.toFixed(4)}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-[4px]">
                      <span className="text-[10px] text-[#808080]">{usageData.daily[0]?.date}</span>
                      <span className="text-[10px] text-[#808080]">{usageData.daily[usageData.daily.length - 1]?.date}</span>
                    </div>
                  </div>
                )}

                {/* Usage Breakdown by Endpoint */}
                {usageData && usageData.byEndpoint.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-medium text-[#1c1c1c] mb-[12px]">Usage by Feature</h3>
                    <div className="flex flex-col gap-[8px]">
                      {usageData.byEndpoint.map(ep => {
                        const maxCost = Math.max(...usageData.byEndpoint.map(e => e.cost));
                        const pct = maxCost > 0 ? (ep.cost / maxCost) * 100 : 0;
                        return (
                          <div key={ep.endpoint}>
                            <div className="flex items-center justify-between mb-[4px]">
                              <span className="text-[13px] text-[#1c1c1c]">
                                {endpointLabels[ep.endpoint] || ep.endpoint}
                              </span>
                              <span className="text-[12px] text-[#808080]">
                                {ep.calls} calls / ${ep.cost.toFixed(4)}
                              </span>
                            </div>
                            <div className="h-[6px] bg-[#f0f0f0] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1c1c1c] rounded-full transition-all"
                                style={{ width: `${Math.max(2, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {usageData && (
                  <div className="flex gap-[16px]">
                    <div className="flex-1 bg-[#f5f5f5] rounded-[8px] p-[16px]">
                      <span className="text-[11px] text-[#808080] block mb-[4px]">Total Calls</span>
                      <span className="text-[20px] font-semibold text-[#1c1c1c]">{usageData.totalCalls}</span>
                    </div>
                    <div className="flex-1 bg-[#f5f5f5] rounded-[8px] p-[16px]">
                      <span className="text-[11px] text-[#808080] block mb-[4px]">Total Cost (30d)</span>
                      <span className="text-[20px] font-semibold text-[#1c1c1c]">${usageData.totalCost.toFixed(4)}</span>
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-medium text-[#1c1c1c] mb-[12px]">Recent Transactions</h3>
                    <div className="border border-[#ebebeb] rounded-[8px] overflow-hidden">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="bg-[#f5f5f5] text-[#808080] text-left">
                            <th className="px-[12px] py-[8px] font-medium">Type</th>
                            <th className="px-[12px] py-[8px] font-medium">Amount</th>
                            <th className="px-[12px] py-[8px] font-medium">Balance</th>
                            <th className="px-[12px] py-[8px] font-medium">Description</th>
                            <th className="px-[12px] py-[8px] font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.slice(0, 20).map(tx => (
                            <tr key={tx.id} className="border-t border-[#f0f0f0]">
                              <td className="px-[12px] py-[8px]">
                                <span className={`px-[6px] py-[2px] rounded text-[10px] font-medium ${
                                  tx.type === 'grant' ? 'bg-green-100 text-green-700' :
                                  tx.type === 'debit' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className={`px-[12px] py-[8px] font-medium ${
                                Number(tx.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {Number(tx.amount) >= 0 ? '+' : ''}${Math.abs(Number(tx.amount)).toFixed(4)}
                              </td>
                              <td className="px-[12px] py-[8px] text-[#808080]">${Number(tx.balance_after).toFixed(2)}</td>
                              <td className="px-[12px] py-[8px] text-[#808080] max-w-[200px] truncate">{tx.description}</td>
                              <td className="px-[12px] py-[8px] text-[#808080]">{new Date(tx.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* No usage yet */}
                {(!usageData || usageData.totalCalls === 0) && transactions.length <= 1 && (
                  <div className="text-center py-[24px]">
                    <p className="text-[14px] text-[#808080]">No AI usage yet</p>
                    <p className="text-[12px] text-[#a0a0a0] mt-[4px]">Start building with AI to see your usage here</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
