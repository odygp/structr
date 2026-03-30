import Link from 'next/link';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

const StarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="inline-block">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

interface Benefit {
  title: string;
  description: string;
}

interface PersonaPageProps {
  role: string;
  headline: string;
  subtitle: string;
  benefits: Benefit[];
  workflow: { step: string; title: string; description: string }[];
  quote?: { text: string; author: string; role: string };
}

export default function PersonaPage({ role, headline, subtitle, benefits, workflow, quote }: PersonaPageProps) {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNav />

      {/* Hero */}
      <section className="text-center pt-20 pb-16 px-8 max-w-[800px] mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[12px] font-medium mb-6">
          Structr for {role}
        </div>
        <h1 className="text-[48px] font-bold text-[#1a1a1a] leading-[1.08] tracking-[-0.03em] mb-5" dangerouslySetInnerHTML={{ __html: headline }} />
        <p className="text-[18px] text-[#666] max-w-[520px] mx-auto mb-10 leading-relaxed">
          {subtitle}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="px-10 py-4 text-[16px] font-semibold text-white bg-[#1a1a1a] hover:bg-[#333] rounded-2xl transition-all hover:shadow-lg">
            Start for free
          </Link>
          <Link href="/p/stripe-import" className="px-10 py-4 text-[16px] font-semibold text-[#1a1a1a] border border-[#e0e0e0] bg-white hover:bg-[#fafafa] rounded-2xl transition-all">
            See an example
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-[900px] mx-auto px-8 py-16">
        <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center mb-12">Why {role.toLowerCase()} love Structr</h2>
        <div className="grid grid-cols-2 gap-5">
          {benefits.map(b => (
            <div key={b.title} className="bg-white border border-[#ebebeb] rounded-2xl p-7">
              <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">{b.title}</h3>
              <p className="text-[13px] text-[#808080] leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-white border-y border-[#ebebeb] py-16">
        <div className="max-w-[800px] mx-auto px-8">
          <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center mb-12">Your workflow with Structr</h2>
          <div className="flex flex-col gap-8">
            {workflow.map(w => (
              <div key={w.step} className="flex gap-5 items-start">
                <div className="w-10 h-10 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center text-[16px] font-bold flex-shrink-0">{w.step}</div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-1">{w.title}</h3>
                  <p className="text-[14px] text-[#808080] leading-relaxed">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-design layer callout */}
      <section className="max-w-[800px] mx-auto px-8 py-16">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 md:p-10">
          <h3 className="text-[22px] font-bold text-white mb-3">The pre-design layer your workflow is missing</h3>
          <p className="text-[14px] text-[#999] leading-relaxed mb-5">
            Before you open Figma, before you prompt Lovable, you need to decide what pages, what sections, and what content. Build that structure manually from our section catalog, use AI for speed, or mix both. That exploration is expensive in design tools. In Structr, it&apos;s free to build manually or 1 star per AI edit.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-center">
              <div className="text-[13px] font-semibold text-white">Structr</div>
              <div className="text-[10px] text-white/50">Structure + Content</div>
            </div>
            <span className="text-white/30">&rarr;</span>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-center">
              <div className="text-[13px] font-medium text-white/60">Design tool</div>
              <div className="text-[10px] text-white/30">Visual design</div>
            </div>
            <span className="text-white/30">&rarr;</span>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-center">
              <div className="text-[13px] font-medium text-white/60">Code builder</div>
              <div className="text-[10px] text-white/30">Production</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote placeholder */}
      {quote && (
        <section className="max-w-[600px] mx-auto px-8 py-16 text-center">
          <p className="text-[18px] text-[#1a1a1a] italic leading-relaxed mb-4">&ldquo;{quote.text}&rdquo;</p>
          <p className="text-[13px] text-[#808080]">{quote.author}, {quote.role}</p>
        </section>
      )}

      {/* Pricing hint */}
      <section className="max-w-[500px] mx-auto px-8 py-16 text-center">
        <div className="bg-white border border-[#ebebeb] rounded-2xl p-8">
          <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-2">Free to start</h3>
          <p className="text-[14px] text-[#808080] mb-4">Every account gets 50 free stars. No credit card needed.</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-[32px] font-bold text-[#1a1a1a]">50</span>
            <StarIcon size={24} />
          </div>
          <Link href="/signup" className="inline-block px-8 py-3 text-[14px] font-medium text-white bg-[#1a1a1a] hover:bg-[#333] rounded-xl transition-colors">
            Get started free
          </Link>
          <p className="text-[11px] text-[#a0a0a0] mt-3"><Link href="/pricing" className="underline hover:text-[#666]">View all plans</Link></p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
