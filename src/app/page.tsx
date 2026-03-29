'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

const StarIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`inline-block ${className}`}>
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
      <MarketingNav />

      {/* Hero */}
      <section className="text-center pt-24 pb-20 px-8 max-w-[850px] mx-auto">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[13px] font-medium mb-8">
          <StarIcon size={13} /> 50 free stars included — no credit card needed
        </div>
        <h1 className="text-[56px] font-bold text-[#1a1a1a] leading-[1.05] tracking-[-0.03em] mb-5">
          From idea to wireframe<br />in 30 seconds
        </h1>
        <p className="text-[19px] text-[#666] max-w-[560px] mx-auto mb-10 leading-relaxed">
          Plan your website&apos;s structure and content before touching design tools. AI generates section-based wireframes from a prompt, a URL, or a sitemap.
        </p>
        <div className="flex gap-4 justify-center mb-4">
          <Link
            href="/signup"
            className="px-10 py-4 text-[16px] font-semibold text-white bg-[#1a1a1a] hover:bg-[#333] rounded-2xl transition-all hover:shadow-lg"
          >
            Start building for free
          </Link>
          <Link
            href="/p/stripe-import"
            className="px-10 py-4 text-[16px] font-semibold text-[#1a1a1a] border border-[#e0e0e0] bg-white hover:bg-[#fafafa] rounded-2xl transition-all hover:shadow-sm"
          >
            See a live example
          </Link>
        </div>
        <p className="text-[12px] text-[#a0a0a0]">For designers, product managers, marketers, founders, and agencies</p>
      </section>

      {/* Mock wireframe preview */}
      <section className="max-w-[800px] mx-auto px-8 pb-20">
        <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-sm overflow-hidden">
          {/* Fake browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#e5e5e5]" />
              <div className="w-3 h-3 rounded-full bg-[#e5e5e5]" />
              <div className="w-3 h-3 rounded-full bg-[#e5e5e5]" />
            </div>
            <div className="flex-1 bg-[#f0f0f0] rounded-md h-6 mx-8" />
          </div>
          {/* Fake wireframe sections */}
          <div className="p-6 flex flex-col gap-3">
            <div className="h-10 bg-[#1a1a1a] rounded-lg w-full" />
            <div className="h-40 bg-[#2d2d2d] rounded-lg w-full flex items-center justify-center">
              <div className="text-center">
                <div className="h-5 bg-white/20 rounded w-48 mx-auto mb-2" />
                <div className="h-3 bg-white/10 rounded w-64 mx-auto mb-3" />
                <div className="h-8 bg-white/15 rounded-lg w-24 mx-auto" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-24 bg-[#9ca3af] rounded-lg" />
              <div className="h-24 bg-[#9ca3af] rounded-lg" />
              <div className="h-24 bg-[#9ca3af] rounded-lg" />
            </div>
            <div className="h-20 bg-[#d1d5db] rounded-lg" />
            <div className="h-8 bg-[#e5e7eb] rounded-lg" />
          </div>
        </div>
      </section>

      {/* Social proof / numbers */}
      <section className="border-y border-[#ebebeb] bg-white py-12">
        <div className="max-w-[800px] mx-auto px-8 grid grid-cols-4 gap-8 text-center">
          {[
            { number: '20+', label: 'Section types' },
            { number: '4', label: 'Import methods' },
            { number: '30s', label: 'Avg. generation time' },
            { number: '1-click', label: 'Publish' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-[28px] font-bold text-[#1a1a1a]">{s.number}</div>
              <div className="text-[13px] text-[#808080]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Who uses Structr */}
      <section className="max-w-[900px] mx-auto px-8 py-20">
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">Built for every team that plans websites</h2>
        <p className="text-[16px] text-[#808080] text-center mb-12 max-w-[500px] mx-auto">From first idea to design handoff — Structr fits into your workflow.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { role: 'UX Designers', desc: 'Plan information architecture and page structure before opening Figma. Export wireframes directly to your design tool.', href: '/for/designers' },
            { role: 'Product Managers', desc: 'Spec out features visually instead of writing long docs. Share interactive wireframes with engineering to align faster.', href: '/for/product-managers' },
            { role: 'Marketing Teams', desc: 'Plan landing pages and campaign sites in minutes. Brief agencies with actual wireframes instead of vague descriptions.', href: '/for/marketers' },
            { role: 'Founders', desc: 'Go from idea to visual plan instantly. Show investors and cofounders what you\'re building before hiring a designer.', href: '/for/founders' },
            { role: 'Agencies', desc: 'Win more pitches with rapid wireframe proposals. Import competitor sites for analysis. Iterate in client meetings.', href: '/for/agencies' },
            { role: 'Content Strategists', desc: 'Map out content architecture across pages. Plan what copy goes where before writing a single word.', href: '/for/content-strategists' },
          ].map(p => (
            <Link key={p.role} href={p.href} className="bg-white border border-[#ebebeb] rounded-2xl p-6 hover:shadow-md hover:border-[#d0d0d0] transition-all group">
              <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-2 group-hover:underline">{p.role}</h3>
              <p className="text-[13px] text-[#808080] leading-relaxed">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-[900px] mx-auto px-8 py-20">
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">Plan your site structure, fast</h2>
        <p className="text-[16px] text-[#808080] text-center mb-14 max-w-[500px] mx-auto">Whether you&apos;re starting from scratch, analyzing a competitor, or working from an existing sitemap.</p>
        <div className="grid grid-cols-2 gap-5">
          {[
            { title: 'Prompt to wireframe', desc: 'Type "a SaaS landing page with pricing and testimonials" and get a full multi-page wireframe in seconds. AI picks the right sections, writes real copy, and structures everything.', tag: '10 ★', tagColor: 'bg-blue-50 text-blue-700' },
            { title: 'Clone any website', desc: 'Paste a URL like stripe.com and we analyze every page — header, hero, features, pricing, footer. Then recreate it as editable wireframe sections you can customize.', tag: '5 ★/page', tagColor: 'bg-purple-50 text-purple-700' },
            { title: 'Guided setup wizard', desc: 'Pick your industry (SaaS, restaurant, agency...), choose pages, add your business details, set the tone. AI generates a tailored multi-page site that actually fits your brand.', tag: '5 ★/page', tagColor: 'bg-green-50 text-green-700' },
            { title: 'Import from Octopus.do', desc: 'Export your sitemap from Octopus.do and import it. We read every page name, description, and SEO data, then generate matching wireframe sections automatically.', tag: '3 ★/page', tagColor: 'bg-amber-50 text-amber-700' },
          ].map(c => (
            <div key={c.title} className="bg-white border border-[#ebebeb] rounded-2xl p-7 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[17px] font-semibold text-[#1a1a1a]">{c.title}</h3>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.tagColor}`}>{c.tag}</span>
              </div>
              <p className="text-[13px] text-[#808080] leading-[1.7]">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI editing */}
      <section className="bg-[#1a1a1a] py-20">
        <div className="max-w-[700px] mx-auto px-8 text-center">
          <h2 className="text-[32px] font-bold text-white mb-4">Edit every section with AI chat</h2>
          <p className="text-[16px] text-[#999] mb-10 max-w-[500px] mx-auto">
            Click any section and tell AI what to change. Refine copy, restructure content, add CTAs. Iterate on your UX without pixel-pushing.
          </p>
          <div className="bg-[#2a2a2a] rounded-xl p-5 text-left max-w-[400px] mx-auto border border-[#333]">
            <div className="text-[12px] text-[#666] mb-3">AI Support — Hero Section</div>
            <div className="bg-[#333] rounded-lg px-3 py-2 text-[13px] text-[#ccc] mb-2">Make the subtitle shorter</div>
            <div className="text-[12px] text-green-400">Changes applied. <span className="text-[#666]">1 ★</span></div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-[900px] mx-auto px-8 py-20">
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-14">Everything you need to wireframe fast</h2>
        <div className="grid grid-cols-3 gap-5">
          {[
            { title: 'Version history', desc: 'Save snapshots, restore any version. Every publish creates a checkpoint you can roll back to.' },
            { title: 'Multi-page projects', desc: 'Build complete sites with Home, About, Pricing, Contact — all in one project with page-level navigation.' },
            { title: 'Publish instantly', desc: 'One click publishes to a clean /p/your-project URL. Share with clients, stakeholders, or your team.' },
            { title: 'Team collaboration', desc: 'Invite members as viewers, editors, or admins. Activity feed tracks every change across collaborators.' },
            { title: 'Export everywhere', desc: 'Export to HTML, JSON, or Figma. Use the Figma plugin to import directly into your design workflow.' },
            { title: '20+ section types', desc: 'Headers, heroes, features, pricing, testimonials, FAQ, CTA, footer, and more. Each with multiple variants.' },
          ].map(f => (
            <div key={f.title} className="p-5">
              <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-2">{f.title}</h3>
              <p className="text-[13px] text-[#808080] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-[900px] mx-auto px-8 py-20">
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-[16px] text-[#808080] text-center mb-14">Start free. Upgrade when you need more.</p>
        <div className="grid grid-cols-3 gap-5">
          {/* Free */}
          <div className="bg-white border border-[#ebebeb] rounded-2xl p-7">
            <div className="text-[13px] font-medium text-[#808080] mb-1">Free</div>
            <div className="text-[36px] font-bold text-[#1a1a1a] mb-1">$0</div>
            <div className="text-[13px] text-[#a0a0a0] mb-6">forever</div>
            <div className="flex items-center gap-1.5 mb-6">
              <span className="text-[20px] font-bold text-[#1a1a1a]">50</span>
              <StarIcon size={18} />
              <span className="text-[13px] text-[#808080]">stars included</span>
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#666] mb-8">
              <li>~5 project generations</li>
              <li>~10 page imports</li>
              <li>~50 AI section edits</li>
              <li>Publish to public URL</li>
              <li>Export HTML / JSON / Figma</li>
            </ul>
            <Link href="/signup" className="block text-center px-6 py-3 text-[14px] font-medium text-[#1a1a1a] border border-[#e0e0e0] rounded-xl hover:bg-[#fafafa] transition-colors">
              Get started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-7 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[11px] font-medium px-3 py-1 rounded-full">Most popular</div>
            <div className="text-[13px] font-medium text-[#808080] mb-1">Pro</div>
            <div className="text-[36px] font-bold text-[#1a1a1a] mb-1">$20</div>
            <div className="text-[13px] text-[#a0a0a0] mb-6">/month</div>
            <div className="flex items-center gap-1.5 mb-6">
              <span className="text-[20px] font-bold text-[#1a1a1a]">500</span>
              <StarIcon size={18} />
              <span className="text-[13px] text-[#808080]">stars/month</span>
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#666] mb-8">
              <li>~50 project generations</li>
              <li>~100 page imports</li>
              <li>~500 AI section edits</li>
              <li>Everything in Free</li>
              <li>Priority AI models</li>
              <li>Remove Structr badge</li>
            </ul>
            <div className="block text-center px-6 py-3 text-[14px] font-medium text-white bg-[#1a1a1a] rounded-xl opacity-60 cursor-not-allowed">
              Coming soon
            </div>
          </div>

          {/* Team */}
          <div className="bg-white border border-[#ebebeb] rounded-2xl p-7">
            <div className="text-[13px] font-medium text-[#808080] mb-1">Team</div>
            <div className="text-[36px] font-bold text-[#1a1a1a] mb-1">$50</div>
            <div className="text-[13px] text-[#a0a0a0] mb-6">/month</div>
            <div className="flex items-center gap-1.5 mb-6">
              <span className="text-[20px] font-bold text-[#1a1a1a]">1500</span>
              <StarIcon size={18} />
              <span className="text-[13px] text-[#808080]">stars/month</span>
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#666] mb-8">
              <li>~150 project generations</li>
              <li>~300 page imports</li>
              <li>~1500 AI section edits</li>
              <li>Everything in Pro</li>
              <li>Unlimited team members</li>
              <li>Custom domains</li>
            </ul>
            <div className="block text-center px-6 py-3 text-[14px] font-medium text-[#1a1a1a] border border-[#e0e0e0] rounded-xl opacity-60 cursor-not-allowed">
              Coming soon
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-[900px] mx-auto px-8 py-20">
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">How Structr compares</h2>
        <p className="text-[16px] text-[#808080] text-center mb-10 max-w-[550px] mx-auto">AI-powered wireframing that gets you from idea to structure in seconds, not hours of dragging boxes.</p>
        <div className="bg-white border border-[#ebebeb] rounded-2xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#ebebeb]">
                <th className="text-left px-6 py-4 text-[#808080] font-medium" />
                <th className="text-center px-4 py-4 text-[#1a1a1a] font-semibold bg-[#fafafa]">Structr</th>
                <th className="text-center px-4 py-4 text-[#808080] font-medium">Balsamiq</th>
                <th className="text-center px-4 py-4 text-[#808080] font-medium">Whimsical</th>
                <th className="text-center px-4 py-4 text-[#808080] font-medium">Relume</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {[
                ['AI generates full wireframes', 'Y', 'N', 'Partial', 'Y'],
                ['Website import & analysis', 'Y', 'N', 'N', 'N'],
                ['Section-based building', 'Y', 'N', 'N', 'Y'],
                ['AI content writing', 'Y', 'N', 'N', 'Y'],
                ['Multi-page sitemaps', 'Y', 'N', 'Y', 'Y'],
                ['Publish & share link', 'Y', 'N', 'Y', 'Y'],
                ['Figma export', 'Y', 'Y', 'Y', 'Y'],
                ['Team collaboration', 'Y', 'Y', 'Y', 'Y'],
                ['Free tier', '50 stars', '$0 (2 projects)', '$0 (3 files)', 'None'],
              ].map(([feature, ...values], i) => (
                <tr key={i} className="border-b border-[#f0f0f0] last:border-0">
                  <td className="px-6 py-3 text-[#1a1a1a] font-medium">{feature}</td>
                  {values.map((v, j) => (
                    <td key={j} className={`text-center px-4 py-3 ${j === 0 ? 'bg-[#fafafa] font-medium text-[#1a1a1a]' : 'text-[#808080]'}`}>
                      {v === 'Y' ? <span className="text-green-600">&#10003;</span> : v === 'N' ? <span className="text-[#d0d0d0]">-</span> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Showcase */}
      <section className="max-w-[900px] mx-auto px-8 pb-20">
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">See it in action</h2>
        <p className="text-[16px] text-[#808080] text-center mb-10">Real projects built with Structr, published in minutes.</p>
        <div className="grid grid-cols-2 gap-5">
          {[
            { name: 'Stripe Import', desc: 'Full Stripe.com pricing page cloned via website import', slug: 'stripe-import' },
            { name: 'Bean & Brew Coffee Shop', desc: 'Generated from a single prompt: "A coffee shop landing page"', slug: 'bean-brew-coffee-shop' },
          ].map(p => (
            <Link key={p.slug} href={`/p/${p.slug}`} className="group bg-white border border-[#ebebeb] rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="h-24 bg-[#f5f5f5] rounded-lg mb-4 flex items-center justify-center text-[#a0a0a0] text-[12px] group-hover:bg-[#f0f0f0] transition-colors">
                Live preview &rarr;
              </div>
              <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-1">{p.name}</h3>
              <p className="text-[13px] text-[#808080]">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#1a1a1a] py-20">
        <div className="max-w-[600px] mx-auto px-8 text-center">
          <h2 className="text-[36px] font-bold text-white mb-4">Ready to build?</h2>
          <p className="text-[16px] text-[#999] mb-8">
            Join UX designers and product teams who plan their sites 10x faster. Free to start, no credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 text-[16px] font-semibold text-[#1a1a1a] bg-white hover:bg-[#f0f0f0] rounded-2xl transition-all"
          >
            Start building for free
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
