// Uses Claude to analyze page content and map to wireframe sections
import Anthropic from '@anthropic-ai/sdk';

const IMPORT_SYSTEM_PROMPT = `You analyze website page content and convert it into wireframe section definitions.

Given the markdown/text content of a webpage, identify each distinct content section and map it to the closest wireframe variant.

## Available Section Categories and Variants

### Header: header-simple, header-centered, header-with-cta, header-mega
### Hero: hero-centered, hero-split, hero-with-image, hero-minimal, hero-with-form
### Logo Cloud: logos-simple, logos-with-title, logos-grid
### Features: features-grid, features-alternating, features-2column, features-with-image, features-bento, features-icon-list, features-accordion
### Stats: stats-row, stats-with-description, stats-cards
### Pricing: pricing-3col, pricing-2col, pricing-simple, pricing-toggle, pricing-comparison
### Testimonials: testimonials-cards, testimonials-single, testimonials-minimal, testimonials-grid, testimonials-carousel
### FAQ: faq-accordion, faq-two-column, faq-centered, faq-side-title
### CTA: cta-centered, cta-banner, cta-with-image, cta-simple, cta-newsletter
### Blog: blog-grid, blog-list, blog-featured, blog-minimal, blog-with-categories
### About: about-split, about-centered, about-with-stats, about-timeline
### Contact: contact-centered, contact-split, contact-with-map, contact-cards, contact-minimal
### Team: team-grid, team-list, team-compact, team-cards, team-with-bio
### Footer: footer-4col, footer-simple, footer-centered, footer-minimal, footer-with-newsletter
### Gallery: gallery-grid, gallery-masonry, gallery-lightbox, gallery-carousel
### Store: store-grid, store-list, store-with-filters, store-side-filters
### Showcase: showcase-cards, showcase-with-links
### Process: process-steps, process-timeline
### Downloads: downloads-cards, downloads-simple
### Comparison: comparison-table, comparison-side-by-side
### Error: error-404, error-simple
### Banner: banner-top, banner-floating, banner-cookie, banner-minimal

## Content Fields Per Category

- **Header**: logo (string), links (array of {label}), ctaText (string)
- **Hero**: title, subtitle, ctaText, ctaSecondaryText, showPrimaryButton (bool), showSecondaryButton (bool), showTertiaryButton (false), ctaTertiaryText ("")
- **Features**: title, subtitle, features (array of {title, description})
- **Pricing**: title, subtitle, plans (array of {name, price, period, description, features (comma-separated string), ctaText, highlighted (bool)})
- **Testimonials**: title, testimonials (array of {quote, author, role})
- **FAQ**: title, subtitle, questions (array of {question, answer})
- **CTA**: title, subtitle, ctaText, ctaSecondaryText, showPrimaryButton (true), showSecondaryButton (bool), showTertiaryButton (false), ctaTertiaryText ("")
- **Blog**: title, subtitle, posts (array of {title, excerpt, category, date})
- **Stats**: title, stats (array of {value, label})
- **Team**: title, members (array of {name, role})
- **Contact**: title, subtitle, email, phone, address
- **About**: title, description, mission
- **Footer**: logo, description, copyright, columns (array of {title, links (comma-separated)})
- **Store**: title, products (array of {title, description, price})
- **Gallery**: title, images (array of {caption})
- **Process**: title, subtitle, steps (array of {title, description})
- **Showcase**: title, items (array of {title, description, price})
- **Downloads**: title, subtitle, items (array of {title, description, ctaText})
- **Banner**: text, ctaText, dismissible (bool)
- **Logos**: title, logos (array of {name})
- **Comparison**: title, items (array of {feature, option1, option2, option3})

## Rules
1. Extract REAL content from the page — actual titles, descriptions, prices, names, quotes etc. NO placeholder or generic text.
2. Every page MUST start with a header and end with a footer.
3. Choose the variant that best matches the visual layout described by the content structure.
4. If content doesn't clearly map to a category, use the closest match BUT also add it to the "unmatchedSections" array.
5. Maximum 15 sections per page.
6. Keep text concise — truncate descriptions to ~200 chars.
7. For stats, extract actual numbers if present.
8. For pricing, extract actual prices, plan names, and features.
9. For testimonials, extract actual quotes and attribution.

## Response Format
Return ONLY valid JSON object (no markdown, no explanation):
{
  "sections": [
    {
      "category": "header",
      "variantId": "header-simple",
      "content": { ... },
      "colorMode": "light"
    }
  ],
  "unmatchedSections": [
    {
      "suggestedCategory": "integrations",
      "suggestedVariantName": "Integration Grid with Logos",
      "description": "A grid of integration/partner logos with names and short descriptions. Shows ~12 integrations in a 4x3 grid with hover states.",
      "extractedContent": { "title": "Integrations", "items": [...] },
      "previewHtml": "<section style='padding:48px 24px;max-width:960px;margin:0 auto;font-family:Inter,sans-serif'><h2 style='font-size:28px;font-weight:700;text-align:center;margin-bottom:32px'>Integrations</h2><div style='display:grid;grid-template-columns:repeat(4,1fr);gap:16px'>...</div></section>"
    }
  ]
}`;

