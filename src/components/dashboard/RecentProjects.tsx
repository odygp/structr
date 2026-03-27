'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProjectCard from './ProjectCard';
import type { DbProject } from '@/lib/db/types';

export default function RecentProjects({ projects, loading }: { projects: DbProject[]; loading: boolean }) {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = search
    ? projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : projects;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
            {projects.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showSearch && (
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 w-48"
              autoFocus
            />
          )}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <Search size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-xl h-36 mb-2" />
              <div className="bg-gray-100 rounded h-4 w-3/4 mb-1" />
              <div className="bg-gray-100 rounded h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {projects.length === 0 ? 'No projects yet. Create one above!' : 'No projects match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
