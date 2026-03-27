// Validates and parses the AI-generated wireframe response

const VALID_CATEGORIES = new Set([
  'header', 'hero', 'logos', 'features', 'stats', 'pricing', 'testimonials',
  'faq', 'cta', 'blog', 'about', 'contact', 'team', 'footer', 'gallery',
  'store', 'showcase', 'process', 'downloads', 'comparison', 'error', 'banner',
]);

const VALID_VARIANTS: Record<string, string[]> = {
  header: ['header-simple', 'header-centered', 'header-with-cta', 'header-mega'],
  hero: ['hero-centered', 'hero-split', 'hero-with-image', 'hero-minimal', 'hero-with-form'],
  logos: ['logos-simple', 'logos-with-title', 'logos-grid'],
  features: ['features-grid', 'features-alternating', 'features-2column', 'features-with-image', 'features-bento', 'features-icon-list', 'features-accordion'],
  stats: ['stats-row', 'stats-with-description', 'stats-cards'],
  pricing: ['pricing-3col', 'pricing-2col', 'pricing-simple', 'pricing-toggle', 'pricing-comparison'],
  testimonials: ['testimonials-cards', 'testimonials-single', 'testimonials-minimal', 'testimonials-grid', 'testimonials-carousel'],
  faq: ['faq-accordion', 'faq-two-column', 'faq-centered', 'faq-side-title'],
  cta: ['cta-centered', 'cta-banner', 'cta-with-image', 'cta-simple', 'cta-newsletter'],
  blog: ['blog-grid', 'blog-list', 'blog-featured', 'blog-minimal', 'blog-with-categories'],
  about: ['about-split', 'about-centered', 'about-with-stats', 'about-timeline'],
  contact: ['contact-centered', 'contact-split', 'contact-with-map', 'contact-cards', 'contact-minimal'],
  team: ['team-grid', 'team-list', 'team-compact', 'team-cards', 'team-with-bio'],
  footer: ['footer-4col', 'footer-simple', 'footer-centered', 'footer-minimal', 'footer-with-newsletter'],
  gallery: ['gallery-grid', 'gallery-masonry', 'gallery-lightbox', 'gallery-carousel'],
  store: ['store-grid', 'store-list', 'store-with-filters', 'store-side-filters'],
  showcase: ['showcase-cards', 'showcase-with-links'],
  process: ['process-steps', 'process-timeline'],
  downloads: ['downloads-cards', 'downloads-simple'],
  comparison: ['comparison-table', 'comparison-side-by-side'],
  error: ['error-404', 'error-simple'],
  banner: ['banner-top', 'banner-floating', 'banner-cookie', 'banner-minimal'],
};

interface AiSection {
  category: string;
  variantId: string;
  content: Record<string, unknown>;
  colorMode?: string;
}

interface AiPage {
  name: string;
  sections: AiSection[];
}

interface AiResponse {
  projectName: string;
  pages: AiPage[];
}

export function parseAiResponse(text: string): AiResponse {
  // Extract JSON from the response (handle markdown code blocks, prefixed text, etc.)
  let jsonStr = text.trim();

  // Try code block extraction first
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  // Try to find JSON object in the response
  if (!jsonStr.startsWith('{')) {
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) jsonStr = objMatch[0];
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`AI returned invalid JSON. Response starts with: ${text.slice(0, 100)}`);
  }

  if (!parsed.projectName || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
    throw new Error('Invalid response structure');
  }

  // Validate and clean each page
  const validPages: AiPage[] = parsed.pages.map((page: AiPage) => ({
    name: page.name || 'Page',
    sections: (page.sections || [])
      .filter((s: AiSection) => {
        if (!VALID_CATEGORIES.has(s.category)) return false;
        const variants = VALID_VARIANTS[s.category];
        if (!variants || !variants.includes(s.variantId)) {
          // Try to find a default variant
          s.variantId = variants?.[0] || `${s.category}-simple`;
        }
        return true;
      })
      .map((s: AiSection) => ({
        category: s.category,
        variantId: s.variantId,
        content: s.content || {},
        colorMode: s.colorMode === 'dark' ? 'dark' : 'light',
      })),
  }));

  return {
    projectName: parsed.projectName || 'AI Generated Project',
    pages: validPages.filter(p => p.sections.length > 0),
  };
}
