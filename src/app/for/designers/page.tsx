import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for UX Designers' };

export default function DesignersPage() {
  return (
    <PersonaPage
      role="UX Designers"
      headline="Nail the structure in minutes,<br/>not a full design sprint"
      subtitle="Generate section-based wireframes with real content hierarchy. Map out information architecture, page flow, and content placement, then export to Figma for the pixel work."
      benefits={[
        { title: 'Skip the blank canvas', description: 'Describe the site and get a complete wireframe with proper section types, content blocks, and hierarchy. Start refining immediately instead of building from scratch.' },
        { title: 'Export directly to Figma', description: 'One-click export to Figma-compatible JSON. Import it as a structural starting layer so you design on top of decided content and hierarchy.' },
        { title: 'Separate structure from style', description: 'Structr handles the what-goes-where decisions. You focus on typography, color, spacing, and the visual details that make the design sing.' },
        { title: 'Align stakeholders before pixels', description: 'Publish wireframes to a shareable URL and collect comments on structure. Get sign-off before investing hours in high-fidelity work.' },
      ]}
      workflow={[
        { step: '1', title: 'Describe or import', description: 'Type what you\'re building ("SaaS pricing page with comparison table") or paste a competitor URL to analyze their section structure.' },
        { step: '2', title: 'Refine the layout', description: 'AI generates sections with realistic placeholder content. Reorder them, swap variants, edit copy with the AI chat, or add sections from the catalog.' },
        { step: '3', title: 'Collect feedback early', description: 'Publish to a clean URL and share with stakeholders. They comment directly on the wireframe. AI can auto-apply their feedback in one click.' },
        { step: '4', title: 'Hand off to your design file', description: 'Export to Figma, HTML, or JSON. The wireframe becomes your design foundation with structure, copy, and content hierarchy already locked in.' },
      ]}
    />
  );
}
