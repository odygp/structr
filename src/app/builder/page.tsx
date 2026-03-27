'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import BuilderLayout from '@/components/builder/BuilderLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBuilderStore } from '@/lib/store';

function BuilderInner() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const { user, loading: authLoading } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const loadRemoteProject = useBuilderStore(s => s.loadRemoteProject);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (projectId && !loaded) {
      // Load project from Supabase
      fetch(`/api/projects/${projectId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            loadRemoteProject(data);
          }
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, [projectId, user, authLoading, loaded, loadRemoteProject]);

  if (authLoading || !user || !loaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading project...</div>
      </div>
    );
  }

  return <BuilderLayout />;
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <BuilderInner />
    </Suspense>
  );
}
