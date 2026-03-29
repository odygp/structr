import Link from 'next/link';

const Logo = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#1a1a1a" />
    <path d="M7 7h14v14H7V7zm2 2v10h10V9H9z" fill="white" />
    <path d="M7 7l14 14M21 7L7 21" stroke="white" strokeWidth="1.5" />
  </svg>
);

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Example Project', href: '/p/stripe-import' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Get Started', href: '/signup' },
      { label: 'Sign In', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-[#ebebeb] py-12 px-8 bg-white">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-4 gap-8 mb-10">
          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <Logo />
              <span className="text-[16px] font-semibold text-[#1a1a1a]">Structr</span>
            </Link>
            <p className="text-[13px] text-[#808080] leading-relaxed">
              AI-powered wireframe builder. From idea to published site in minutes.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map(section => (
            <div key={section.title}>
              <h4 className="text-[13px] font-semibold text-[#1a1a1a] mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[13px] text-[#808080] hover:text-[#1a1a1a] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#f0f0f0] pt-6 flex items-center justify-between">
          <p className="text-[12px] text-[#a0a0a0]">&copy; {new Date().getFullYear()} Structr. All rights reserved.</p>
          <p className="text-[12px] text-[#a0a0a0]">Built with AI, for builders.</p>
        </div>
      </div>
    </footer>
  );
}
