import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for Agencies' };

export default function AgenciesPage() {
  return (
    <PersonaPage
      role="Agencies"
      headline="Present a wireframe proposal<br/>before the first meeting ends"
      subtitle="Import the client's existing site, restructure it, and walk them through the improvements live. Close pitches faster by showing, not telling."
      benefits={[
        { title: 'Proposals in the same meeting', description: 'Client says "redesign our site"? Import their URL, analyze the structure, propose improvements, all while they\'re still in the room.' },
        { title: 'Competitive analysis built in', description: 'Import competitor sites side by side. Show clients exactly how their structure compares and where the content gaps are.' },
        { title: 'Free up designer hours', description: 'Stop spending senior designer time on early-stage wireframes. Let AI handle the structural exploration so your team focuses on creative work.' },
        { title: 'Client-ready shareable links', description: 'Publish interactive wireframes to clean URLs. Clients comment directly on the wireframe. No PDFs, no "which version is this?" emails.' },
      ]}
      workflow={[
        { step: '1', title: 'Import the client\'s site', description: 'Paste their URL. Structr discovers all pages and analyzes the section structure of each one. You see exactly how their current site is built.' },
        { step: '2', title: 'Propose improvements', description: 'Rearrange sections, add missing ones (FAQ, testimonials, CTA), improve the content hierarchy. Show what "better" looks like in concrete terms.' },
        { step: '3', title: 'Present live', description: 'Publish the wireframe and walk the client through it. Make changes on the spot based on their feedback using the AI chat.' },
        { step: '4', title: 'Hand off to your design team', description: 'Once approved, export to Figma. Your designers get a clear structure with content hierarchy, page flow, and section types already decided.' },
      ]}
    />
  );
}
