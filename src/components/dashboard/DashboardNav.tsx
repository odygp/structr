'use client';

import { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '@/lib/hooks/useAuth';
import { Bell } from 'lucide-react';

export default function DashboardNav({ user }: { user: User }) {
  const { signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user.user_metadata?.full_name || user.email || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="6" fill="#1a1a1a" />
          <path d="M7 7h14v14H7V7zm2 2v10h10V9H9z" fill="white" />
          <path d="M7 7l14 14M21 7L7 21" stroke="white" strokeWidth="1.5" />
        </svg>
        <span className="text-base font-semibold text-gray-900">Structr</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
          <Bell size={18} />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 hover:ring-2 hover:ring-gray-200 transition-all"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.user_metadata?.full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
              <button
                onClick={() => { /* TODO: settings page */ }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Settings
              </button>
              <button
                onClick={signOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
