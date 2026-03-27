'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, X, Send, Check } from 'lucide-react';

interface Comment {
  id: string;
  project_id: string;
  page_index: number;
  section_index: number;
  element_selector: string | null;
  author_name: string;
  message: string;
  resolved: boolean;
  x_percent: number | null;
  y_percent: number | null;
  parent_id: string | null;
  created_at: string;
}

interface CommentSystemProps {
  projectId: string;
  activePage: number;
  sectionCount: number;
}

export default function CommentSystem({ projectId, activePage, sectionCount }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inspectMode, setInspectMode] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [hasSetName, setHasSetName] = useState(false);
  const [namePromptOpen, setNamePromptOpen] = useState(false);
  const [pendingClick, setPendingClick] = useState<{ sectionIndex: number; x: number; y: number; selector: string } | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Load saved name
  useEffect(() => {
    const saved = localStorage.getItem('structr-commenter-name');
    if (saved) {
      setAuthorName(saved);
      setHasSetName(true);
    }
  }, []);

  // Load comments
  useEffect(() => {
    fetch(`/api/comments?project=${projectId}`)
      .then(r => r.ok ? r.json() : [])
      .then(setComments)
      .catch(() => {});
  }, [projectId]);

  const pageComments = comments.filter(c => c.page_index === activePage && !c.parent_id);

  // Handle inspect mode hover
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!inspectMode) return;
    const main = document.querySelector('main');
    if (!main) return;

    const sections = main.querySelectorAll(':scope > div');
    let found = -1;
    sections.forEach((sec, i) => {
      const rect = sec.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        found = i;
      }
    });
    setHoveredSection(found >= 0 ? found : null);
  }, [inspectMode]);

  // Handle inspect mode click
  const handleClick = useCallback((e: MouseEvent) => {
    if (!inspectMode) return;
    e.preventDefault();
    e.stopPropagation();

    const main = document.querySelector('main');
    if (!main) return;

    const sections = main.querySelectorAll(':scope > div');
    let clickedSection = -1;
    let xPct = 0, yPct = 0;

    sections.forEach((sec, i) => {
      const rect = sec.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        clickedSection = i;
        xPct = ((e.clientX - rect.left) / rect.width) * 100;
        yPct = ((e.clientY - rect.top) / rect.height) * 100;
      }
    });

    if (clickedSection < 0) return;

    // Get element info
    const target = e.target as HTMLElement;
    const selector = target.tagName.toLowerCase() +
      (target.className ? '.' + target.className.split(' ').filter(c => c && !c.startsWith('@')).slice(0, 2).join('.') : '');

    const clickData = { sectionIndex: clickedSection, x: xPct, y: yPct, selector };

    if (!hasSetName) {
      setPendingClick(clickData);
      setNamePromptOpen(true);
    } else {
      setPendingClick(clickData);
      setShowPanel(true);
    }

    setInspectMode(false);
    setHoveredSection(null);
  }, [inspectMode, hasSetName]);

  useEffect(() => {
    if (inspectMode) {
      document.addEventListener('mousemove', handleMouseMove, true);
      document.addEventListener('click', handleClick, true);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove, true);
        document.removeEventListener('click', handleClick, true);
      };
    }
  }, [inspectMode, handleMouseMove, handleClick]);

  // Apply highlight overlay
  useEffect(() => {
    if (!inspectMode) {
      setHoveredSection(null);
      return;
    }
    document.body.style.cursor = 'crosshair';
    return () => { document.body.style.cursor = ''; };
  }, [inspectMode]);

  const saveName = (name: string) => {
    setAuthorName(name);
    setHasSetName(true);
    localStorage.setItem('structr-commenter-name', name);
    setNamePromptOpen(false);
    if (pendingClick) {
      setShowPanel(true);
    }
  };

  const submitComment = async () => {
    if (!newMessage.trim() || !pendingClick) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          page_index: activePage,
          section_index: pendingClick.sectionIndex,
          element_selector: pendingClick.selector,
          author_name: authorName,
          message: newMessage.trim(),
          x_percent: pendingClick.x,
          y_percent: pendingClick.y,
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
        setNewMessage('');
        setPendingClick(null);
        setShowPanel(false);
      }
    } catch (e) {
      console.error('Failed to post comment:', e);
    }
  };

  const handleReply = async (parentId: string, message: string) => {
    if (!authorName) {
      setNamePromptOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          page_index: activePage,
          section_index: 0,
          author_name: authorName,
          message,
          parent_id: parentId,
        }),
      });
      if (res.ok) {
        const reply = await res.json();
        setComments(prev => [...prev, reply]);
      }
    } catch (e) {
      console.error('Failed to post reply:', e);
    }
  };

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
    <>
      {/* Section highlight overlay */}
      {inspectMode && hoveredSection !== null && (
        <SectionHighlight sectionIndex={hoveredSection} />
      )}

      {/* Comment pins on sections */}
      {pageComments.map(comment => (
        <CommentPin
          key={comment.id}
          comment={comment}
          isSelected={selectedComment === comment.id}
          onClick={() => setSelectedComment(selectedComment === comment.id ? null : comment.id)}
        />
      ))}

      {/* Selected comment popup */}
      {selectedComment && pageComments.find(c => c.id === selectedComment) && (
        <CommentPopup
          comment={pageComments.find(c => c.id === selectedComment)!}
          allComments={comments}
          onClose={() => setSelectedComment(null)}
          onReply={handleReply}
        />
      )}

      {/* Floating comment button */}
      <button
        onClick={() => {
          if (inspectMode) {
            setInspectMode(false);
          } else {
            setInspectMode(true);
            setShowPanel(false);
            setSelectedComment(null);
          }
        }}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${
          inspectMode
            ? 'bg-blue-600 text-white scale-110'
            : 'bg-white text-gray-700 border border-gray-200 hover:shadow-xl hover:scale-105'
        }`}
        title={inspectMode ? 'Cancel comment' : 'Add a comment'}
      >
        {inspectMode ? <X size={20} /> : <MessageCircle size={20} />}
        {pageComments.length > 0 && !inspectMode && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {pageComments.length}
          </span>
        )}
      </button>

      {/* Inspect mode banner */}
      {inspectMode && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Click on a section to add a comment
        </div>
      )}

      {/* Name prompt modal */}
      {namePromptOpen && (
        <NamePrompt
          onSave={saveName}
          onCancel={() => { setNamePromptOpen(false); setPendingClick(null); }}
        />
      )}

      {/* Comment input panel */}
      {showPanel && pendingClick && (
        <div className="fixed bottom-20 right-6 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-900">{authorName}</span>
            </div>
            <button onClick={() => { setShowPanel(false); setPendingClick(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="p-3">
            <div className="text-[10px] text-gray-400 mb-2">
              Section {pendingClick.sectionIndex + 1} of {sectionCount}
            </div>
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Add your feedback..."
              rows={3}
              className="w-full text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={submitComment}
                disabled={!newMessage.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
              >
                <Send size={12} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments list toggle */}
      {pageComments.length > 0 && !inspectMode && !showPanel && (
        <button
          onClick={() => setShowPanel(false)}
          className="fixed bottom-6 right-20 bg-white border border-gray-200 rounded-full shadow-lg px-3 py-2 text-xs text-gray-600 hover:shadow-xl transition-all z-40"
        >
          {pageComments.length} comment{pageComments.length !== 1 ? 's' : ''}
        </button>
      )}
    </>
  );
}

// ── Sub-components ──

function SectionHighlight({ sectionIndex }: { sectionIndex: number }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const sections = main.querySelectorAll(':scope > div');
    const sec = sections[sectionIndex];
    if (sec) setRect(sec.getBoundingClientRect());
  }, [sectionIndex]);

  if (!rect) return null;

  return (
    <div
      className="fixed pointer-events-none z-40 border-2 border-blue-500 bg-blue-500/10 transition-all duration-100"
      style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
    >
      <div className="absolute -top-6 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-medium">
        Section {sectionIndex + 1}
      </div>
    </div>
  );
}

function CommentPin({ comment, isSelected, onClick }: { comment: Comment; isSelected: boolean; onClick: () => void }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const main = document.querySelector('main');
      if (!main) return;
      const sections = main.querySelectorAll(':scope > div');
      const sec = sections[comment.section_index];
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      setPos({
        top: rect.top + (comment.y_percent || 50) / 100 * rect.height + window.scrollY,
        left: rect.left + (comment.x_percent || 5) / 100 * rect.width,
      });
    };
    update();
    window.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [comment]);

  if (!pos) return null;

  return (
    <button
      onClick={onClick}
      className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md transition-all z-30 ${
        isSelected
          ? 'bg-blue-600 text-white scale-125'
          : comment.resolved
            ? 'bg-green-500 text-white'
            : 'bg-blue-600 text-white hover:scale-110'
      }`}
      style={{ top: pos.top - 14, left: pos.left - 14, position: 'absolute' }}
      title={`${comment.author_name}: ${comment.message}`}
    >
      {comment.author_name.charAt(0).toUpperCase()}
    </button>
  );
}

