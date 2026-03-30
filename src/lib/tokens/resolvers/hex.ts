// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEX RESOLVER — Returns hex color values
// Used for: PDF export, JSON/CMS export, raw color values
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ColorMode } from '@/lib/types';
import { primitives, type PrimitiveKey } from '../primitives';
import { semanticTokens, type SemanticTokenKey } from '../semantic';

/** Resolve a single semantic token to its hex value for a given mode */
export function resolveHex(token: SemanticTokenKey, mode: ColorMode): string {
  const t = semanticTokens[token];
  const key = mode === 'dark' ? t.dark : t.light;
  return primitives[key];
}

/** Resolve ALL semantic tokens to hex values for a given mode */
export function resolveAllHex(mode: ColorMode): Record<SemanticTokenKey, string> {
  const result = {} as Record<SemanticTokenKey, string>;
  for (const [key, token] of Object.entries(semanticTokens)) {
    const primKey: PrimitiveKey = mode === 'dark' ? token.dark : token.light;
    result[key as SemanticTokenKey] = primitives[primKey];
  }
  return result;
}
