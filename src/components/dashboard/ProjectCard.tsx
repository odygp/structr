'use client';

import { useRouter } from 'next/navigation';
import type { DbProject } from '@/lib/db/types';

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectCard({ project }: { project: DbProject }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/builder?project=${project.id}`)}
      className="text-left group"
    >
      {/* Thumbnail */}
      <div className="bg-gray-100 rounded-xl h-36 mb-2 overflow-hidden group-hover:ring-2 group-hover:ring-gray-200 transition-all">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="currentColor" fillOpacity="0.3" />
              <path d="M7 7h14v14H7V7zm2 2v10h10V9H9z" fill="currentColor" fillOpacity="0.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-sm font-medium text-gray-900 truncate">{project.name}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(project.updated_at)}</p>
    </button>
  );
}
