import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for UX Designers' };

export default function DesignersPage() {
  return (
    <PersonaPage
      role="UX Designers"
      headline="Plan the structure,<br/>then design the pixels"
      subtitle="Generate section-based wireframes in seconds. Map out information architecture, content hierarchy, and page flow — then export to Figma for the visual design phase."
      benefits={[
        { title: 'Skip the blank canvas', description: 'Describe the site and AI generates a complete wireframe with proper section structure. No more starting from scratch with gray boxes.' },
        { title: 'Export to Figma', description: 'One-click export to Figma-compatible JSON. Import directly into your design file as a starting layer to design on top of.' },
        { title: 'Focus on UX, not layout', description: 'Structr handles section placement and content structure. You focus on the user experience decisions that matter.' },
        { title: 'Rapid stakeholder alignment', description: 'Publish wireframes to a shareable URL in one click. Get feedback on structure before investing time in high-fidelity design.' },
      ]}
      workflow={[
        { step: '1', title: 'Describe or import', description: 'Type what you\'re building ("SaaS pricing page with comparison table") or paste a competitor URL to analyze their structure.' },
        { step: '2', title: 'Refine the structure', description: 'AI generates sections with real content. Reorder, edit copy with AI chat, add or remove sections from the catalog.' },
        { step: '3', title: 'Share for feedback', description: 'Publish to a clean URL and share with stakeholders. Collect comments directly on the wireframe.' },
        { step: '4', title: 'Hand off to design', description: 'Export to Figma or HTML. The wireframe becomes your design foundation — structure, copy, and hierarchy already decided.' },
      ]}
    />
  );
}
