'use client';

import { useState, useEffect } from 'react';
import { useBuilderStore } from '@/lib/store';
import { MessageCircle, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    fetch(`/api/comments?project=${projectId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setComments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  const resolveComment = async (commentId: string) => {
    try {
      // Use PATCH-like approach via a dedicated endpoint
      const res = await fetch(`/api/comments?id=${commentId}&action=resolve`, { method: 'PATCH' });
      if (res.ok) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
      }
    } catch {}
  };

  return { comments, loading, resolveComment, projectId };
}

// Badge that shows on each section in the canvas
export function SectionCommentBadge({ sectionIndex, pageIndex, comments }: {
  sectionIndex: number;
  pageIndex: number;
  comments: Comment[];
}) {
  const sectionComments = comments.filter(c =>
    c.section_index === sectionIndex &&
    c.page_index === pageIndex &&
    !c.parent_id &&
    !c.resolved
  );

  if (sectionComments.length === 0) return null;

  return (
    <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
      <MessageCircle size={10} />
      {sectionComments.length}
    </div>
  );
}

// Comments panel (right side drawer)
export function CommentsPanel({ comments, onResolve }: {
  comments: Comment[];
  onResolve: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');

  const activeProject = useBuilderStore(s => s.projects.find(p => p.id === s.activeProjectId));
  const pages = activeProject?.pages || [];
  const activePageId = activeProject?.activePageId;
  const activePageIndex = pages.findIndex(p => p.id === activePageId);

  const rootComments = comments.filter(c => !c.parent_id);
  const filtered = rootComments.filter(c => {
    if (filter === 'open') return !c.resolved;
    if (filter === 'resolved') return c.resolved;
    return true;
  });

  // Group by page
  const pageGroups = filtered.reduce((acc, c) => {
    const key = c.page_index;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {} as Record<number, Comment[]>);

  const unresolvedCount = rootComments.filter(c => !c.resolved).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  if (rootComments.length === 0) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-[70px] right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all ${
          open ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <MessageCircle size={13} />
        {unresolvedCount > 0 ? `${unresolvedCount} comment${unresolvedCount !== 1 ? 's' : ''}` : 'Comments'}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed top-[100px] right-4 w-80 max-h-[calc(100vh-120px)] bg-white border border-gray-200 rounded-xl shadow-xl z-30 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900">Comments</h3>
            <div className="flex items-center gap-1">
              {(['open', 'resolved', 'all'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors ${
                    filter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                {filter === 'open' ? 'No open comments' : filter === 'resolved' ? 'No resolved comments' : 'No comments'}
              </div>
            ) : (
              Object.entries(pageGroups).map(([pageIdx, pageComments]) => (
                <div key={pageIdx}>
                  {/* Page header */}
                  {Object.keys(pageGroups).length > 1 && (
                    <div className="px-4 py-1.5 bg-gray-50 text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      {pages[Number(pageIdx)]?.name || `Page ${Number(pageIdx) + 1}`}
                    </div>
                  )}

                  {pageComments.map(comment => {
                    const replies = comments.filter(c => c.parent_id === comment.id);

                    return (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        replies={replies}
                        onResolve={onResolve}
                        timeAgo={timeAgo}
                        isCurrentPage={Number(pageIdx) === activePageIndex}
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

function CommentItem({ comment, replies, onResolve, timeAgo, isCurrentPage }: {
  comment: Comment;
  replies: Comment[];
  onResolve: (id: string) => void;
  timeAgo: (d: string) => string;
  isCurrentPage: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-b border-gray-100 ${!isCurrentPage ? 'opacity-60' : ''}`}>
      <div className="px-4 py-3 flex items-start gap-2.5">
        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
          {comment.author_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-900">{comment.author_name}</span>
            <span className="text-[10px] text-gray-400">{timeAgo(comment.created_at)}</span>
            <span className="text-[10px] text-gray-300">· S{comment.section_index + 1}</span>
          </div>
          <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{comment.message}</p>

          {/* Replies toggle */}
          {replies.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-1.5 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
            >
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
            </button>
          )}
        </div>

        {/* Resolve button */}
        {!comment.resolved && (
          <button
            onClick={() => onResolve(comment.id)}
            title="Resolve"
            className="p-1 hover:bg-green-50 rounded text-gray-400 hover:text-green-600 flex-shrink-0"
          >
            <Check size={14} />
          </button>
        )}
        {comment.resolved && (
          <span className="text-[10px] text-green-600 font-medium flex-shrink-0">Resolved</span>
        )}
      </div>

      {/* Expanded replies */}
      {expanded && replies.map(reply => (
        <div key={reply.id} className="pl-12 pr-4 pb-2 flex items-start gap-2">
          <div className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0">
            {reply.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-gray-800">{reply.author_name}</span>
              <span className="text-[9px] text-gray-400">{timeAgo(reply.created_at)}</span>
            </div>
            <p className="text-[11px] text-gray-600">{reply.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
