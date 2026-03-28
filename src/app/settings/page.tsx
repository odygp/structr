'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

type Tab = 'profile' | 'preferences';

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
          {(['profile', 'preferences'] as Tab[]).map(tab => (
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
      </div>
    </div>
  );
}
