'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  created: 'created this project',
  edited: 'edited pages',
  shared: 'shared this project',
  commented: 'left a comment',
  published: 'published the project',
  unpublished: 'unpublished the project',
};

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

export default function ActivityPanel({ projectId }: { projectId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}/activity?limit=30`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  return (
    <aside className="w-[240px] border-l border-[#e6e6e6] bg-white flex-shrink-0 flex flex-col h-full">
      <div className="p-[12px] flex-shrink-0">
        <span className="text-[14px] font-medium leading-[14px] tracking-[-0.28px] text-[#1c1c1c]">
          Activity
        </span>
      </div>
      <div className="bg-[#e6e6e6] h-px opacity-60 w-full flex-shrink-0" />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-[12px] text-[#808080] text-center py-6">Loading...</p>
        ) : activities.length === 0 ? (
          <p className="text-[12px] text-[#808080] text-center py-6">No activity yet</p>
        ) : (
          <div className="flex flex-col py-2">
            {activities.map(a => (
              <div key={a.id} className="px-3 py-2.5 flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-[#d0d0d0] rounded-full mt-[6px] flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] text-[#1c1c1c] leading-[16px]">
                    {ACTION_LABELS[a.action] || a.action}
                    {a.details?.email ? (
                      <span className="text-[#808080]"> with {String(a.details.email)}</span>
                    ) : null}
                    {a.details?.version ? (
                      <span className="text-[#808080]"> (v{String(a.details.version)})</span>
                    ) : null}
                  </p>
                  <span className="text-[10px] text-[#808080]">{timeAgo(a.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
