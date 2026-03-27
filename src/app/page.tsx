'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/dashboard';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#1a1a1a" />
            <path d="M7 7h14v14H7V7zm2 2v10h10V9H9z" fill="white" />
            <path d="M7 7l14 14M21 7L7 21" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Structr</h1>
        <p className="text-gray-500 mb-8">Build wireframes with AI-powered sections</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
