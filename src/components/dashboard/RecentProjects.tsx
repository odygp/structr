'use client';

import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import type { DbProject } from '@/lib/db/types';

type Tab = 'all' | 'favorites' | 'drafts' | 'archived' | 'shared';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All Projects' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'archived', label: 'Archived' },
  { id: 'shared', label: 'Shared with me' },
];

export default function RecentProjects({ projects, loading, onDelete, onDuplicate, onRename, onToggleFavorite, onChangeStatus, onRefresh }: {
  projects: DbProject[];
  loading: boolean;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onToggleFavorite?: (id: string, current: boolean) => void;
  onChangeStatus?: (id: string, status: 'draft' | 'published' | 'archived') => void;
  onRefresh?: () => void;
}) {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [sharedProjects, setSharedProjects] = useState<DbProject[]>([]);
  const [sharedLoading, setSharedLoading] = useState(false);

  // Load shared projects when tab is selected
  useEffect(() => {
    if (activeTab !== 'shared') return;
    setSharedLoading(true);
    fetch('/api/projects?tab=shared')
      .then(r => r.ok ? r.json() : [])
      .then(setSharedProjects)
      .catch(() => setSharedProjects([]))
      .finally(() => setSharedLoading(false));
  }, [activeTab]);

  // Filter by tab
  let tabFiltered: DbProject[] = [];
  if (activeTab === 'shared') {
    tabFiltered = sharedProjects;
  } else if (activeTab === 'favorites') {
    tabFiltered = projects.filter(p => p.is_favorite);
  } else if (activeTab === 'drafts') {
    tabFiltered = projects.filter(p => p.status === 'draft');
  } else if (activeTab === 'archived') {
    tabFiltered = projects.filter(p => p.status === 'archived');
  } else {
    tabFiltered = projects.filter(p => p.status !== 'archived');
  }

  // Filter by search
  const filtered = search
    ? tabFiltered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : tabFiltered;

  const counts: Record<Tab, number> = {
    all: projects.filter(p => p.status !== 'archived').length,
    favorites: projects.filter(p => p.is_favorite).length,
    drafts: projects.filter(p => p.status === 'draft').length,
    archived: projects.filter(p => p.status === 'archived').length,
    shared: sharedProjects.length,
  };

  const isLoading = activeTab === 'shared' ? sharedLoading : loading;

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Tabs */}
      <div className="flex items-center gap-[4px] border-b border-[#ebebeb] pb-[1px]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-[16px] py-[10px] text-[14px] font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-[#1c1c1c]'
                : 'text-[#808080] hover:text-[#1c1c1c]'
            }`}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className="ml-[6px] text-[12px] text-[#808080] bg-[#f0f0f0] rounded-full px-[6px] py-[1px]">
                {counts[tab.id]}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#1c1c1c] rounded-full" />
            )}
          </button>
        ))}

        {/* Spacer + Search */}
        <div className="flex-1" />
        <div className="flex items-center gap-[4px]">
          {showSearch && (
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-[12px] py-[8px] text-[13px] border border-[#ebebeb] rounded-[8px] bg-white text-[#34322d] focus:outline-none focus:border-[#34322d] w-[200px]"
              autoFocus
            />
          )}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-[#efefef] flex items-center p-[8px] rounded-[8px] hover:bg-[#e6e6e6] transition-colors"
          >
            <img src="/Search.svg" alt="Search" width={16} height={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-x-[12px] gap-y-[24px]">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex flex-col gap-[12px] animate-pulse">
              <div className="bg-[#efefef] h-[140px] rounded-[20px]" />
              <div className="px-[4px] flex flex-col gap-[4px]">
                <div className="bg-[#efefef] rounded h-[14px] w-3/4" />
                <div className="bg-[#efefef] rounded h-[12px] w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-[48px] text-[#34322d] opacity-40 text-[14px]">
          {activeTab === 'favorites' ? 'No favorite projects yet. Star a project to see it here.'
            : activeTab === 'archived' ? 'No archived projects.'
            : activeTab === 'shared' ? 'No projects have been shared with you yet.'
            : projects.length === 0 ? 'No projects yet. Create one above!'
            : 'No projects match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-x-[12px] gap-y-[24px]">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={activeTab !== 'shared' ? onDelete : undefined}
              onDuplicate={onDuplicate}
              onRename={activeTab !== 'shared' ? onRename : undefined}
              onToggleFavorite={activeTab !== 'shared' ? onToggleFavorite : undefined}
              onChangeStatus={activeTab !== 'shared' ? onChangeStatus : undefined}
              isShared={activeTab === 'shared'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
