import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for Content Strategists' };

export default function ContentStrategistsPage() {
  return (
    <PersonaPage
      role="Content Strategists"
      headline="Map content architecture<br/>before writing a word"
      subtitle="Plan what content goes where across every page. See the full information architecture visually, then hand off a clear content brief that writers and designers can follow."
      benefits={[
        { title: 'Visual content mapping', description: 'See your entire site content structure at a glance. Each section shows what type of content belongs there — headlines, body copy, CTAs, social proof.' },
        { title: 'AI writes the structure', description: 'Describe the site purpose and AI fills in section types with placeholder content. You see the content hierarchy before committing to copy.' },
        { title: 'Page-by-page planning', description: 'Multi-page projects let you plan the content flow across Home, About, Services, Blog — all in one place with consistent navigation.' },
        { title: 'Content brief as deliverable', description: 'Publish the wireframe as your content brief. Writers see exactly where their copy goes, how long it should be, and what it needs to accomplish.' },
      ]}
      workflow={[
        { step: '1', title: 'Define the site structure', description: 'Use the guided wizard to pick your site type and pages. Or import an existing site to see how its content is structured.' },
        { step: '2', title: 'Review the content architecture', description: 'AI generates sections with appropriate content types for each page. Hero with value prop, features with benefit statements, testimonials, FAQ, CTAs.' },
        { step: '3', title: 'Refine content direction', description: 'Use AI chat to adjust messaging tone, add missing content sections, or restructure the information hierarchy. "Add a case study section after features."' },
        { step: '4', title: 'Brief your writers', description: 'Share the published wireframe with your copywriters. Each section serves as a content brief with context, placement, and word count guidance.' },
      ]}
    />
  );
}
