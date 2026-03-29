import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for Agencies' };

export default function AgenciesPage() {
  return (
    <PersonaPage
      role="Agencies"
      headline="Win more pitches with<br/>rapid wireframe proposals"
      subtitle="Import a client's existing site in seconds, restructure it, and present a wireframe proposal — all before the first meeting ends."
      benefits={[
        { title: 'Proposals in minutes', description: 'Client says "redesign our site"? Import their URL, analyze the structure, propose improvements — all in the same meeting. Close faster.' },
        { title: 'Competitive analysis built in', description: 'Import competitor sites side by side. Show clients exactly how their structure compares and where the gaps are.' },
        { title: 'Scale your wireframing', description: 'Stop spending designer hours on early-stage wireframes. Let AI handle the structure so your team focuses on the creative work that matters.' },
        { title: 'Client-ready published links', description: 'Share interactive wireframes via clean URLs. Clients can comment directly. No PDFs, no "which version is this?" confusion.' },
      ]}
      workflow={[
        { step: '1', title: 'Import the client\'s site', description: 'Paste their URL. Structr discovers all pages and analyzes the section structure of each one. You see exactly how their site is built.' },
        { step: '2', title: 'Propose improvements', description: 'Rearrange sections, add missing ones (FAQ, testimonials, CTA), improve the content hierarchy. Show what "better" looks like.' },
        { step: '3', title: 'Present to the client', description: 'Publish the wireframe and walk the client through it live. Make changes on the spot based on their feedback using AI chat.' },
        { step: '4', title: 'Hand off to your design team', description: 'Once approved, export to Figma. Your designers get a clear structure with content hierarchy, page flow, and section types already decided.' },
      ]}
    />
  );
}
