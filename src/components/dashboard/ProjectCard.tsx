'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { DbProject } from '@/lib/db/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface ContextMenuPos {
  x: number;
  y: number;
}

export default function ProjectCard({ project, onDelete, onDuplicate, onRename }: {
  project: DbProject;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
}) {
  const router = useRouter();
  const [contextMenu, setContextMenu] = useState<ContextMenuPos | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [contextMenu]);

  // Focus rename input
  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleOpen = () => {
    setContextMenu(null);
    router.push(`/builder?project=${project.id}`);
  };

  const handleCopyLink = () => {
    setContextMenu(null);
    const url = `${window.location.origin}/builder?project=${project.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const handleDuplicate = () => {
    setContextMenu(null);
    onDuplicate?.(project.id);
  };

  const handleRename = () => {
    setContextMenu(null);
    setRenameValue(project.name);
    setIsRenaming(true);
  };

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== project.name) {
      onRename?.(project.id, trimmed);
    }
    setIsRenaming(false);
  };

  const handleMoveToTrash = () => {
    setContextMenu(null);
    onDelete?.(project.id);
  };

  const menuItems = [
    { label: 'Open', action: handleOpen, highlight: true },
    { label: 'Copy link', action: handleCopyLink },
    { label: 'Duplicate', action: handleDuplicate },
    { label: 'Rename', action: handleRename },
    { label: 'Move to trash', action: handleMoveToTrash },
  ];

  return (
    <div
      className="relative flex flex-col gap-[12px] p-[4px] rounded-[20px] cursor-pointer hover:bg-white transition-colors"
      onClick={() => !isRenaming && router.push(`/builder?project=${project.id}`)}
      onContextMenu={handleContextMenu}
    >
      {/* Thumbnail */}
      <div className="bg-[#efefef] h-[140px] rounded-[16px] overflow-hidden w-full">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : null}
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
          className="absolute z-50 bg-white flex flex-col items-start p-[4px] rounded-[12px] w-[161px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex items-center justify-center p-[8px] rounded-[4px] w-full text-left transition-colors ${
                item.highlight ? 'bg-[#efefef]' : 'hover:bg-[#efefef]'
              }`}
            >
              <span className="flex-1 text-[14px] font-medium leading-[16px] tracking-[-0.28px] text-[#1c1c1c]">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