interface AnalyzedSection {
  category: string;
  variantId: string;
  content: Record<string, unknown>;
  colorMode?: string;
}

export interface UnmatchedSection {
  suggestedCategory: string;
  suggestedVariantName: string;
  description: string;
  extractedContent: Record<string, unknown>;
  previewHtml: string;
}

export interface AnalysisResult {
  sections: AnalyzedSection[];
  unmatchedSections: UnmatchedSection[];
}

export async function analyzePageWithAI(pageContent: string, pageName: string, sourceUrl?: string): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured — add it to .env.local and Vercel env vars');

  const client = new Anthropic({ apiKey });

  // Truncate content to avoid token limits (~20k chars ≈ ~5k tokens)
  const truncated = pageContent.slice(0, 20000);

  let message;
  try {
    message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: IMPORT_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analyze this "${pageName}" page and convert it into wireframe sections. Extract the REAL content from the page.\n\n---\n${truncated}\n---`,
      }],
    });
  } catch (apiError: unknown) {
    const errMsg = apiError instanceof Error ? apiError.message : String(apiError);
    console.error('Anthropic API error:', errMsg);

    // If model not found, try fallback
    if (errMsg.includes('model') || errMsg.includes('not_found')) {
      try {
        message = await client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          system: IMPORT_SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Analyze this "${pageName}" page and convert it into wireframe sections. Extract the REAL content from the page.\n\n---\n${truncated}\n---`,
          }],
        });
      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError);
        throw new Error(`AI analysis failed: ${errMsg}`);
      }
    } else {
      throw new Error(`AI analysis failed: ${errMsg}`);
    }
  }

  // Extract JSON from response
  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Try to parse JSON directly or extract from code block
  let json = text.trim();
  const codeBlockMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) json = codeBlockMatch[1].trim();

  // Try to find JSON object or array
  if (!json.startsWith('{') && !json.startsWith('[')) {
    const objMatch = json.match(/\{[\s\S]*\}/);
    const arrMatch = json.match(/\[[\s\S]*\]/);
    if (objMatch) json = objMatch[0];
    else if (arrMatch) json = arrMatch[0];
  }

  try {
    const parsed = JSON.parse(json);

    // New format: { sections: [...], unmatchedSections: [...] }
    if (parsed.sections && Array.isArray(parsed.sections)) {
      const sections = parsed.sections.map((s: AnalyzedSection) => ({
        category: s.category || 'hero',
        variantId: s.variantId || 'hero-centered',
        content: s.content || {},
        colorMode: s.colorMode || 'light',
      }));
      const unmatchedSections = (parsed.unmatchedSections || []) as UnmatchedSection[];

      // Save unmatched sections to Supabase if any
      if (unmatchedSections.length > 0) {
        saveUnmatchedSections(unmatchedSections, sourceUrl, pageName).catch(console.error);
      }

      return { sections, unmatchedSections };
    }

    // Legacy format: direct array
    if (Array.isArray(parsed)) {
      return {
        sections: parsed.map((s: AnalyzedSection) => ({
          category: s.category || 'hero',
          variantId: s.variantId || 'hero-centered',
          content: s.content || {},
          colorMode: s.colorMode || 'light',
        })),
        unmatchedSections: [],
      };
    }

    throw new Error('Unexpected format');
  } catch (e) {
    console.error('Failed to parse AI response (first 500 chars):', text.slice(0, 500));
    throw new Error(`AI returned invalid response. First 100 chars: ${text.slice(0, 100)}`);
  }
}

// ── Generate sections for a page based on name only (used by Octopus.do import) ──

