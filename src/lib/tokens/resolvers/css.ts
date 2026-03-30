// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CSS RESOLVER — Returns CSS custom property declarations
// Used for: CSS variable export, Webflow integration, runtime theming
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ColorMode } from '@/lib/types';
import { primitives, type PrimitiveKey } from '../primitives';
import { semanticTokens } from '../semantic';

/** Generate CSS custom property declarations for a given mode */
export function generateCSSVariables(mode: ColorMode): string {
  const lines: string[] = [];

  for (const [key, token] of Object.entries(semanticTokens)) {
    const primKey: PrimitiveKey = mode === 'dark' ? token.dark : token.light;
    const cssVarName = `--structr-${key.replace(/\./g, '-')}`;
    lines.push(`  ${cssVarName}: ${primitives[primKey]};`);
  }

  return `:root {\n${lines.join('\n')}\n}`;
}

/** Generate CSS custom properties for both modes */
export function generateCSSVariablesBothModes(): string {
  const light = generateCSSVariables('light');
  const darkLines: string[] = [];

  for (const [key, token] of Object.entries(semanticTokens)) {
    const primKey: PrimitiveKey = token.dark;
    const cssVarName = `--structr-${key.replace(/\./g, '-')}`;
    darkLines.push(`  ${cssVarName}: ${primitives[primKey]};`);
  }

  const dark = `[data-theme="dark"] {\n${darkLines.join('\n')}\n}`;

  return `${light}\n\n${dark}`;
}
