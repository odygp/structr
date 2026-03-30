import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for Product Managers' };

export default function ProductManagersPage() {
  return (
    <PersonaPage
      role="Product Managers"
      headline="Spec features as wireframes,<br/>not 12-page documents"
      subtitle="Type a feature description and get an interactive wireframe in 30 seconds. Share one link with engineering and design so everyone sees the same structure before sprint planning."
      benefits={[
        { title: 'Visual specs in seconds', description: 'Type "user settings page with profile, notifications, and billing tabs" and get a full wireframe. Faster than writing specs, more useful than drawing in slides.' },
        { title: 'Align teams with one link', description: 'Publish the wireframe and drop the URL in Slack or your ticket. Engineering sees the structure, design sees the content hierarchy. One source of truth.' },
        { title: 'Import competitor patterns', description: 'Paste a competitor URL and Structr analyzes their page structure. Use it for competitive analysis or "build something like this" briefs to your team.' },
        { title: 'Iterate without the design bottleneck', description: 'Change copy, swap sections, restructure pages yourself with the AI chat. Structural changes don\'t need to wait for a designer\'s calendar.' },
      ]}
      workflow={[
        { step: '1', title: 'Describe the feature', description: 'Use the prompt or guided wizard. Include page names, key sections, and the target audience. Be as specific or as vague as you want.' },
        { step: '2', title: 'Review the structure', description: 'AI generates pages with headers, content sections, CTAs, and footers. Check if the flow makes sense for your user journey.' },
        { step: '3', title: 'Refine with AI chat', description: 'Click any section and tell AI what to change. "Add a comparison table," "make the CTA more specific," "add an FAQ about pricing."' },
        { step: '4', title: 'Share with your team', description: 'Publish and link it in your ticket or PRD. Engineering knows what to build. Design knows the structure to work from.' },
      ]}
    />
  );
}
