// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIGMA RESOLVER — Returns 0-1 RGB values for Figma Plugin API
// Used for: Figma plugin variable collections, fill/stroke binding
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { primitives, type PrimitiveKey } from '../primitives';
import { semanticTokens } from '../semantic';

export interface FigmaRGB { r: number; g: number; b: number }

/** Convert hex to 0-1 RGB (Figma format) */
function hexToFigmaRGB(hex: string): FigmaRGB {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

/** All primitive colors as Figma 0-1 RGB */
export function getFigmaPrimitives(): Record<PrimitiveKey, FigmaRGB> {
  const result = {} as Record<PrimitiveKey, FigmaRGB>;
  for (const [key, hex] of Object.entries(primitives)) {
    result[key as PrimitiveKey] = hexToFigmaRGB(hex);
  }
  return result;
}

/** Semantic tokens as Figma-compatible { light: primitiveKey, dark: primitiveKey } */
export function getFigmaSemanticTokens(): Record<string, { light: PrimitiveKey; dark: PrimitiveKey }> {
  const result: Record<string, { light: PrimitiveKey; dark: PrimitiveKey }> = {};
  for (const [key, token] of Object.entries(semanticTokens)) {
    result[key] = { light: token.light, dark: token.dark };
  }
  return result;
}

/** Generate the complete Figma tokens JSON file content */
export function generateFigmaTokensJSON(): string {
  return JSON.stringify({
    primitives: getFigmaPrimitives(),
    semantic: getFigmaSemanticTokens(),
  }, null, 2);
}
