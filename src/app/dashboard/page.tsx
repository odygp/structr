'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import DashboardNav from '@/components/dashboard/DashboardNav';
import AiPromptCard from '@/components/dashboard/AiPromptCard';
import ActionCards from '@/components/dashboard/ActionCards';
import RecentProjects from '@/components/dashboard/RecentProjects';
import type { DbProject } from '@/lib/db/types';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error('Failed to load projects:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [user, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <DashboardNav user={user} />

      <main className="max-w-3xl mx-auto px-4 pt-12 pb-20">
        {/* AI Prompt */}
        <AiPromptCard />

        {/* Action Cards */}
        <ActionCards />

        {/* Recent Projects */}
        <RecentProjects projects={projects} loading={loading} />
      </main>
    </div>
  );
}
