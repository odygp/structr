import PersonaPage from '@/components/marketing/PersonaPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Structr for Marketing Teams' };

export default function MarketersPage() {
  return (
    <PersonaPage
      role="Marketing Teams"
      headline="Plan landing pages<br/>in minutes, not meetings"
      subtitle="Stop briefing designers with bullet points. Generate a complete wireframe for your next campaign page, product launch, or microsite — then share it as the brief itself."
      benefits={[
        { title: 'Campaign pages on demand', description: 'Need a landing page for next week\'s launch? Describe it and get a full wireframe with hero, features, social proof, and CTA — in 30 seconds.' },
        { title: 'Brief with wireframes, not docs', description: 'Instead of writing "we need a hero with headline, subtitle, and CTA button", show the designer exactly what you mean. Less back-and-forth, faster turnaround.' },
        { title: 'Clone what works', description: 'See a competitor landing page that converts well? Import the URL and Structr recreates its structure. Now customize it for your brand and product.' },
        { title: 'No design skills needed', description: 'Structr uses pre-built wireframe sections. You focus on messaging and page flow. AI handles the layout and content structure.' },
      ]}
      workflow={[
        { step: '1', title: 'Describe the campaign', description: '"Launch page for our new AI feature. Hero with demo video, 3 key benefits, pricing comparison, testimonials, and sign-up CTA."' },
        { step: '2', title: 'Pick your pages', description: 'AI suggests pages based on your description. Select which ones to generate — homepage, pricing, features, or all of them.' },
        { step: '3', title: 'Tweak the messaging', description: 'AI writes placeholder copy that\'s actually good. Refine headlines and CTAs with the AI chat: "make it more urgent" or "focus on ROI".' },
        { step: '4', title: 'Hand off to design or dev', description: 'Share the published wireframe link with your designer or agency. Export to Figma if they prefer working there.' },
      ]}
    />
  );
}
