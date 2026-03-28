'use client';

import { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DashboardNav({ user }: { user: User }) {
  const { signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user.user_metadata?.full_name || user.email || 'U')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <nav className="flex items-center justify-between p-[16px] border-b border-[#efefef]">
      {/* Logo */}
      <div className="flex items-center gap-[10px]">
        <img src="/structr-logo.svg" alt="Structr" width={20} height={20} />
        <span className="text-[18px] font-medium leading-[16px] tracking-[-0.36px] text-[#34322d]">Structr</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-[12px]">
        {/* Notifications */}
        <button className="bg-[#efefef] flex items-center p-[8px] rounded-[8px] hover:bg-[#e6e6e6] transition-colors">
          <img src="/Notification.svg" alt="Notifications" width={16} height={16} />
        </button>

        {/* User avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-[32px] h-[32px] rounded-[8px] overflow-hidden bg-[#efefef] flex items-center justify-center text-[12px] font-medium text-[#34322d] hover:ring-2 hover:ring-[#efefef] transition-all"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-[40px] w-[200px] bg-white border border-[#efefef] rounded-[12px] shadow-lg py-1 z-50">
              <div className="px-[16px] py-[12px] border-b border-[#efefef]">
                <div className="text-[14px] font-medium text-[#34322d] truncate">
                  {user.user_metadata?.full_name || 'User'}
                </div>
                <div className="text-[12px] text-[#34322d] opacity-50 truncate">{user.email}</div>
              </div>
              <button
                onClick={() => {}}
                className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#34322d] hover:bg-[#f8f8f8]"
              >
                Settings
              </button>
              <button
                onClick={signOut}
                className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#34322d] opacity-60 hover:bg-[#f8f8f8]"
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
