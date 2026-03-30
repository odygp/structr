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
          <StarIcon size={13} /> 50 free stars included, no credit card needed
        </div>
        <h1 className="text-[56px] font-bold text-[#1a1a1a] leading-[1.05] tracking-[-0.03em] mb-5">
          Before Figma. Before Lovable.<br />Before code.
        </h1>
        <p className="text-[19px] text-[#666] max-w-[580px] mx-auto mb-10 leading-relaxed">
          Describe your site, import a URL, or drag sections by hand. Structr generates the pages, content, and structure so your design and dev tools have a clear blueprint to follow.
        </p>
        <div className="flex gap-4 justify-center mb-4">
          <Link
            href="/signup"
            className="px-10 py-4 text-[16px] font-semibold text-white bg-[#1a1a1a] hover:bg-[#333] rounded-2xl transition-all hover:shadow-lg"
          >
            Start your free project
          </Link>
          <Link
            href="/p/stripe-import"
            className="px-10 py-4 text-[16px] font-semibold text-[#1a1a1a] border border-[#e0e0e0] bg-white hover:bg-[#fafafa] rounded-2xl transition-all hover:shadow-sm"
          >
            See a live example
          </Link>
        </div>
        <p className="text-[12px] text-[#a0a0a0]">Used by designers, PMs, marketers, founders, and agencies</p>
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
            { number: '23', label: 'Section types available' },
            { number: '4', label: 'Ways to start a project' },
            { number: '27s', label: 'Avg. generation time' },
            { number: '1-click', label: 'Publish to a live URL' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-[28px] font-bold text-[#1a1a1a]">{s.number}</div>
              <div className="text-[13px] text-[#808080]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The Pre-Design Layer */}
      <section className="max-w-[900px] mx-auto px-8 py-20">
        <div className="bg-[#1a1a1a] rounded-3xl p-10 md:p-14">
          <div className="max-w-[700px] mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70 text-[12px] font-medium mb-6">
              The missing layer
            </div>
            <h2 className="text-[32px] font-bold text-white leading-[1.15] mb-5">
              The pre-design layer<br />your workflow is missing
            </h2>
            <p className="text-[16px] text-[#999] leading-relaxed mb-8">
              Design tools are for pixels. Code builders are for production. But before either, you need to decide <strong className="text-white">what pages, what sections, what content, and in what order</strong>. That&apos;s the hard part. Structr lets you figure this out by building manually, with AI, or both.
            </p>

            {/* Workflow diagram */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-center">
                <div className="text-[11px] text-white/50 mb-1">Step 1</div>
                <div className="text-[14px] font-semibold text-white">Structr</div>
                <div className="text-[11px] text-white/50 mt-1">Structure + Content</div>
              </div>
              <div className="text-white/30 text-[20px]">&rarr;</div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-[11px] text-white/30 mb-1">Step 2</div>
                <div className="text-[14px] font-medium text-white/60">Design tool</div>
                <div className="text-[11px] text-white/30 mt-1">Visual design</div>
              </div>
              <div className="text-white/30 text-[20px]">&rarr;</div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-[11px] text-white/30 mb-1">Step 3</div>
                <div className="text-[14px] font-medium text-white/60">Code builder</div>
                <div className="text-[11px] text-white/30 mt-1">Production site</div>
              </div>
            </div>

            {/* Cost comparison */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-[14px] font-semibold text-white mb-4">The cost of one wireframe round</div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-[11px] text-white/40 mb-1">Freelance designer</div>
                  <div className="text-[20px] font-bold text-white/70">$500+</div>
                  <div className="text-[11px] text-white/30">per wireframe round</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-[11px] text-white/40 mb-1">AI code builder</div>
                  <div className="text-[20px] font-bold text-white/70">$20-50</div>
                  <div className="text-[11px] text-white/30">/mo subscription</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-[11px] text-green-400/70 mb-1">Structr</div>
                  <div className="text-[20px] font-bold text-green-400">~$0.76</div>
                  <div className="text-[11px] text-green-400/50">generate + refine (~20 stars)</div>
                </div>
              </div>
              <p className="text-[12px] text-white/50 leading-relaxed">
                A typical wireframe round: generate a full project (10 stars), refine 5 sections with AI (5 stars), import a reference page (5 stars) = 20 stars. On the Pro plan that&apos;s about $0.76. On the free tier, your 50 stars cover 2-3 complete projects. Manual building is always free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who uses Structr */}
      <section id="use-cases" className="max-w-[900px] mx-auto px-8 py-20">
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">Built for every team that plans websites</h2>
        <p className="text-[16px] text-[#808080] text-center mb-12 max-w-[500px] mx-auto">Structr sits between your first idea and your design tool. Pick a role to see how it fits.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { role: 'UX Designers', desc: 'Map information architecture and page structure before you open Figma. Export wireframes directly into your design file.', href: '/for/designers' },
            { role: 'Product Managers', desc: 'Spec features as interactive wireframes instead of 12-page PRDs. Share a link, align engineering in one meeting.', href: '/for/product-managers' },
            { role: 'Marketing Teams', desc: 'Generate a campaign landing page in 30 seconds. Brief your agency or designer with an actual wireframe, not a bullet list.', href: '/for/marketers' },
            { role: 'Founders', desc: 'Turn the site in your head into a visual plan you can share with investors and cofounders. No designer required yet.', href: '/for/founders' },
            { role: 'Agencies', desc: 'Import a client\'s site, restructure it, and present a wireframe proposal before the first meeting ends.', href: '/for/agencies' },
            { role: 'Content Strategists', desc: 'See where every headline, body block, and CTA lives across every page. Plan content architecture visually, not in spreadsheets.', href: '/for/content-strategists' },
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
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">Four ways to start, zero blank-canvas anxiety</h2>
        <p className="text-[16px] text-[#808080] text-center mb-14 max-w-[550px] mx-auto">Drag sections by hand, let AI generate the whole site, import an existing URL, or answer a few questions in the wizard. Mix approaches on the same project.</p>
        <div className="grid grid-cols-2 gap-5">
          {[
            { title: 'Build by hand', desc: 'Start blank and pick from 23 section types: headers, heroes, features, pricing, FAQ, and more. Drag to reorder. Edit content inline. No AI, no stars.', tag: 'Free', tagColor: 'bg-gray-100 text-gray-700' },
            { title: 'Generate with AI', desc: 'Describe your site in one sentence. AI produces a multi-page wireframe with realistic copy, proper hierarchy, and the right section types for your business.', tag: '10 ★', tagColor: 'bg-blue-50 text-blue-700' },
            { title: 'Import any URL', desc: 'Paste a website address and Structr analyzes every page, then recreates the structure as editable wireframe sections you can rearrange and rewrite.', tag: '5 ★/page', tagColor: 'bg-purple-50 text-purple-700' },
            { title: 'Guided wizard', desc: 'Pick your industry, choose pages, add business details, set the tone. AI generates a tailored wireframe, then you refine it section by section.', tag: '5 ★/page', tagColor: 'bg-green-50 text-green-700' },
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
          <h2 className="text-[32px] font-bold text-white mb-4">Click to edit, or tell AI what to change</h2>
          <p className="text-[16px] text-[#999] mb-10 max-w-[520px] mx-auto">
            Edit any section&apos;s content inline. Or open the AI chat and say &ldquo;shorten the subtitle&rdquo; or &ldquo;add a CTA after features.&rdquo; One star per AI edit.
          </p>
          <div className="bg-[#2a2a2a] rounded-xl p-5 text-left max-w-[400px] mx-auto border border-[#333]">
            <div className="text-[12px] text-[#666] mb-3">AI Chat: Hero Section</div>
            <div className="bg-[#333] rounded-lg px-3 py-2 text-[13px] text-[#ccc] mb-2">Make the subtitle shorter</div>
            <div className="text-[12px] text-green-400">Changes applied. <span className="text-[#666]">1 ★</span></div>
          </div>
        </div>
      </section>

      {/* Feedback loop */}
      <section className="max-w-[900px] mx-auto px-8 py-20">
        <div className="grid grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[12px] font-medium mb-5">
              Now available
            </div>
            <h2 className="text-[32px] font-bold text-[#1a1a1a] leading-[1.15] mb-4">
              Client feedback,<br />auto-applied
            </h2>
            <p className="text-[15px] text-[#808080] leading-relaxed mb-6">
              Share your wireframe with clients. They leave comments like &ldquo;move pricing above testimonials&rdquo; or &ldquo;add a team section.&rdquo; Click one button and AI reads every comment, creates a plan, and applies the changes. Sections reorder, content updates, new blocks appear.
            </p>
            <div className="space-y-3">
              {[
                'Clients comment directly on the published wireframe',
                'AI reads all unresolved feedback and creates a change plan',
                'You review and approve, then changes apply instantly',
                'New version created automatically for rollback safety',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13px] text-[#666]">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* Visual mockup of the feedback flow */}
          <div className="bg-[#f5f5f5] rounded-2xl p-6">
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-[#ebebeb]">
                <div className="text-[11px] text-[#a0a0a0] mb-1">Client comment</div>
                <div className="text-[13px] text-[#1a1a1a]">&ldquo;Move the pricing section above testimonials&rdquo;</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-[#ebebeb]">
                <div className="text-[11px] text-[#a0a0a0] mb-1">Client comment</div>
                <div className="text-[13px] text-[#1a1a1a]">&ldquo;Add a section about our team&rdquo;</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-[#ebebeb]">
                <div className="text-[11px] text-[#a0a0a0] mb-1">Client comment</div>
                <div className="text-[13px] text-[#1a1a1a]">&ldquo;Hero should mention the free trial&rdquo;</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
                <div className="text-[12px] font-semibold text-purple-700 mb-2">AI Plan (3 changes)</div>
                <div className="text-[11px] text-purple-600 space-y-1">
                  <div>1. Reorder: pricing &rarr; position 3 (was 5)</div>
                  <div>2. Add: team section after about</div>
                  <div>3. Edit: hero subtitle to mention free trial</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="bg-purple-600 text-white text-[11px] font-medium px-3 py-1.5 rounded-md">Apply all</div>
                  <div className="bg-white text-purple-600 text-[11px] font-medium px-3 py-1.5 rounded-md border border-purple-200">Review each</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="max-w-[900px] mx-auto px-8 py-20">
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-14">Wireframe faster without cutting corners</h2>
        <div className="grid grid-cols-3 gap-5">
          {[
            { title: 'Works without AI', desc: 'Build wireframes entirely by hand from the section catalog. Drag, reorder, edit content inline. AI is a power tool, not a requirement.' },
            { title: '23 section types', desc: 'Headers, heroes, features, pricing, testimonials, FAQ, CTA, blog, gallery, store, and 13 more. Each type has multiple layout variants.' },
            { title: 'Publish in one click', desc: 'Generates a clean /p/your-project URL. Share with clients, stakeholders, or your team to collect comments directly on the wireframe.' },
            { title: 'Version history', desc: 'Save snapshots before risky changes. Every publish creates a checkpoint. Roll back to any previous version in two clicks.' },
            { title: 'Team collaboration', desc: 'Invite members as viewers, editors, or admins. The activity feed tracks who changed what, so you never lose context.' },
            { title: 'Export to Figma, HTML, JSON', desc: 'Hand off your wireframe structure to any design tool or code builder. The content hierarchy and section order carry over.' },
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
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">Pay for AI when you use it. Build by hand for free.</h2>
        <p className="text-[16px] text-[#808080] text-center mb-14">Stars are Structr&apos;s currency. Manual building costs nothing. AI actions cost 1-10 stars each.</p>
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
              <li>~5 full project generations</li>
              <li>~10 page imports</li>
              <li>~50 AI section edits</li>
              <li>Publish to public URL</li>
              <li>Export to Figma, HTML, JSON</li>
            </ul>
            <Link href="/signup" className="block text-center px-6 py-3 text-[14px] font-medium text-[#1a1a1a] border border-[#e0e0e0] rounded-xl hover:bg-[#fafafa] transition-colors">
              Start your free project
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-white border-2 border-[#1a1a1a] rounded-2xl p-7 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[11px] font-medium px-3 py-1 rounded-full">Most popular</div>
            <div className="text-[13px] font-medium text-[#808080] mb-1">Pro</div>
            <div className="text-[36px] font-bold text-[#1a1a1a] mb-1">$19</div>
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
              <li>All Free features included</li>
              <li>Priority AI models</li>
              <li>Remove Structr badge</li>
            </ul>
            <Link href="/signup" className="block text-center px-6 py-3 text-[14px] font-medium text-white bg-[#1a1a1a] hover:bg-[#333] rounded-xl transition-colors">
              Upgrade to Pro
            </Link>
          </div>

          {/* Team */}
          <div className="bg-white border border-[#ebebeb] rounded-2xl p-7">
            <div className="text-[13px] font-medium text-[#808080] mb-1">Team</div>
            <div className="text-[36px] font-bold text-[#1a1a1a] mb-1">$49</div>
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
              <li>All Pro features included</li>
              <li>Unlimited team members</li>
              <li>Custom domains</li>
            </ul>
            <Link href="/signup" className="block text-center px-6 py-3 text-[14px] font-medium text-[#1a1a1a] border border-[#e0e0e0] rounded-xl hover:bg-[#fafafa] transition-colors">
              Start with Team
            </Link>
          </div>
        </div>
        <p className="text-[13px] text-[#a0a0a0] text-center mt-6">All plans include: version history, team collaboration, Figma export, and public publishing.</p>
      </section>

      {/* Comparison */}
      <section className="max-w-[900px] mx-auto px-8 py-20">
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">Structr vs. existing wireframe tools</h2>
        <p className="text-[16px] text-[#808080] text-center mb-10 max-w-[550px] mx-auto">The only tool that combines AI generation, website import, section-based building, and one-click publishing in a single workflow.</p>
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
        <h2 className="text-[32px] font-bold text-[#1a1a1a] text-center mb-4">Real projects, published in minutes</h2>
        <p className="text-[16px] text-[#808080] text-center mb-10">Click through live wireframes built with Structr. Each one took under 2 minutes to create.</p>
        <div className="grid grid-cols-2 gap-5">
          {[
            { name: 'Stripe Import', desc: 'Stripe.com pricing page, imported and recreated as editable wireframe sections', slug: 'stripe-import' },
            { name: 'Bean & Brew Coffee Shop', desc: 'Generated from one prompt: "A coffee shop landing page with menu, about, and contact"', slug: 'bean-brew-coffee-shop' },
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
          <h2 className="text-[36px] font-bold text-white mb-4">Your next wireframe is 30 seconds away</h2>
          <p className="text-[16px] text-[#999] mb-8">
            50 free stars. No credit card. Cancel anytime.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 text-[16px] font-semibold text-[#1a1a1a] bg-white hover:bg-[#f0f0f0] rounded-2xl transition-all"
          >
            Start your free project
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
