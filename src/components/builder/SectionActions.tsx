'use client';

import { GripVertical, Copy, Sparkles, Star, Trash2 } from 'lucide-react';

interface Props {
  onDragStart?: () => void;
  onDuplicate: () => void;
  onEditWithAi: () => void;
  onSaveReusable: () => void;
  onDelete: () => void;
}

export default function SectionActions({ onDuplicate, onEditWithAi, onSaveReusable, onDelete }: Props) {
  const buttons = [
    { icon: GripVertical, label: 'Drag to reorder', onClick: undefined, className: 'cursor-grab' },
    { icon: Copy, label: 'Duplicate section', onClick: onDuplicate },
    { icon: Sparkles, label: 'Edit with AI', onClick: onEditWithAi },
    { icon: Star, label: 'Save as reusable', onClick: onSaveReusable },
    { icon: Trash2, label: 'Delete section', onClick: onDelete },
  ];

  return (
    <div
      className="absolute top-[8px] right-[-44px] flex flex-col gap-[4px] z-20"
      onClick={e => e.stopPropagation()}
    >
      {buttons.map((btn, i) => (
        <button
          key={i}
          onClick={btn.onClick}
          title={btn.label}
          className={`w-[32px] h-[32px] rounded-[8px] bg-[#1c1c1c] text-white flex items-center justify-center hover:bg-[#333] transition-colors ${btn.className || ''}`}
        >
          <btn.icon size={14} />
        </button>
      ))}
    </div>
  );
}
