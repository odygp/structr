import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { CHANGELOG } from '@/lib/changelog-data';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Changelog' };

const TAG_STYLES = {
  feature: 'bg-blue-50 text-blue-700',
  fix: 'bg-red-50 text-red-700',
  improvement: 'bg-green-50 text-green-700',
};

export default function ChangelogPage() {
  // Group by month
  const grouped = new Map<string, typeof CHANGELOG>();
  for (const entry of CHANGELOG) {
    const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!grouped.has(month)) grouped.set(month, []);
    grouped.get(month)!.push(entry);
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <MarketingNav />

      <div className="max-w-[700px] mx-auto px-8 pt-16 pb-20">
        <h1 className="text-[40px] font-bold text-[#1a1a1a] mb-3">Changelog</h1>
        <p className="text-[16px] text-[#808080] mb-14">New features, improvements, and fixes shipped to Structr.</p>

        <div className="flex flex-col gap-12">
          {[...grouped.entries()].map(([month, entries]) => (
            <div key={month}>
              <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-6 pb-2 border-b border-[#ebebeb]">{month}</h2>
              <div className="flex flex-col gap-6">
                {entries.map((entry, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0 pt-1">
                      <div className="w-2 h-2 bg-[#1a1a1a] rounded-full" />
                      {i < entries.length - 1 && <div className="w-px flex-1 bg-[#e5e5e5] mt-2" />}
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_STYLES[entry.tag]}`}>
                          {entry.tag}
                        </span>
                        <span className="text-[12px] text-[#a0a0a0]">{entry.date}</span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1">{entry.title}</h3>
                      <p className="text-[13px] text-[#808080] leading-relaxed">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
