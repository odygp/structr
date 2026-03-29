'use client';

import { useState } from 'react';
import { Check, MoreHorizontal, CheckSquare, RotateCcw, MessageCircle, Sparkles, Loader2 } from 'lucide-react';

interface Comment {
  id: string;
  project_id: string;
  page_index: number;
  section_index: number;
  author_name: string;
  message: string;
  resolved: boolean;
  parent_id: string | null;
  user_id: string | null;
  created_at: string;
}

/* ── Comment Item ── */
function CommentItem({ comment, onResolve, onUnresolve, onReply, isNew, replies = [] }: {
  comment: Comment;
  onResolve: (id: string) => void;
  onUnresolve: (id: string) => void;
  onReply?: (parentId: string) => void;
  isNew?: boolean;
  replies?: Comment[];
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
    <div className="border-b border-[#e6e6e6] pb-[12px] px-[4px]">
      <div
        className="flex flex-col gap-[12px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Top row: avatar + actions */}
        <div className="flex items-start justify-between">
          <div className="bg-[#f5f5f5] rounded-[4px] w-[24px] h-[24px] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-medium text-[#8e8e8e]">
              {comment.author_name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className={`flex items-center gap-[4px] ${hovered ? '' : 'opacity-0'} transition-opacity`}>
            {!comment.resolved ? (
              <>
                {onReply && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="bg-[#f5f5f5] flex items-center p-[4px] rounded-[8px] hover:bg-[#e6e6e6] transition-colors"
                    title="Reply"
                  >
                    <MessageCircle className="w-[14px] h-[14px] text-[#808080]" />
                  </button>
                )}
                <button
                  onClick={() => onResolve(comment.id)}
                  className="bg-[#f5f5f5] flex items-center p-[4px] rounded-[8px] hover:bg-[#e6e6e6] transition-colors"
                  title="Resolve"
                >
                  <Check className="w-[16px] h-[16px] text-[#1c1c1c]" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onUnresolve(comment.id)}
                className="bg-[#f5f5f5] flex items-center p-[4px] rounded-[8px] hover:bg-[#e6e6e6] transition-colors"
                title="Reopen"
              >
                <RotateCcw className="w-[14px] h-[14px] text-[#808080]" />
              </button>
            )}
          </div>

          {isNew && !comment.resolved && (
            <div className="w-[8px] h-[8px] bg-blue-500 rounded-full flex-shrink-0 mt-[8px]" />
          )}
        </div>

        {/* Text block */}
        <div className="flex flex-col gap-[8px] text-[12px] text-black">
          <div className="flex items-center gap-[7px]">
            <span className="font-medium">{comment.author_name}</span>
            <span className="font-normal opacity-[0.54]">{timeAgo(comment.created_at)}</span>
            <span className="font-normal opacity-40">S{comment.section_index + 1}</span>
            <span className="font-normal opacity-40 w-[16px]">#{comment.page_index + 1}</span>
          </div>
          <p className="font-normal" style={{ maxWidth: 265 }}>{comment.message}</p>
        </div>
      </div>

      {/* Threaded replies */}
      {replies.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-[#f0f0f0] pl-3 flex flex-col gap-2">
          {replies.map(reply => (
            <div key={reply.id} className="flex flex-col gap-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-[#1c1c1c]">{reply.author_name}</span>
                <span className="text-[#808080]">{timeAgo(reply.created_at)}</span>
              </div>
              <p className="text-[#1c1c1c]">{reply.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Comments Sidebar ── */
export function CommentsSidebar({ comments, onResolve, onUnresolve, onResolveWithAI, aiResolving }: {
  comments: Comment[];
  onResolve: (id: string) => void;
  onUnresolve: (id: string) => void;
  onResolveWithAI?: () => void;
  aiResolving?: boolean;
}) {
  const [filter, setFilter] = useState<'open' | 'resolved'>('open');

  // Group comments: root comments + their replies
  const rootComments = comments.filter(c => !c.parent_id);
  const repliesMap = new Map<string, Comment[]>();
  comments.filter(c => c.parent_id).forEach(c => {
    const arr = repliesMap.get(c.parent_id!) || [];
    arr.push(c);
    repliesMap.set(c.parent_id!, arr);
  });

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
          <button
            onClick={() => setFilter(filter === 'open' ? 'resolved' : 'open')}
            className="border border-[#e6e6e6] rounded-[6px] h-[28px] w-[60px] flex items-center justify-center text-[11px] font-medium text-[#1c1c1c]"
          >
            {filter === 'open' ? 'Open' : 'Resolved'}
          </button>
          <button className="border border-[#e6e6e6] rounded-[6px] w-[28px] h-[28px] flex items-center justify-center">
            <MoreHorizontal className="w-[16px] h-[16px] text-[#1c1c1c]" />
          </button>
        </div>
      </div>

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
                onUnresolve={onUnresolve}
                isNew={i < 2}
                replies={repliesMap.get(comment.id) || []}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom actions */}
      {filter === 'open' && filtered.length > 0 && (
        <div className="p-[12px] flex-shrink-0 space-y-[6px]">
          {/* Resolve with AI */}
          {onResolveWithAI && (
            <button
              onClick={onResolveWithAI}
              disabled={aiResolving}
              className="bg-[#1c1c1c] flex items-center justify-between px-[10px] py-[8px] rounded-[8px] w-full hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              <span className="text-[13px] font-medium text-white flex items-center gap-[6px]">
                {aiResolving ? <Loader2 className="w-[14px] h-[14px] animate-spin" /> : <Sparkles className="w-[14px] h-[14px]" />}
                {aiResolving ? 'Analyzing comments...' : 'Resolve with AI'}
              </span>
              {!aiResolving && <span className="text-[11px] text-white/60">5 ★</span>}
            </button>
          )}
          {/* Mark all manually */}
          <button
            onClick={resolveAll}
            className="bg-[#f5f4f2] flex items-center justify-between px-[10px] py-[8px] rounded-[8px] w-full hover:bg-[#edece9] transition-colors"
          >
            <span className="text-[13px] font-normal text-[#1c1c1c]">
              Mark all as resolved
            </span>
            <CheckSquare className="w-[14px] h-[14px] text-[#1c1c1c]" />
          </button>
        </div>
      )}
    </aside>
  );
}

export { CommentsSidebar as CommentsPanel };
