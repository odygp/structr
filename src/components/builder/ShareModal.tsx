'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, UserPlus, Trash2, ChevronDown } from 'lucide-react';

interface Member {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  accepted_at: string | null;
}

interface ShareModalProps {
  projectId: string;
  onClose: () => void;
}

export default function ShareModal({ projectId, onClose }: ShareModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [yourRole, setYourRole] = useState<string>('owner');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [copied, setCopied] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  async function loadMembers() {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members || []);
      setYourRole(data.your_role || 'viewer');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/preview?project=${projectId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to invite');
        return;
      }
      setEmail('');
      loadMembers();
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(memberId: string) {
    await fetch(`/api/projects/${projectId}/members?memberId=${memberId}`, { method: 'DELETE' });
    loadMembers();
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    await fetch(`/api/projects/${projectId}/members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, role: newRole }),
    });
    loadMembers();
  }

  const isOwnerOrAdmin = yourRole === 'owner' || yourRole === 'admin';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-[16px] shadow-xl w-[440px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-[16px] font-semibold text-[#1c1c1c]">Share project</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#f5f5f5] rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-[#f5f4f2] rounded-[10px] hover:bg-[#edece9] transition-colors"
          >
            <span className="text-[13px] text-[#1c1c1c] truncate">
              {window.location.origin}/preview?project={projectId.substring(0, 8)}...
            </span>
            {copied ? (
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-[#808080] flex-shrink-0" />
            )}
          </button>

          {/* Invite form */}
          {isOwnerOrAdmin && (
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                placeholder="Invite by email..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-[13px] border border-[#e6e6e6] rounded-[10px] outline-none focus:border-[#1c1c1c]"
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'viewer' | 'editor' | 'admin')}
                className="px-2 py-2 text-[12px] border border-[#e6e6e6] rounded-[10px] bg-white outline-none"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={inviting || !email.trim()}
                className="px-3 py-2 bg-[#1c1c1c] text-white text-[13px] rounded-[10px] hover:bg-[#333] disabled:opacity-40"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          )}

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          {/* Members list */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-[#808080] uppercase tracking-wider px-1">
              Members ({members.length + 1})
            </span>

            {/* Owner (you, if owner) */}
            <div className="flex items-center justify-between px-3 py-2 rounded-[8px]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#1c1c1c] rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium">O</span>
                </div>
                <span className="text-[13px] text-[#1c1c1c]">You</span>
              </div>
              <span className="text-[11px] text-[#808080] bg-[#f5f4f2] px-2 py-0.5 rounded">
                {yourRole}
              </span>
            </div>

            {loading ? (
              <p className="text-[12px] text-[#808080] text-center py-3">Loading...</p>
            ) : (
              members.map(member => (
                <div key={member.id} className="flex items-center justify-between px-3 py-2 rounded-[8px] hover:bg-[#f9f9f9] group">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#e6e6e6] rounded-full flex items-center justify-center">
                      <span className="text-[10px] text-[#808080] font-medium">
                        {member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] text-[#1c1c1c]">{member.email}</span>
                      {!member.accepted_at && (
                        <span className="text-[10px] text-[#808080]">Pending invite</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOwnerOrAdmin ? (
                      <div className="relative">
                        <select
                          value={member.role}
                          onChange={e => handleRoleChange(member.id, e.target.value)}
                          className="text-[11px] text-[#808080] bg-[#f5f4f2] px-2 py-0.5 rounded border-none outline-none cursor-pointer appearance-none pr-5"
                        >
                          <option value="viewer">viewer</option>
                          <option value="editor">editor</option>
                          <option value="admin">admin</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-[#808080] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#808080] bg-[#f5f4f2] px-2 py-0.5 rounded">
                        {member.role}
                      </span>
                    )}
                    {yourRole === 'owner' && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[#fee] rounded transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
