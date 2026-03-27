// Analyzes HTML to detect section types

interface DetectedSection {
  category: string;
  variantId: string;
  content: Record<string, unknown>;
}

export function analyzeHtml(html: string): DetectedSection[] {
  const sections: DetectedSection[] = [];

  // Normalize HTML — strip scripts, styles, comments
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // Detect header/nav
  if (/<header|<nav/i.test(clean)) {
    const navMatch = clean.match(/<(?:header|nav)[\s\S]*?<\/(?:header|nav)>/i);
    const links = extractLinks(navMatch?.[0] || '');
    sections.push({
      category: 'header',
      variantId: 'header-simple',
      content: {
        logo: extractBrandName(clean),
        links: links.slice(0, 6).map(l => ({ label: l })),
        ctaText: 'Get Started',
      },
    });
  }

  // Detect hero (first large section with h1)
  const h1Match = clean.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    const h1Text = stripTags(h1Match[1]).trim();
    // Look for subtitle near h1
    const h1Pos = clean.indexOf(h1Match[0]);
    const nearbyText = clean.substring(h1Pos, h1Pos + 2000);
    const pMatch = nearbyText.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const subtitle = pMatch ? stripTags(pMatch[1]).trim() : '';

    sections.push({
      category: 'hero',
      variantId: subtitle.length > 50 ? 'hero-centered' : 'hero-minimal',
      content: {
        title: h1Text.slice(0, 100) || 'Welcome',
        subtitle: subtitle.slice(0, 200),
        ctaText: 'Get Started',
        ctaSecondaryText: 'Learn More',
        showPrimaryButton: true,
        showSecondaryButton: true,
        showTertiaryButton: false,
        ctaTertiaryText: '',
      },
    });
  }

  // Detect features (sections with multiple h3s in a grid-like pattern)
  const h3s = clean.match(/<h3[^>]*>[\s\S]*?<\/h3>/gi) || [];
  if (h3s.length >= 3) {
    const features = h3s.slice(0, 6).map(h3 => {
      const title = stripTags(h3).trim();
      return { title: title.slice(0, 60), description: 'Description of this feature.' };
    });
    sections.push({
      category: 'features',
      variantId: features.length <= 3 ? 'features-grid' : 'features-bento',
      content: { title: 'Features', subtitle: 'Everything you need.', features },
    });
  }

  // Detect pricing (look for price patterns)
  const pricePattern = /\$\d+|€\d+|£\d+|\d+\/mo/gi;
  const prices = clean.match(pricePattern);
  if (prices && prices.length >= 2) {
    sections.push({
      category: 'pricing',
      variantId: 'pricing-3col',
      content: {
        title: 'Pricing',
        subtitle: 'Choose the right plan for you.',
        plans: [
          { name: 'Basic', price: prices[0], period: '/month', description: 'For individuals', features: 'Core features', ctaText: 'Start', highlighted: false },
          { name: 'Pro', price: prices[1] || '$29', period: '/month', description: 'For teams', features: 'Everything in Basic, Plus more', ctaText: 'Start', highlighted: true },
          { name: 'Enterprise', price: prices[2] || 'Custom', period: '/month', description: 'For organizations', features: 'Everything in Pro, Custom support', ctaText: 'Contact', highlighted: false },
        ],
      },
    });
  }

  // Detect testimonials (quotes pattern)
  const quoteMatches = clean.match(/<blockquote[\s\S]*?<\/blockquote>/gi) || [];
  if (quoteMatches.length >= 1) {
    const testimonials = quoteMatches.slice(0, 3).map(q => ({
      quote: stripTags(q).trim().slice(0, 200),
      author: 'Customer',
      role: 'User',
    }));
    sections.push({
      category: 'testimonials',
      variantId: testimonials.length === 1 ? 'testimonials-single' : 'testimonials-cards',
      content: { title: 'What customers say', testimonials },
    });
  }

  // Detect FAQ (look for details/summary or question patterns)
  if (/<details|FAQ|frequently asked/i.test(clean)) {
    sections.push({
      category: 'faq',
      variantId: 'faq-accordion',
      content: {
        title: 'Frequently Asked Questions',
        subtitle: 'Common questions answered.',
        questions: [
          { question: 'How do I get started?', answer: 'Sign up for a free account to begin.' },
          { question: 'Is there a free trial?', answer: 'Yes, we offer a 14-day free trial.' },
          { question: 'Can I cancel anytime?', answer: 'Absolutely, cancel anytime with no penalties.' },
        ],
      },
    });
  }

  // Detect CTA section
  if (/sign.?up|get.?started|free.?trial|subscribe/i.test(clean)) {
    sections.push({
      category: 'cta',
      variantId: 'cta-centered',
      content: {
        title: 'Ready to get started?',
        subtitle: 'Join thousands of users today.',
        ctaText: 'Start Free Trial',
        ctaSecondaryText: 'Contact Sales',
        showPrimaryButton: true,
        showSecondaryButton: true,
        showTertiaryButton: false,
        ctaTertiaryText: '',
      },
    });
  }

  // Always add a footer
  if (/<footer/i.test(clean)) {
    const footerLinks = extractLinks(clean.match(/<footer[\s\S]*?<\/footer>/i)?.[0] || '');
    sections.push({
      category: 'footer',
      variantId: 'footer-4col',
      content: {
        logo: extractBrandName(clean),
        description: 'Building the future, one step at a time.',
        copyright: '© 2026 All rights reserved.',
        columns: [
          { title: 'Product', links: footerLinks.slice(0, 4).join(', ') || 'Features, Pricing, Docs' },
          { title: 'Company', links: 'About, Blog, Careers, Contact' },
          { title: 'Legal', links: 'Privacy, Terms, Cookies' },
        ],
      },
    });
  }

  return sections;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ');
}

function extractLinks(html: string): string[] {
  const matches = html.match(/<a[^>]*>([\s\S]*?)<\/a>/gi) || [];
  return matches
    .map(a => stripTags(a).trim())
    .filter(t => t.length > 0 && t.length < 30);
}

function extractBrandName(html: string): string {
  // Try to find brand from title tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const title = stripTags(titleMatch[1]).trim();
    // Take first part before separator
    return title.split(/[|–—-]/)[0].trim().slice(0, 30) || 'Brand';
  }
  return 'Brand';
}
