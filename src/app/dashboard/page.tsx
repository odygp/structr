'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import DashboardNav from '@/components/dashboard/DashboardNav';
import AiPromptCard from '@/components/dashboard/AiPromptCard';
import ActionCards from '@/components/dashboard/ActionCards';
import RecentProjects from '@/components/dashboard/RecentProjects';
import type { DbProject } from '@/lib/db/types';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) setProjects(await res.json());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { window.location.href = '/login'; return; }
    loadProjects();
  }, [user, authLoading, loadProjects]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const newProject = await res.json();
        setProjects(prev => [newProject, ...prev]);
      }
    } catch {}
  };

  const handleRename = async (id: string, name: string) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    } catch {}
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    const newValue = !current;
    // Optimistic update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, is_favorite: newValue } : p));
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: newValue }),
      });
    } catch {
      // Revert on error
      setProjects(prev => prev.map(p => p.id === id ? { ...p, is_favorite: current } : p));
    }
  };

  const handleChangeStatus = async (id: string, status: 'draft' | 'published' | 'archived') => {
    const prev = projects.find(p => p.id === id)?.status;
    // Optimistic update
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status } : p));
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      if (prev) setProjects(ps => ps.map(p => p.id === id ? { ...p, status: prev } : p));
    }
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
      <DashboardNav user={user} />

      <main className="w-[780px] mx-auto pt-[64px] flex flex-col gap-[77px]">
        {/* Top section: prompt + actions */}
        <div className="flex flex-col gap-[20px]">
          <h1 className="text-[20px] font-medium leading-[16px] tracking-[-0.4px] text-[#34322d]">
            What are we building today?
          </h1>
          <div className="flex flex-col gap-[16px]">
            <AiPromptCard />
            <ActionCards />
          </div>
        </div>

        {/* Projects with tabs */}
        <RecentProjects
          projects={projects}
          loading={loading}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onRename={handleRename}
          onToggleFavorite={handleToggleFavorite}
          onChangeStatus={handleChangeStatus}
          onRefresh={loadProjects}
        />
      </main>
    </div>
  );
}
