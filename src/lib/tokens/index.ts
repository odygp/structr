// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STRUCTR DESIGN TOKENS — Single source of truth
//
// This directory defines all design tokens for Structr:
//   - primitives.ts   — raw color palette (hex)
//   - semantic.ts     — named tokens with light/dark mappings
//   - typography.ts   — type scale
//   - radius.ts       — border radius scale
//   - shadows.ts      — elevation levels
//
// Resolvers convert tokens to format-specific values:
//   - resolvers/tailwind.ts — Tailwind class strings (React components)
//   - resolvers/hex.ts      — Hex values (PDF, JSON export)
//   - resolvers/figma.ts    — 0-1 RGB (Figma plugin)
//   - resolvers/css.ts      — CSS custom properties (Webflow, runtime)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Token definitions
export { primitives, type PrimitiveKey } from './primitives';
export { semanticTokens, surface, ink, border, cta, input, highlight, type SemanticTokenKey } from './semantic';
export { typography, typeClass, figmaFontSize, type TypeScale } from './typography';
export { radius, radiusClass, type RadiusScale } from './radius';
export { shadows, shadowClass, type ElevationLevel } from './shadows';

// Resolvers
export { resolveTailwind, type TailwindTokens } from './resolvers/tailwind';
export { resolveHex, resolveAllHex } from './resolvers/hex';
export { getFigmaPrimitives, getFigmaSemanticTokens, generateFigmaTokensJSON } from './resolvers/figma';
export { generateCSSVariables, generateCSSVariablesBothModes } from './resolvers/css';
