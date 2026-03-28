'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface Props {
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
}

export default function DocumentSidebar({ backgroundColor, onBackgroundColorChange }: Props) {
  const [editingColor, setEditingColor] = useState(false);
  const [tempColor, setTempColor] = useState(backgroundColor);

  const handleColorSubmit = () => {
    const hex = tempColor.startsWith('#') ? tempColor : `#${tempColor}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onBackgroundColorChange(hex);
    }
    setEditingColor(false);
  };

  return (
    <aside className="w-[240px] bg-white border-l border-[#ebebeb] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-[12px] pt-[12px] pb-[12px]">
        <span className="text-[14px] font-medium text-[#1c1c1c]">Document</span>
        <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[8px] hover:bg-[#f5f5f5]">
          <MoreHorizontal size={16} className="text-[#808080]" />
        </button>
      </div>

      <div className="mx-[12px] h-px bg-[#ebebeb]" />

      {/* Background Color */}
      <div className="px-[12px] pt-[17px]">
        <label className="text-[13px] text-[#808080] block mb-[8px]">Background Color</label>
        <div className="flex items-center justify-between h-[36px] bg-[#f5f5f5] rounded-[8px] px-[12px]">
          <div className="flex items-center gap-[12px]">
            <div
              className="w-[16px] h-[16px] rounded-[4px] border border-[#e6e6e6]"
              style={{ backgroundColor }}
            />
            {editingColor ? (
              <input
                type="text"
                value={tempColor}
                onChange={e => setTempColor(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleColorSubmit(); if (e.key === 'Escape') setEditingColor(false); }}
                onBlur={handleColorSubmit}
                className="w-[70px] text-[13px] text-[#1c1c1c] bg-transparent focus:outline-none"
                autoFocus
              />
            ) : (
              <span className="text-[13px] text-[#1c1c1c]">{backgroundColor.toUpperCase()}</span>
            )}
          </div>
          <button
            onClick={() => { setTempColor(backgroundColor); setEditingColor(true); }}
            className="text-[#808080] hover:text-[#1c1c1c]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 1.75L12.25 3.5M1.75 12.25L2.33 9.67L9.63 2.37C9.87 2.13 10.13 2.13 10.37 2.37L11.63 3.63C11.87 3.87 11.87 4.13 11.63 4.37L4.33 11.67L1.75 12.25Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mx-[12px] mt-[16px] h-px bg-[#ebebeb]" />
    </aside>
  );
}
