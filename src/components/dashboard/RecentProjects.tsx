'use client';

import { useState } from 'react';
import ProjectCard from './ProjectCard';
import type { DbProject } from '@/lib/db/types';

export default function RecentProjects({ projects, loading, onDelete, onDuplicate, onRename }: {
  projects: DbProject[];
  loading: boolean;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = search
    ? projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : projects;

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[6px]">
          <h2 className="text-[20px] font-medium leading-[16px] tracking-[-0.4px] text-[#34322d]">
            Recent Projects
          </h2>
          <div className="bg-[#efefef] flex flex-col items-center justify-center h-[24px] min-w-[24px] px-[6px] rounded-[6px]">
            <span className="text-[12px] font-normal leading-[12px] tracking-[-0.24px] text-[#34322d] opacity-50 text-center">
              {projects.length}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-[4px]">
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
          <button className="bg-[#efefef] flex items-center p-[8px] rounded-[8px] hover:bg-[#e6e6e6] transition-colors">
            <img src="/Filter.svg" alt="Filter" width={16} height={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
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
          {projects.length === 0 ? 'No projects yet. Create one above!' : 'No projects match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-x-[12px] gap-y-[24px]">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} onDelete={onDelete} onDuplicate={onDuplicate} onRename={onRename} />
          ))}
        </div>
      )}
    </div>
  );
}
