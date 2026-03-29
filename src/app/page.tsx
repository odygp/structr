'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

const StarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="inline-block">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

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
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-[1100px] mx-auto">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#1a1a1a" />
            <path d="M7 7h14v14H7V7zm2 2v10h10V9H9z" fill="white" />
            <path d="M7 7l14 14M21 7L7 21" stroke="white" strokeWidth="1.5" />
          </svg>
          <span className="text-[18px] font-semibold text-[#1a1a1a]">Structr</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[14px] font-medium text-[#808080] hover:text-[#1a1a1a] transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="text-[14px] font-medium text-white bg-[#1a1a1a] hover:bg-[#333] px-4 py-2 rounded-lg transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center pt-20 pb-16 px-8 max-w-[800px] mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[12px] font-medium mb-6">
          <StarIcon size={12} /> 50 free stars to get started
        </div>
        <h1 className="text-[48px] font-bold text-[#1a1a1a] leading-[1.1] tracking-tight mb-4">
          Build wireframes<br />with AI in minutes
        </h1>
        <p className="text-[18px] text-[#808080] max-w-[500px] mx-auto mb-8">
          Describe your website, import an existing one, or use our guided setup. AI generates professional wireframe sections instantly.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3.5 text-[15px] font-medium text-white bg-[#1a1a1a] hover:bg-[#333] rounded-xl transition-colors"
          >
            Start building for free
          </Link>
          <Link
            href="/p/stripe-import"
            className="px-8 py-3.5 text-[15px] font-medium text-[#1a1a1a] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] rounded-xl transition-colors"
          >
            See an example
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[900px] mx-auto px-8 py-16">
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: '>', title: 'AI Generation', desc: 'Describe your site and AI generates full wireframes with headers, heroes, features, pricing, and more.' },
            { icon: '<', title: 'Website Import', desc: 'Paste any URL and we analyze its structure, then recreate it as editable wireframe sections.' },
            { icon: '/', title: 'Guided Setup', desc: '4-step wizard: pick your category, select pages, add details, and generate a complete multi-page site.' },
          ].map(f => (
            <div key={f.title} className="bg-white border border-[#ebebeb] rounded-2xl p-6">
              <div className="w-10 h-10 bg-[#f5f5f5] rounded-lg flex items-center justify-center text-[18px] font-mono text-[#1a1a1a] mb-4">{f.icon}</div>
              <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">{f.title}</h3>
              <p className="text-[13px] text-[#808080] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[900px] mx-auto px-8 py-16">
        <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center mb-12">How it works</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Describe', desc: 'Tell AI what you want to build, or paste a URL to import' },
            { step: '2', title: 'Generate', desc: 'AI creates wireframe sections with real content and structure' },
            { step: '3', title: 'Publish', desc: 'Edit with AI chat, then publish to a clean shareable URL' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center text-[16px] font-bold mx-auto mb-4">{s.step}</div>
              <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">{s.title}</h3>
              <p className="text-[13px] text-[#808080]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="max-w-[500px] mx-auto px-8 py-16">
        <div className="bg-white border border-[#ebebeb] rounded-2xl p-8 text-center">
          <h2 className="text-[22px] font-bold text-[#1a1a1a] mb-2">Free to start</h2>
          <p className="text-[14px] text-[#808080] mb-6">Every account gets 50 free stars. No credit card required.</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-[36px] font-bold text-[#1a1a1a]">50</span>
            <StarIcon size={28} />
          </div>
          <div className="text-[12px] text-[#a0a0a0] space-y-1 mb-6">
            <p>~5 full project generations</p>
            <p>~10 page imports</p>
            <p>~50 AI section edits</p>
          </div>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 text-[14px] font-medium text-white bg-[#1a1a1a] hover:bg-[#333] rounded-xl transition-colors"
          >
            Get started free
          </Link>
          <p className="text-[11px] text-[#a0a0a0] mt-4">Pro plans coming soon</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ebebeb] py-8 px-8">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#1a1a1a" />
              <path d="M7 7h14v14H7V7zm2 2v10h10V9H9z" fill="white" />
              <path d="M7 7l14 14M21 7L7 21" stroke="white" strokeWidth="1.5" />
            </svg>
            <span className="text-[13px] text-[#808080]">Structr</span>
          </div>
          <p className="text-[12px] text-[#a0a0a0]">Built with AI, for builders.</p>
        </div>
      </footer>
    </div>
  );
}
