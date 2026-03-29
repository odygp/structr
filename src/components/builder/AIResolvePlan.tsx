'use client';

import { useState } from 'react';
import { Loader2, MoveVertical, Pencil, Plus, Trash2, X } from 'lucide-react';

interface PlanAction {
  type: 'edit_content' | 'reorder' | 'add_section' | 'remove_section' | 'add_page';
  pageIndex: number;
  sectionIndex?: number;
  description: string;
  changes?: Record<string, unknown>;
  category?: string;
  variantId?: string;
  content?: Record<string, unknown>;
  afterIndex?: number;
  fromIndex?: number;
  toIndex?: number;
  resolvesComments: string[];
}

interface AIResolvePlanProps {
  plan: PlanAction[];
  summary: string;
  commentCount: number;
  starCost: number;
  onApply: (mode: 'current' | 'new_version') => void;
  onCancel: () => void;
  applying: boolean;
}

const ACTION_ICONS = {
  edit_content: Pencil,
  reorder: MoveVertical,
  add_section: Plus,
  remove_section: Trash2,
  add_page: Plus,
};

const ACTION_COLORS = {
  edit_content: 'bg-blue-50 text-blue-600',
  reorder: 'bg-purple-50 text-purple-600',
  add_section: 'bg-green-50 text-green-600',
  remove_section: 'bg-red-50 text-red-600',
  add_page: 'bg-green-50 text-green-600',
};

const StarIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="inline-block">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export default function AIResolvePlan({ plan, summary, commentCount, starCost, onApply, onCancel, applying }: AIResolvePlanProps) {
  const [mode, setMode] = useState<'current' | 'new_version'>('new_version');

  return (
    <aside className="w-[300px] border-l border-[#e6e6e6] bg-white flex-shrink-0 flex flex-col h-full">
      {/* Header */}
      <div className="p-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <span className="text-[14px] font-medium text-[#1c1c1c] block">AI Resolve Plan</span>
          <span className="text-[11px] text-[#808080]">{summary}</span>
        </div>
        <button onClick={onCancel} className="text-[#808080] hover:text-[#1c1c1c]">
          <X size={16} />
        </button>
      </div>
      <div className="bg-[#e6e6e6] h-px opacity-60 w-full flex-shrink-0" />

      {/* Action list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {plan.map((action, i) => {
            const Icon = ACTION_ICONS[action.type] || Pencil;
            const colorClass = ACTION_COLORS[action.type] || 'bg-gray-50 text-gray-600';

            return (
              <div key={i} className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-3">
                <div className="flex items-start gap-2 mb-1.5">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-[#1c1c1c] leading-tight">
                      {action.description}
                    </div>
                    <div className="text-[10px] text-[#a0a0a0] mt-1">
                      Page {action.pageIndex + 1}
                      {action.sectionIndex !== undefined && ` / Section ${action.sectionIndex + 1}`}
                      {' '}&middot;{' '}
                      {action.resolvesComments.length} comment{action.resolvesComments.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Show action type hint — no content details to prevent copy */}
                {action.type === 'edit_content' && action.changes && (
                  <div className="mt-2 text-[10px] text-[#a0a0a0]">
                    {Object.keys(action.changes).length} field{Object.keys(action.changes).length !== 1 ? 's' : ''} will be updated
                  </div>
                )}

                {action.type === 'add_section' && action.category && (
                  <div className="mt-2 text-[10px] text-[#a0a0a0]">
                    New section: {action.category}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Version choice + Apply */}
      <div className="p-3 border-t border-[#e6e6e6] flex-shrink-0 space-y-3">
        {/* Mode selector */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="apply-mode"
              checked={mode === 'new_version'}
              onChange={() => setMode('new_version')}
              className="w-3.5 h-3.5 accent-[#1c1c1c]"
            />
            <div>
              <div className="text-[12px] font-medium text-[#1c1c1c]">Apply as new version</div>
              <div className="text-[10px] text-[#808080]">Creates v2 — original untouched</div>
            </div>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="apply-mode"
              checked={mode === 'current'}
              onChange={() => setMode('current')}
              className="w-3.5 h-3.5 accent-[#1c1c1c]"
            />
            <div>
              <div className="text-[12px] font-medium text-[#1c1c1c]">Apply to current</div>
              <div className="text-[10px] text-[#808080]">Edits in place (safety snapshot saved)</div>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={applying}
            className="flex-1 h-[36px] text-[13px] font-medium text-[#808080] border border-[#ebebeb] rounded-lg hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(mode)}
            disabled={applying}
            className="flex-1 h-[36px] text-[13px] font-medium text-white bg-[#1c1c1c] rounded-lg hover:bg-[#333] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {applying ? (
              <><Loader2 size={13} className="animate-spin" /> Applying...</>
            ) : (
              <>Apply ({starCost} <StarIcon size={11} />)</>
            )}
          </button>
        </div>

        <p className="text-[10px] text-[#a0a0a0] text-center">
          {commentCount} comment{commentCount !== 1 ? 's' : ''} will be marked as resolved
        </p>
      </div>
    </aside>
  );
}
