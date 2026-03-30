import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for Marketing Teams' };

export default function MarketersPage() {
  return (
    <PersonaPage
      role="Marketing Teams"
      headline="Generate a campaign page<br/>in 30 seconds, not 3 meetings"
      subtitle="Describe your launch, event, or product page in one sentence. Structr builds the wireframe with hero, benefits, social proof, and CTA. Share it as the brief itself."
      benefits={[
        { title: 'Landing pages on your schedule', description: 'Need a page for next week\'s launch? Describe it and get a full wireframe with hero, features, social proof, and CTA. Skip the design request queue.' },
        { title: 'Brief with wireframes, not bullets', description: 'Instead of writing "we need a hero with headline, subtitle, and CTA button," show the designer exactly what you mean. Fewer revisions, faster turnaround.' },
        { title: 'Clone what converts', description: 'See a competitor landing page that works? Import the URL and Structr recreates its structure as editable sections. Customize it for your product.' },
        { title: 'No design skills required', description: 'Structr uses pre-built wireframe sections with multiple layout variants. You focus on messaging and page flow. The structure is handled.' },
      ]}
      workflow={[
        { step: '1', title: 'Describe the campaign', description: '"Launch page for our new AI feature. Hero with demo video, 3 key benefits, pricing comparison, testimonials, and sign-up CTA."' },
        { step: '2', title: 'Pick your pages', description: 'AI suggests pages based on your description. Select which ones to generate: landing page, pricing, features detail, or all of them.' },
        { step: '3', title: 'Refine the messaging', description: 'AI writes placeholder copy that reads like real marketing. Adjust headlines and CTAs with the AI chat: "focus on ROI" or "add urgency to the CTA."' },
        { step: '4', title: 'Hand off to design or dev', description: 'Share the published wireframe link with your designer or agency. Export to Figma if they prefer a file to work from.' },
      ]}
    />
  );
}
