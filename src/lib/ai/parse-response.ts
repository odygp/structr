// Validates and parses the AI-generated wireframe response
// Categories and variants are derived from the section registry (single source of truth)

import { sectionRegistry } from '@/lib/registry';

const VALID_CATEGORIES = new Set<string>(
  sectionRegistry.map(def => def.category)
);

const VALID_VARIANTS: Record<string, string[]> = Object.fromEntries(
  sectionRegistry.map(def => [
    def.category,
    def.variants.map(v => v.variantId),
  ])
);

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
