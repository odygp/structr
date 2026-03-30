import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Structr for Content Strategists',
  description: 'See every content block across every page, visually. Plan what goes where before your writers type a word.',
};

export default function ContentStrategistsPage() {
  return (
    <PersonaPage
      role="Content Strategists"
      headline="See every content block<br/>across every page, visually"
      subtitle="Plan what goes where before your writers type a word. Structr generates the section structure with placeholder content so you can map the full information architecture in one view."
      benefits={[
        { title: 'Visual content mapping', description: 'See your entire site content structure at a glance. Each section shows what type of content belongs there: headlines, body copy, CTAs, social proof, FAQs.' },
        { title: 'AI drafts the hierarchy', description: 'Describe the site purpose and AI fills in section types with realistic placeholder content. You see the content architecture before committing to copy.' },
        { title: 'Page-by-page planning', description: 'Multi-page projects let you plan the content flow across Home, About, Services, Blog. Consistent navigation and cross-page structure in one place.' },
        { title: 'The wireframe is the brief', description: 'Publish the wireframe and share it with your copywriters. Each section shows where their copy goes, the approximate length, and what it needs to accomplish.' },
      ]}
      workflow={[
        { step: '1', title: 'Define the site structure', description: 'Use the guided wizard to pick your site type and pages. Or import an existing site to analyze how its content is currently structured.' },
        { step: '2', title: 'Review the content architecture', description: 'AI generates sections with appropriate content types for each page. Hero with value prop, features with benefit statements, testimonials, FAQ, CTAs.' },
        { step: '3', title: 'Refine content direction', description: 'Use AI chat to adjust messaging tone, add missing content sections, or restructure the information hierarchy. "Add a case study section after features."' },
        { step: '4', title: 'Brief your writers', description: 'Share the published wireframe with your copywriting team. Each section serves as a content brief with placement context and structural guidance.' },
      ]}
    />
  );
}
