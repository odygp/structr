import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for Founders' };

export default function FoundersPage() {
  return (
    <PersonaPage
      role="Founders"
      headline="Show what you&apos;re building<br/>before you build it"
      subtitle="Turn the website idea in your head into a visual plan you can share with cofounders, investors, and your first designer — in under a minute."
      benefits={[
        { title: 'Skip the blank page', description: 'You know what your site needs but can\'t design it. Describe it in plain English and get a complete multi-page wireframe with real content structure.' },
        { title: 'Impress investors with visuals', description: 'A wireframe is worth a thousand words in a pitch deck. Show your product vision as an interactive published page, not a wall of text.' },
        { title: 'Save on early design costs', description: 'Plan your MVP site yourself before hiring a designer. When you do hire one, hand them a clear wireframe instead of vague ideas — they\'ll thank you.' },
        { title: 'Iterate at the speed of thought', description: 'Change your mind about the homepage structure? Tell AI "swap pricing and testimonials" and it\'s done. No waiting for design revisions.' },
      ]}
      workflow={[
        { step: '1', title: 'Describe your vision', description: '"A SaaS landing page for a project management tool targeting remote teams. Needs pricing, features comparison, and integration showcase."' },
        { step: '2', title: 'Get a complete wireframe', description: 'AI generates multiple pages with proper sections — header, hero, features, pricing, testimonials, FAQ, footer. All with realistic placeholder copy.' },
        { step: '3', title: 'Refine until it clicks', description: 'Use AI chat to iterate. "Add a section showing integrations", "make the hero more benefit-focused", "add a founder story to the about page".' },
        { step: '4', title: 'Share and build', description: 'Publish to a clean URL for investors and cofounders. Export to Figma for your designer. Use as the spec for your developer.' },
      ]}
    />
  );
}