const GENERATE_SYSTEM_PROMPT = `You generate wireframe section definitions for a website page based ONLY on its name and optional description.

## Available Section Categories and Variants

### Header: header-simple, header-centered, header-with-cta, header-mega
### Hero: hero-centered, hero-split, hero-with-image, hero-minimal, hero-with-form
### Logo Cloud: logos-simple, logos-with-title, logos-grid
### Features: features-grid, features-alternating, features-2column, features-with-image, features-bento, features-icon-list, features-accordion
### Stats: stats-row, stats-with-description, stats-cards
### Pricing: pricing-3col, pricing-2col, pricing-simple, pricing-toggle, pricing-comparison
### Testimonials: testimonials-cards, testimonials-single, testimonials-grid, testimonials-minimal, testimonials-carousel
### FAQ: faq-accordion, faq-two-column, faq-centered, faq-side-title
### CTA: cta-centered, cta-banner, cta-with-image, cta-newsletter, cta-simple
### Blog: blog-grid, blog-list, blog-featured, blog-minimal, blog-with-categories
### About: about-centered, about-split, about-with-stats, about-timeline
### Team: team-grid, team-cards, team-compact, team-list, team-with-bio
### Gallery: gallery-grid, gallery-masonry, gallery-lightbox, gallery-carousel
### Contact: contact-centered, contact-split, contact-with-map, contact-cards, contact-minimal
### Store: store-grid, store-list, store-with-filters, store-side-filters
### Footer: footer-4col, footer-simple, footer-centered, footer-minimal, footer-with-newsletter
### Banner: banner-top, banner-floating, banner-cookie, banner-minimal
### Process: process-steps, process-timeline
### Downloads: downloads-cards, downloads-simple
### Error: error-404, error-simple
### Comparison: comparison-table, comparison-side-by-side
### Showcase: showcase-cards, showcase-with-links

## Content Fields per Category
Each section needs realistic placeholder content appropriate for the page type:
- **Header**: logo, links (array of {label}), ctaText
- **Hero**: title, subtitle, ctaText, ctaSecondaryText
- **Features**: title, subtitle, features (array of {title, description})
- **Stats**: title, stats (array of {value, label})
- **Pricing**: title, subtitle, plans (array of {name, price, period, features, ctaText, highlighted})
- **Testimonials**: title, testimonials (array of {quote, author, role})
- **FAQ**: title, faqs (array of {question, answer})
- **CTA**: title, subtitle, ctaText
- **Blog**: title, posts (array of {title, excerpt, author, date, category})
- **About**: title, description, mission
- **Team**: title, subtitle, members (array of {name, role})
- **Contact**: title, subtitle, email, phone, address
- **Footer**: logo, description, copyright, columns (array of {title, links})

## Rules
1. Generate REALISTIC placeholder content appropriate for the page type and business context.
2. Every page MUST start with a header-simple and end with footer-4col.
3. Choose variants that make sense for the page type.
4. Generate 4-8 sections per page (including header and footer).
5. Use the page description and SEO metadata if provided for context.

## Response Format
Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "category": "header",
    "variantId": "header-simple",
    "content": { ... },
    "colorMode": "light"
  }
]`;

export async function generateSectionsForPage(
  pageName: string,
  pageDescription?: string,
  seoMeta?: { title?: string; description?: string }
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const client = new Anthropic({ apiKey });

  let userPrompt = `Generate wireframe sections for a "${pageName}" page.`;
  if (pageDescription) userPrompt += `\nPage description: ${pageDescription}`;
  if (seoMeta?.title) userPrompt += `\nSEO Title: ${seoMeta.title}`;
  if (seoMeta?.description) userPrompt += `\nSEO Description: ${seoMeta.description}`;

  let message;
  try {
    message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: GENERATE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });
  } catch (apiError: unknown) {
    const errMsg = apiError instanceof Error ? apiError.message : String(apiError);
    if (errMsg.includes('model') || errMsg.includes('not_found')) {
      message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: GENERATE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });
    } else {
      throw new Error(`AI generation failed: ${errMsg}`);
    }
  }

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  let json = text.trim();
  const codeBlockMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) json = codeBlockMatch[1].trim();
  if (!json.startsWith('[') && !json.startsWith('{')) {
    const arrMatch = json.match(/\[[\s\S]*\]/);
    if (arrMatch) json = arrMatch[0];
  }

  try {
    const parsed = JSON.parse(json);
    const sections = (Array.isArray(parsed) ? parsed : parsed.sections || []).map((s: AnalyzedSection) => ({
      category: s.category || 'hero',
      variantId: s.variantId || 'hero-centered',
      content: s.content || {},
      colorMode: s.colorMode || 'light',
    }));
    return { sections, unmatchedSections: [] };
  } catch {
    console.error('Failed to parse AI generation response:', text.slice(0, 500));
    throw new Error(`AI returned invalid response for page "${pageName}"`);
  }
}

// Save unmatched sections as component requests
async function saveUnmatchedSections(sections: UnmatchedSection[], sourceUrl?: string, pageName?: string) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    for (const s of sections) {
      await supabase.from('structr_component_requests').insert({
        suggested_category: s.suggestedCategory,
        suggested_variant_name: s.suggestedVariantName,
        description: s.description,
        source_url: sourceUrl || null,
        source_page_name: pageName || null,
        extracted_content: s.extractedContent || {},
        preview_html: s.previewHtml || null,
        status: 'pending',
      });
    }
  } catch (e) {
    console.error('Failed to save component requests:', e);
  }
}