function CommentPopup({ comment, allComments, onClose, onReply }: {
  comment: Comment;
  allComments: Comment[];
  onClose: () => void;
  onReply: (parentId: string, message: string) => Promise<void>;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const replies = allComments.filter(c => c.parent_id === comment.id).sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const sections = main.querySelectorAll(':scope > div');
    const sec = sections[comment.section_index];
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    setPos({
      top: rect.top + (comment.y_percent || 50) / 100 * rect.height + window.scrollY + 20,
      left: Math.min(rect.left + (comment.x_percent || 5) / 100 * rect.width, window.innerWidth - 300),
    });
  }, [comment]);

  const handleReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setSending(false);
  };

  if (!pos) return null;

  const fmtTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className="absolute z-40 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
        style={{ top: pos.top, left: pos.left }}
      >
        {/* Original comment */}
        <div className="px-3 py-2.5 flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
              {comment.author_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-900">{comment.author_name}</span>
                <span className="text-[10px] text-gray-400">{fmtTime(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 mt-0.5">{comment.message}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1">
            <X size={14} />
          </button>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="border-t border-gray-100">
            {replies.map(reply => (
              <div key={reply.id} className="px-3 py-2 flex items-start gap-2 bg-gray-50/50">
                <div className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                  {reply.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-gray-800">{reply.author_name}</span>
                    <span className="text-[9px] text-gray-400">{fmtTime(reply.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{reply.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply input */}
        <div className="border-t border-gray-100 px-3 py-2 flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
            placeholder="Reply..."
            className="flex-1 text-xs text-gray-900 placeholder:text-gray-400 bg-gray-50 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
          <button
            onClick={handleReply}
            disabled={!replyText.trim() || sending}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-300"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

function NamePrompt({ onSave, onCancel }: { onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-xs p-5 shadow-2xl">
        <h3 className="text-base font-semibold text-gray-900 mb-1">What&apos;s your name?</h3>
        <p className="text-xs text-gray-500 mb-4">So the team knows who left the feedback</p>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()); }}
          placeholder="Your name"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 mb-3"
          autoFocus
        />
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
