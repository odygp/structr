'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import type { DbProject } from '@/lib/db/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface ContextMenuPos { x: number; y: number; }

// Category colors for mini wireframe thumbnail
const CATEGORY_COLORS: Record<string, string> = {
  header: '#1c1c1c',
  hero: '#2d2d2d',
  features: '#6b7280',
  pricing: '#4b5563',
  testimonials: '#9ca3af',
  faq: '#d1d5db',
  cta: '#374151',
  footer: '#e5e7eb',
  contact: '#9ca3af',
  stats: '#6b7280',
  team: '#9ca3af',
  gallery: '#d1d5db',
  blog: '#9ca3af',
  about: '#6b7280',
  banner: '#4b5563',
  showcase: '#6b7280',
};

function MiniWireframe({ sections }: { sections?: { category: string }[] }) {
  if (!sections || sections.length === 0) return null;
  return (
    <div className="absolute inset-0 flex flex-col gap-[2px] p-[12px] opacity-60">
      {sections.slice(0, 8).map((s, i) => {
        const color = CATEGORY_COLORS[s.category] || '#d1d5db';
        const height = s.category === 'hero' ? '28%' : s.category === 'header' || s.category === 'footer' ? '8%' : '14%';
        return (
          <div
            key={i}
            className="rounded-[3px] w-full flex-shrink-0"
            style={{ backgroundColor: color, height, minHeight: 4, maxHeight: 40 }}
          />
        );
      })}
    </div>
  );
}

export default function ProjectCard({ project, onDelete, onDuplicate, onRename, onToggleFavorite, onChangeStatus, isShared }: {
  project: DbProject & { first_page_sections?: { category: string }[] };
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onToggleFavorite?: (id: string, current: boolean) => void;
  onChangeStatus?: (id: string, status: 'draft' | 'published' | 'archived') => void;
  isShared?: boolean;
}) {
  const router = useRouter();
  const [contextMenu, setContextMenu] = useState<ContextMenuPos | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenu(null);
    };
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setContextMenu(null); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEsc); };
  }, [contextMenu]);

  useEffect(() => {
    if (isRenaming && renameRef.current) { renameRef.current.focus(); renameRef.current.select(); }
  }, [isRenaming]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== project.name) onRename?.(project.id, trimmed);
    setIsRenaming(false);
  };

  const menuItems = [
    { label: 'Open', action: () => { setContextMenu(null); router.push(`/builder?project=${project.id}`); }, highlight: true },
    { label: 'Copy link', action: () => { setContextMenu(null); navigator.clipboard.writeText(`${window.location.origin}/builder?project=${project.id}`).catch(() => {}); } },
    { label: project.is_favorite ? 'Remove from favorites' : 'Add to favorites', action: () => { setContextMenu(null); onToggleFavorite?.(project.id, project.is_favorite); } },
    { label: 'Duplicate', action: () => { setContextMenu(null); onDuplicate?.(project.id); } },
    { label: 'Rename', action: () => { setContextMenu(null); setRenameValue(project.name); setIsRenaming(true); } },
    { label: project.status === 'archived' ? 'Restore' : 'Archive', action: () => { setContextMenu(null); onChangeStatus?.(project.id, project.status === 'archived' ? 'draft' : 'archived'); } },
    ...(project.status !== 'archived' ? [{ label: 'Move to trash', action: () => { setContextMenu(null); onDelete?.(project.id); }, danger: true }] : []),
  ];

  const statusColors = {
    draft: 'bg-[#e6e6e6] text-[#808080]',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-orange-100 text-orange-600',
  };

  return (
    <div
      className="relative flex flex-col gap-[12px] p-[4px] rounded-[20px] cursor-pointer hover:bg-white transition-colors group"
      onClick={() => !isRenaming && router.push(`/builder?project=${project.id}`)}
      onContextMenu={handleContextMenu}
    >
      {/* Thumbnail */}
      <div className="bg-[#efefef] h-[140px] rounded-[16px] overflow-hidden w-full relative transition-transform duration-200 group-hover:scale-[1.02] group-hover:shadow-md">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <MiniWireframe sections={project.first_page_sections} />
        )}

        {/* Favorite star — visible on hover or when favorited */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(project.id, project.is_favorite); }}
          className={`absolute top-[8px] right-[8px] w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all ${
            project.is_favorite
              ? 'bg-yellow-400 text-white opacity-100'
              : 'bg-white/80 text-[#808080] opacity-0 group-hover:opacity-100 hover:text-yellow-500'
          }`}
        >
          <Star size={14} fill={project.is_favorite ? 'currentColor' : 'none'} />
        </button>

        {/* Status badge */}
        {project.status !== 'draft' && (
          <div className={`absolute top-[8px] left-[8px] px-[8px] py-[2px] rounded-full text-[10px] font-medium flex items-center gap-1 ${statusColors[project.status] || statusColors.draft}`}>
            {project.status === 'published' && <div className="w-[5px] h-[5px] bg-green-500 rounded-full" />}
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </div>
        )}

        {/* Shared badge */}
        {isShared && (
          <div className="absolute bottom-[8px] left-[8px] px-[8px] py-[2px] rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
            Shared
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-[4px] px-[4px] leading-[16px] text-[#34322d]">
        {isRenaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') { setIsRenaming(false); setRenameValue(project.name); }
            }}
            onClick={e => e.stopPropagation()}
            className="text-[14px] font-medium tracking-[-0.28px] w-full bg-transparent border-b border-[#34322d] outline-none py-[1px]"
          />
        ) : (
          <h3 className="text-[14px] font-medium tracking-[-0.28px] truncate w-full">
            {project.name}
          </h3>
        )}
        <p className="text-[12px] font-normal opacity-60 w-full">
          {formatDate(project.updated_at)}
        </p>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="absolute z-50 bg-white flex flex-col items-start p-[4px] rounded-[12px] w-[190px]"
          style={{ left: contextMenu.x, top: contextMenu.y, boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)' }}
          onClick={e => e.stopPropagation()}
        >
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex items-center p-[8px] rounded-[4px] w-full text-left transition-colors ${
                'danger' in item && item.danger ? 'hover:bg-red-50' : item.highlight ? 'bg-[#efefef]' : 'hover:bg-[#efefef]'
              }`}
            >
              <span className={`flex-1 text-[14px] font-medium leading-[16px] tracking-[-0.28px] ${
                'danger' in item && item.danger ? 'text-red-500' : 'text-[#1c1c1c]'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
