'use client';

import { useRouter } from 'next/navigation';
import type { DbProject } from '@/lib/db/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectCard({ project }: { project: DbProject }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/builder?project=${project.id}`)}
      className="text-left group flex flex-col gap-[12px]"
    >
      {/* Thumbnail */}
      <div className="bg-[#efefef] h-[140px] rounded-[20px] overflow-hidden group-hover:ring-2 group-hover:ring-[#d4d4d4] transition-all w-full">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-[4px] px-[4px] leading-[16px] text-[#34322d]">
        <h3 className="text-[14px] font-medium tracking-[-0.28px] truncate w-full">
          {project.name}
        </h3>
        <p className="text-[12px] font-normal opacity-60 w-full">
          {formatDate(project.updated_at)}
        </p>
      </div>
    </button>
  );
}
