import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free to start with 50 stars. Pro $19/mo, Team $49/mo. Pay for AI when you use it, build wireframes by hand for free.',
  openGraph: { title: 'Pricing | Structr', description: 'Free to start with 50 stars. Pro $19/mo, Team $49/mo. Pay for AI when you use it, build wireframes by hand for free.' },
};

const StarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="inline-block">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const Check = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3L6 11.6 2.7 8.3" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Dash = () => <span className="text-[#d0d0d0]">-</span>;

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    stars: 50,
    starsLabel: 'stars included',
    cta: 'Start your free project',
    ctaHref: '/signup',
    ctaStyle: 'border border-[#e0e0e0] text-[#1a1a1a] hover:bg-[#fafafa]',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    stars: 500,
    starsLabel: 'stars/month',
    cta: 'Upgrade to Pro',
    ctaHref: '/signup',
    ctaStyle: 'bg-[#1a1a1a] text-white hover:bg-[#333]',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    stars: 1500,
    starsLabel: 'stars/month',
    cta: 'Start with Team',
    ctaHref: '/signup',
    ctaStyle: 'border border-[#e0e0e0] text-[#1a1a1a] hover:bg-[#fafafa]',
    highlight: false,
  },
];

const FEATURES = [
  { name: 'AI project generation', free: true, pro: true, team: true },
  { name: 'Website import', free: true, pro: true, team: true },
  { name: 'Guided setup wizard', free: true, pro: true, team: true },
  { name: 'Octopus.do import', free: true, pro: true, team: true },
  { name: 'AI section editing', free: true, pro: true, team: true },
  { name: 'Publish to public URL', free: true, pro: true, team: true },
  { name: 'Export (HTML, JSON, Figma)', free: true, pro: true, team: true },
  { name: 'Version history', free: true, pro: true, team: true },
  { name: 'Team collaboration', free: true, pro: true, team: true },
  { name: 'Remove "Built with Structr" badge', free: false, pro: true, team: true },
  { name: 'Priority AI models', free: false, pro: true, team: true },
  { name: 'Unlimited team members', free: false, pro: false, team: true },
  { name: 'Custom domains', free: false, pro: false, team: true },
  { name: 'API access', free: false, pro: false, team: true },
];

