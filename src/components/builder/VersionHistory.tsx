'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, Loader2 } from 'lucide-react';

interface Version {
  id: string;
  version_number: number;
  label: string;
  created_by: string | null;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function VersionHistory({ projectId, onRestore }: { projectId: string; onRestore?: () => void }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  const loadVersions = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
        setCurrentVersionId(data.current_version_id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVersions(); }, [projectId]);

  const handleSaveSnapshot = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await loadVersions();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      const res = await fetch(`/api/projects/${projectId}/versions/${versionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });
      if (res.ok) {
        setConfirmRestore(null);
        await loadVersions();
        onRestore?.();
      }
    } finally {
      setRestoring(null);
    }
  };

  return (
    <aside className="w-[240px] border-l border-[#e6e6e6] bg-white flex-shrink-0 flex flex-col h-full">
      <div className="p-[12px] flex-shrink-0 flex items-center justify-between">
        <span className="text-[14px] font-medium leading-[14px] tracking-[-0.28px] text-[#1c1c1c]">
          Version History
        </span>
        <button
          onClick={handleSaveSnapshot}
          disabled={saving}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#808080] hover:text-[#1c1c1c] hover:bg-[#f5f5f5] rounded-md transition-colors"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save
        </button>
      </div>
      <div className="bg-[#e6e6e6] h-px opacity-60 w-full flex-shrink-0" />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-[12px] text-[#808080] text-center py-6">Loading...</p>
        ) : versions.length === 0 ? (
          <div className="text-center py-6 px-4">
            <p className="text-[12px] text-[#808080] mb-2">No versions yet</p>
            <p className="text-[11px] text-[#a0a0a0]">Publish or save a snapshot to create a version</p>
          </div>
        ) : (
          <div className="flex flex-col py-1">
            {versions.map(v => {
              const isCurrent = v.id === currentVersionId;
              return (
                <div
                  key={v.id}
                  className={`px-3 py-2.5 border-b border-[#f0f0f0] last:border-0 ${
                    isCurrent ? 'bg-green-50' : 'hover:bg-[#fafafa]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {isCurrent && <div className="w-[5px] h-[5px] bg-green-500 rounded-full" />}
                      <span className="text-[12px] font-medium text-[#1c1c1c]">
                        {v.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#808080]">v{v.version_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#808080]">{timeAgo(v.created_at)}</span>
                    {!isCurrent && (
                      <div className="flex items-center gap-1">
                        {confirmRestore === v.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRestore(v.id)}
                              disabled={!!restoring}
                              className="text-[10px] text-red-600 hover:text-red-700 font-medium"
                            >
                              {restoring === v.id ? 'Restoring...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmRestore(null)}
                              className="text-[10px] text-[#808080] hover:text-[#1c1c1c]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRestore(v.id)}
                            className="flex items-center gap-0.5 text-[10px] text-[#808080] hover:text-[#1c1c1c]"
                          >
                            <RotateCcw size={10} />
                            Restore
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
