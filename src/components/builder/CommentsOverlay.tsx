'use client';

import { useState } from 'react';
import { Check, MoreHorizontal, CheckSquare } from 'lucide-react';

interface Comment {
  id: string;
  project_id: string;
  page_index: number;
  section_index: number;
  author_name: string;
  message: string;
  resolved: boolean;
  parent_id: string | null;
  created_at: string;
}

/* ── Comment Item (3 states: default, hover, new) ── */
function CommentItem({ comment, onResolve, isNew }: {
  comment: Comment;
  onResolve: (id: string) => void;
  isNew?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div
      className="border-b border-[#e6e6e6] flex flex-col gap-[12px] pb-[16px] px-[4px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: avatar + resolve */}
      <div className="flex items-start justify-between">
        {/* Avatar */}
        <div className="bg-[#f5f5f5] rounded-[4px] w-[24px] h-[24px] flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-medium text-[#8e8e8e]">
            {comment.author_name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Resolve action */}
        {!comment.resolved && (
          <div className={`flex items-center gap-[8px] ${hovered ? '' : 'opacity-0'} transition-opacity`}>
            {hovered && (
              <span className="text-[12px] font-normal text-black opacity-40">Resolve</span>
            )}
            <button
              onClick={() => onResolve(comment.id)}
              className="bg-[#f5f5f5] flex items-center p-[4px] rounded-[8px] hover:bg-[#e6e6e6] transition-colors"
            >
              <Check className="w-[16px] h-[16px] text-[#1c1c1c]" />
            </button>
          </div>
        )}

        {/* New indicator (blue dot) */}
        {isNew && !comment.resolved && (
          <div className="w-[8px] h-[8px] bg-blue-500 rounded-full flex-shrink-0 mt-[8px]" />
        )}
      </div>

      {/* Text block */}
      <div className="flex flex-col gap-[8px] text-[12px] text-black">
        {/* Meta row */}
        <div className="flex items-center gap-[7px]">
          <span className="font-medium">{comment.author_name}</span>
          <span className="font-normal opacity-[0.54]">{timeAgo(comment.created_at)}</span>
          <span className="font-normal opacity-40">S{comment.section_index + 1}</span>
          <span className="font-normal opacity-40 w-[16px]">#{comment.page_index + 1}</span>
        </div>
        {/* Message */}
        <p className="font-normal" style={{ maxWidth: 265 }}>{comment.message}</p>
      </div>
    </div>
  );
}

/* ── Comments Sidebar (replaces right panel) ── */
export function CommentsSidebar({ comments, onResolve }: {
  comments: Comment[];
  onResolve: (id: string) => void;
}) {
  const [filter, setFilter] = useState<'open' | 'resolved'>('open');

  const rootComments = comments.filter(c => !c.parent_id);
  const filtered = rootComments.filter(c => filter === 'open' ? !c.resolved : c.resolved);

  const resolveAll = () => {
    filtered.forEach(c => { if (!c.resolved) onResolve(c.id); });
  };

  return (
    <aside aria-label="Comments" className="w-[240px] border-l border-[#e6e6e6] bg-white flex-shrink-0 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-[12px] pl-[4px] p-[12px] flex-shrink-0">
        <span className="text-[14px] font-medium leading-[14px] tracking-[-0.28px] text-[#1c1c1c]">
          Comments
        </span>
        <div className="flex items-center gap-[4px]">
          {/* Filter pill */}
          <button
            onClick={() => setFilter(filter === 'open' ? 'resolved' : 'open')}
            className="border border-[#e6e6e6] rounded-[6px] h-[28px] w-[60px] flex items-center justify-center text-[11px] font-medium text-[#1c1c1c]"
          >
            {filter === 'open' ? 'Open' : 'Resolved'}
          </button>
          {/* Overflow menu */}
          <button className="border border-[#e6e6e6] rounded-[6px] w-[28px] h-[28px] flex items-center justify-center">
            <MoreHorizontal className="w-[16px] h-[16px] text-[#1c1c1c]" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="bg-[#e6e6e6] h-px opacity-60 w-full flex-shrink-0" />

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[12px] py-[12px] px-[12px]">
          {filtered.length === 0 ? (
            <p className="text-[12px] text-[#808080] text-center py-6">
              {filter === 'open' ? 'No open comments' : 'No resolved comments'}
            </p>
          ) : (
            filtered.map((comment, i) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onResolve={onResolve}
                isNew={i < 2} // first 2 shown as "new" — can be refined with real logic
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom action */}
      <div className="p-[12px] flex-shrink-0">
        <button
          onClick={resolveAll}
          className="bg-[#f5f4f2] flex items-center justify-between px-[10px] py-[8px] rounded-[8px] w-full hover:bg-[#edece9] transition-colors"
        >
          <span className="text-[14px] font-normal leading-[14px] tracking-[-0.14px] text-[#1c1c1c]">
            Mark all as resolved
          </span>
          <CheckSquare className="w-[16px] h-[16px] text-[#1c1c1c]" />
        </button>
      </div>
    </aside>
  );
}

// Keep legacy exports for the preview page
export { CommentsSidebar as CommentsPanel };
