'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#1a1a1a" />
    <path d="M7 7h14v14H7V7zm2 2v10h10V9H9z" fill="white" />
    <path d="M7 7l14 14M21 7L7 21" stroke="white" strokeWidth="1.5" />
  </svg>
);

const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#use-cases', label: 'Use Cases' },
  { href: '/changelog', label: 'Changelog' },
];

export default function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative max-w-[1100px] mx-auto px-8 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[20px] font-bold text-[#1a1a1a]">Structr</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[14px] font-medium transition-colors ${
                  pathname === link.href ? 'text-[#1a1a1a]' : 'text-[#808080] hover:text-[#1a1a1a]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-[14px] font-medium text-[#808080] hover:text-[#1a1a1a] transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="hidden sm:block text-[14px] font-medium text-white bg-[#1a1a1a] hover:bg-[#333] px-5 py-2.5 rounded-xl transition-colors">
            Start your free project
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 -mr-2 text-[#1a1a1a]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden mt-4 pb-4 border-t border-[#ebebeb] pt-4 flex flex-col gap-3">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`text-[15px] font-medium py-1 ${
                pathname === link.href ? 'text-[#1a1a1a]' : 'text-[#808080]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-[#f0f0f0] my-1" />
          <Link href="/login" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-[#808080] py-1">
            Sign in
          </Link>
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="text-[15px] font-medium text-white bg-[#1a1a1a] px-5 py-3 rounded-xl text-center mt-1"
          >
            Start your free project
          </Link>
        </div>
      )}
    </nav>
  );
}
