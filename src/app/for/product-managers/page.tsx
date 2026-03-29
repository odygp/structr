import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for Product Managers' };

export default function ProductManagersPage() {
  return (
    <PersonaPage
      role="Product Managers"
      headline="Spec features visually,<br/>not in documents"
      subtitle="Turn your PRD into an interactive wireframe in 30 seconds. Align engineering and design on what you're building before a single line of code is written."
      benefits={[
        { title: 'From idea to visual in seconds', description: 'Type "user settings page with profile, notifications, and billing tabs" and get a full wireframe. Way faster than writing specs or drawing in slides.' },
        { title: 'Align teams instantly', description: 'Share a published wireframe link in Slack. Everyone sees the same thing — no more "I imagined it differently" in sprint review.' },
        { title: 'Import competitor patterns', description: 'Paste a competitor URL and Structr analyzes their page structure. Great for competitive analysis and "build something like this" briefs.' },
        { title: 'Iterate without design bottleneck', description: 'Change copy, swap sections, restructure pages yourself with AI chat. No need to wait for a designer for structural changes.' },
      ]}
      workflow={[
        { step: '1', title: 'Describe the feature', description: 'Use the prompt or guided wizard to describe what you need. Include page names, key sections, and the target audience.' },
        { step: '2', title: 'Review the structure', description: 'AI generates pages with headers, content sections, CTAs, and footers. Check if the flow makes sense for your user journey.' },
        { step: '3', title: 'Refine with AI', description: 'Click any section and tell AI what to change. "Add a comparison table", "make the CTA more urgent", "add an FAQ section".' },
        { step: '4', title: 'Share with the team', description: 'Publish and drop the link in your ticket or PRD. Engineering knows what to build, design knows the structure to beautify.' },
      ]}
    />
  );
}
