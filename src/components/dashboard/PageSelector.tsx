'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

export interface PageItem {
  name: string;
  checked: boolean;
  description?: string;
  level?: number; // for hierarchy indentation (octopus)
}

interface PageSelectorProps {
  pages: PageItem[];
  onToggle: (index: number) => void;
  onAddCustom?: (name: string) => void;
  showHierarchy?: boolean;
  maxHeight?: string;
}

export default function PageSelector({ pages, onToggle, onAddCustom, showHierarchy, maxHeight = '320px' }: PageSelectorProps) {
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPage, setNewPage] = useState('');

  const addCustomPage = () => {
    const trimmed = newPage.trim();
    if (!trimmed || pages.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return;
    onAddCustom?.(trimmed);
    setNewPage('');
    setShowAddPage(false);
  };

  const selectedCount = pages.filter(p => p.checked).length;

  return (
    <div className="flex flex-col gap-[4px]">
      {/* Select all / none */}
      <div className="flex items-center justify-between px-[16px] py-[4px]">
        <span className="text-[12px] text-[#808080]">{selectedCount} of {pages.length} pages selected</span>
        <div className="flex gap-[8px]">
          <button
            onClick={() => pages.forEach((_, i) => { if (!pages[i].checked) onToggle(i); })}
            className="text-[12px] text-[#34322d] hover:underline"
          >
            Select all
          </button>
          <button
            onClick={() => pages.forEach((_, i) => { if (pages[i].checked) onToggle(i); })}
            className="text-[12px] text-[#808080] hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Page list */}
      <div className="flex flex-col gap-[2px] overflow-y-auto" style={{ maxHeight }}>
        {pages.map((page, i) => (
          <button
            key={`${page.name}-${i}`}
            onClick={() => onToggle(i)}
            className={`flex items-center gap-[12px] px-[16px] py-[10px] rounded-[12px] text-left transition-colors ${
              page.checked ? 'bg-[#fafafa]' : 'hover:bg-[#fafafa]'
            }`}
            style={showHierarchy && page.level ? { paddingLeft: 16 + (page.level) * 16 } : undefined}
          >
            <div className={`w-[20px] h-[20px] rounded-[6px] border flex-shrink-0 flex items-center justify-center transition-colors ${
              page.checked ? 'bg-[#34322d] border-[#34322d]' : 'border-[#d4d4d4]'
            }`}>
              {page.checked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-[14px] font-medium text-[#34322d] ${!page.checked ? 'opacity-50' : ''}`}>{page.name}</span>
              {page.description && (
                <p className={`text-[12px] text-[#808080] truncate ${!page.checked ? 'opacity-40' : ''}`}>{page.description}</p>
              )}
            </div>
          </button>
        ))}

        {/* Add custom page */}
        {onAddCustom && (
          showAddPage ? (
            <div className="flex items-center gap-[8px] px-[16px] py-[8px]">
              <input
                type="text"
                placeholder="Page name..."
                value={newPage}
                onChange={e => setNewPage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustomPage(); if (e.key === 'Escape') setShowAddPage(false); }}
                className="flex-1 px-[12px] py-[8px] text-[14px] border border-[#ebebeb] rounded-[8px] focus:outline-none focus:border-[#34322d]"
                autoFocus
              />
              <button onClick={addCustomPage} className="text-[13px] font-medium text-[#34322d] px-[12px] py-[8px] bg-[#efefef] rounded-[8px]">Add</button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddPage(true)}
              className="flex items-center gap-[12px] px-[16px] py-[10px] rounded-[12px] text-left hover:bg-[#fafafa] transition-colors"
            >
              <div className="w-[20px] h-[20px] rounded-[6px] border border-dashed border-[#d4d4d4] flex items-center justify-center">
                <Plus size={12} className="text-[#34322d] opacity-40" />
              </div>
              <span className="text-[14px] text-[#34322d] opacity-40">Add custom page</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
