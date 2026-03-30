'use client';

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

  return (
    <nav className="flex items-center justify-between px-8 py-5 max-w-[1100px] mx-auto">
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
        <Link href="/login" className="text-[14px] font-medium text-[#808080] hover:text-[#1a1a1a] transition-colors">
          Sign in
        </Link>
        <Link href="/signup" className="text-[14px] font-medium text-white bg-[#1a1a1a] hover:bg-[#333] px-5 py-2.5 rounded-xl transition-colors">
          Start your free project
        </Link>
      </div>
    </nav>
  );
}
