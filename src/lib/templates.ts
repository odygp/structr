// Template wizard categories and page suggestions

export interface WizardCategory {
  id: string;
  label: string;
  emoji: string;
  suggestedPages: string[];
}

export const CATEGORIES: WizardCategory[] = [
  { id: 'saas', label: 'SaaS / Software', emoji: '🚀', suggestedPages: ['Home', 'Features', 'Pricing', 'About', 'Contact', 'Blog'] },
  { id: 'ecommerce', label: 'E-commerce / Store', emoji: '🛒', suggestedPages: ['Home', 'Products', 'About Us', 'Contact'] },
  { id: 'agency', label: 'Agency / Studio', emoji: '💼', suggestedPages: ['Home', 'Services', 'Work', 'About', 'Contact'] },
  { id: 'portfolio', label: 'Portfolio / Personal', emoji: '👤', suggestedPages: ['Home', 'Work', 'About', 'Contact'] },
  { id: 'blog', label: 'Blog / Magazine', emoji: '📝', suggestedPages: ['Home', 'Articles', 'About', 'Contact'] },
  { id: 'corporate', label: 'Corporate / Business', emoji: '🏢', suggestedPages: ['Home', 'Services', 'About', 'Team', 'Contact'] },
  { id: 'education', label: 'Education', emoji: '🎓', suggestedPages: ['Home', 'Courses', 'About', 'FAQ', 'Contact'] },
  { id: 'healthcare', label: 'Healthcare / Wellness', emoji: '🏥', suggestedPages: ['Home', 'Services', 'About', 'Team', 'Contact'] },
  { id: 'restaurant', label: 'Restaurant / Local', emoji: '🍔', suggestedPages: ['Home', 'Menu', 'About', 'Gallery', 'Contact'] },
];

export interface WizardData {
  category: string;
  customCategory?: string;
  description: string;
  pages: string[];
  businessName?: string;
  tagline?: string;
  products?: string[];
  audience?: string;
  contentLanguage?: string; // e.g., 'English', 'Greek', 'Spanish'
  tone: {
    formality: number;   // 0=formal, 100=casual
    voice: number;       // 0=professional, 100=friendly
    language: number;    // 0=technical, 100=simple
    approach: number;    // 0=direct, 100=storytelling
  };
  extras: {
    socialProof: boolean;
    urgency: boolean;
    benefitsFocus: boolean;
    jargon: boolean;
  };
}

export function buildWizardPrompt(data: WizardData): string {
  const categoryLabel = data.customCategory || CATEGORIES.find(c => c.id === data.category)?.label || data.category;

  const toneDesc = (val: number, low: string, high: string) =>
    val < 30 ? low : val > 70 ? high : `balanced ${low}/${high}`;

  const parts: string[] = [
    `Create a wireframe for a ${categoryLabel} website.`,
    '',
    `Description: ${data.description}`,
  ];

  if (data.businessName) parts.push(`Business name: ${data.businessName}`);
  if (data.tagline) parts.push(`Tagline: ${data.tagline}`);
  if (data.products?.length) parts.push(`Key products/services: ${data.products.join(', ')}`);
  if (data.audience) parts.push(`Target audience: ${data.audience}`);
  if (data.contentLanguage && data.contentLanguage !== 'English') {
    parts.push(`IMPORTANT: All content MUST be written in ${data.contentLanguage}. Every headline, description, button text, testimonial, and any other text must be in ${data.contentLanguage}.`);
  }

  parts.push('');
  parts.push(`Pages to create (in this order): ${data.pages.join(', ')}`);

  parts.push('');
  parts.push('Content tone:');
  parts.push(`- Formality: ${toneDesc(data.tone.formality, 'Formal', 'Casual')}`);
  parts.push(`- Voice: ${toneDesc(data.tone.voice, 'Professional', 'Friendly')}`);
  parts.push(`- Language: ${toneDesc(data.tone.language, 'Technical', 'Simple')}`);
  parts.push(`- Approach: ${toneDesc(data.tone.approach, 'Direct', 'Storytelling')}`);

  const extras: string[] = [];
  if (data.extras.socialProof) extras.push('Include social proof (testimonials, stats, logos)');
  if (data.extras.urgency) extras.push('Include urgency/scarcity cues');
  if (data.extras.benefitsFocus) extras.push('Focus on benefits over features');
  if (data.extras.jargon) extras.push('Use industry-specific terminology');
  if (extras.length) {
    parts.push('');
    parts.push('Additional requirements:');
    extras.forEach(e => parts.push(`- ${e}`));
  }

  parts.push('');
  parts.push('Generate appropriate wireframe sections for EACH page with REAL, relevant content that matches this business. Use actual product names, realistic testimonials, and industry-appropriate language. Every page must start with a header and end with a footer.');

  return parts.join('\n');
}
