import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Structr for Founders',
  description: 'Turn the site in your head into a visual plan you can share with cofounders, investors, and your first designer in under a minute.',
};

export default function FoundersPage() {
  return (
    <PersonaPage
      role="Founders"
      headline="Turn the site in your head<br/>into a plan you can share"
      subtitle="Describe your product in plain English and get a multi-page wireframe with real content structure. Share it with cofounders, investors, or your first designer in under a minute."
      benefits={[
        { title: 'Skip the blank page', description: 'You know what your site needs but can\'t design it yet. Describe it and get a complete wireframe with proper sections, content hierarchy, and page flow.' },
        { title: 'Show investors, don\'t tell them', description: 'A wireframe in your pitch deck says more than a paragraph. Publish it as an interactive page your investors can click through.' },
        { title: 'Save on early design costs', description: 'Plan your MVP site yourself before hiring a designer. Hand them a clear wireframe instead of vague ideas. They\'ll quote lower and deliver faster.' },
        { title: 'Iterate at the speed of thought', description: 'Changed your mind about the homepage structure? Tell AI "swap pricing and testimonials" and it\'s done. No design revision cycles.' },
      ]}
      workflow={[
        { step: '1', title: 'Describe your product', description: '"A SaaS landing page for a project management tool targeting remote teams. Needs pricing, feature comparison, and integration showcase."' },
        { step: '2', title: 'Get a complete wireframe', description: 'AI generates multiple pages with header, hero, features, pricing, testimonials, FAQ, and footer. Each section has realistic placeholder copy.' },
        { step: '3', title: 'Refine until it clicks', description: 'Use AI chat to iterate. "Add a section showing integrations," "make the hero more benefit-focused," "add a founder story to the about page."' },
        { step: '4', title: 'Share and build', description: 'Publish to a clean URL for investors and cofounders. Export to Figma for your designer. Use it as the spec for your developer.' },
      ]}
    />
  );
}