const FAQ = [
  { q: 'What are stars and how do they work?', a: 'Stars are Structr\'s currency for AI actions. Generating a project costs 10, importing a page costs 5, and editing a section with AI costs 1. You see the cost before every action. Manual building is always free.' },
  { q: 'What happens when I run out of stars?', a: 'AI features pause. Manual editing, section rearranging, publishing, and exporting all keep working. Your projects and published sites stay accessible. Upgrade or wait for your monthly refill on paid plans.' },
  { q: 'How far do 50 stars go?', a: 'About 5 full project generations, or 10 page imports, or 50 AI section edits. A typical project with AI generation plus a few refinements costs 15-20 stars.' },
  { q: 'Can I use Structr without AI?', a: 'Completely. Create blank projects, add sections from the catalog by hand, edit content inline, publish, and export. AI is optional. The only things that cost stars are AI-powered actions.' },
  { q: 'Do unused stars roll over?', a: 'On the free tier, your 50 stars never expire. On paid plans, unused stars roll over for one billing cycle.' },
  { q: 'Can I cancel or downgrade anytime?', a: 'Cancel from your account settings. Your plan stays active until the end of the billing period, then reverts to Free. Your projects and published sites are not deleted.' },
  { q: 'Is my data private?', a: 'Projects are private by default. Only you and invited team members can view them. Published wireframes are publicly accessible at their URL. We never sell your data.' },
  { q: 'Can I export to Figma?', a: 'One-click export to Figma-compatible JSON, raw HTML, or structured JSON. Your wireframe structure, content hierarchy, and section order carry over into whatever tool you use next.' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNav />

      {/* Hero */}
      <section className="text-center pt-16 pb-12 px-8 max-w-[800px] mx-auto">
        <h1 className="text-[40px] font-bold text-[#1a1a1a] mb-3">Pay for AI when you use it. Build by hand for free.</h1>
        <p className="text-[16px] text-[#808080]">Stars are Structr&apos;s currency. Manual building costs nothing. AI actions cost 1-10 stars each.</p>
      </section>

      {/* Pricing cards */}
      <section className="max-w-[900px] mx-auto px-8 pb-20">
        <div className="grid grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div key={plan.name} className={`bg-white rounded-2xl p-7 relative ${plan.highlight ? 'border-2 border-[#1a1a1a]' : 'border border-[#ebebeb]'}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[11px] font-medium px-3 py-1 rounded-full">{plan.badge}</div>
              )}
              <div className="text-[13px] font-medium text-[#808080] mb-1">{plan.name}</div>
              <div className="text-[36px] font-bold text-[#1a1a1a] mb-1">{plan.price}</div>
              <div className="text-[13px] text-[#a0a0a0] mb-6">{plan.period}</div>
              <div className="flex items-center gap-1.5 mb-8">
                <span className="text-[20px] font-bold text-[#1a1a1a]">{plan.stars}</span>
                <StarIcon size={18} />
                <span className="text-[13px] text-[#808080]">{plan.starsLabel}</span>
              </div>
              <Link href={plan.ctaHref} className={`block text-center px-6 py-3 text-[14px] font-medium rounded-xl transition-colors ${plan.ctaStyle}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Star costs reference */}
        <div className="mt-8 bg-white border border-[#ebebeb] rounded-2xl p-7">
          <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-4">Star costs per action</h3>
          <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-[13px]">
            <div className="flex justify-between"><span className="text-[#808080]">Generate project from prompt</span><span className="font-medium">10 <StarIcon size={11} /></span></div>
            <div className="flex justify-between"><span className="text-[#808080]">Import page (website)</span><span className="font-medium">5 <StarIcon size={11} /></span></div>
            <div className="flex justify-between"><span className="text-[#808080]">Wizard page generation</span><span className="font-medium">5 <StarIcon size={11} /></span></div>
            <div className="flex justify-between"><span className="text-[#808080]">Import page (Octopus.do)</span><span className="font-medium">3 <StarIcon size={11} /></span></div>
            <div className="flex justify-between"><span className="text-[#808080]">AI section edit</span><span className="font-medium">1 <StarIcon size={11} /></span></div>
            <div className="flex justify-between"><span className="text-[#808080]">Page suggestions</span><span className="font-medium text-green-600">Free</span></div>
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-[900px] mx-auto px-8 pb-20">
        <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center mb-10">Compare plans</h2>
        <div className="bg-white border border-[#ebebeb] rounded-2xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#ebebeb]">
                <th className="text-left px-6 py-4 text-[#808080] font-medium">Feature</th>
                <th className="text-center px-6 py-4 text-[#1a1a1a] font-semibold">Free</th>
                <th className="text-center px-6 py-4 text-[#1a1a1a] font-semibold bg-[#fafafa]">Pro</th>
                <th className="text-center px-6 py-4 text-[#1a1a1a] font-semibold">Team</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr key={i} className={i < FEATURES.length - 1 ? 'border-b border-[#f0f0f0]' : ''}>
                  <td className="px-6 py-3 text-[#1a1a1a]">{f.name}</td>
                  <td className="text-center px-6 py-3">{f.free ? <Check /> : <Dash />}</td>
                  <td className="text-center px-6 py-3 bg-[#fafafa]">{f.pro ? <Check /> : <Dash />}</td>
                  <td className="text-center px-6 py-3">{f.team ? <Check /> : <Dash />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[700px] mx-auto px-8 pb-20">
        <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center mb-10">Frequently asked questions</h2>
        <div className="flex flex-col gap-5">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white border border-[#ebebeb] rounded-xl p-6">
              <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-2">{item.q}</h3>
              <p className="text-[13px] text-[#808080] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a1a1a] py-16">
        <div className="max-w-[600px] mx-auto px-8 text-center">
          <h2 className="text-[28px] font-bold text-white mb-4">Your next wireframe is 30 seconds away</h2>
          <p className="text-[15px] text-[#999] mb-8">50 free stars. No credit card. Cancel anytime.</p>
          <Link href="/signup" className="inline-block px-10 py-4 text-[16px] font-semibold text-[#1a1a1a] bg-white hover:bg-[#f0f0f0] rounded-2xl transition-all">
            Start your free project
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
