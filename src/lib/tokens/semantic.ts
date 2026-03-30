// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEMANTIC TOKENS — Named design tokens with light/dark mappings
// Each token references a primitive key for each mode.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { PrimitiveKey } from './primitives';

export interface TokenValue {
  light: PrimitiveKey;
  dark: PrimitiveKey;
}

// ── Surface tokens (backgrounds) ──
export const surface = {
  default:     { light: 'white',    dark: 'gray-900' },
  alt:         { light: 'gray-50',  dark: 'gray-800' },
  muted:       { light: 'gray-100', dark: 'gray-700' },
  card:        { light: 'white',    dark: 'gray-800' },
  'card-alt':  { light: 'gray-50',  dark: 'gray-700' },
  placeholder: { light: 'gray-200', dark: 'gray-700' },
  avatar:      { light: 'gray-300', dark: 'gray-600' },
  elevated:    { light: 'white',    dark: 'gray-800' },
} as const satisfies Record<string, TokenValue>;

// ── Ink tokens (text colors) ──
export const ink = {
  default:   { light: 'gray-900', dark: 'white' },
  secondary: { light: 'gray-600', dark: 'gray-300' },
  muted:     { light: 'gray-500', dark: 'gray-400' },
  faint:     { light: 'gray-400', dark: 'gray-500' },
  inverse:   { light: 'white',    dark: 'gray-900' },
  link:      { light: 'gray-700', dark: 'gray-300' },
} as const satisfies Record<string, TokenValue>;

// ── Border tokens ──
export const border = {
  default: { light: 'gray-200', dark: 'gray-700' },
  light:   { light: 'gray-100', dark: 'gray-800' },
  focus:   { light: 'gray-400', dark: 'gray-500' },
  divider: { light: 'gray-200', dark: 'gray-700' },
} as const satisfies Record<string, TokenValue>;

// ── CTA / Button tokens ──
export const cta = {
  'primary-bg':      { light: 'gray-900', dark: 'white' },
  'primary-text':    { light: 'white',    dark: 'gray-900' },
  'primary-hover':   { light: 'gray-800', dark: 'gray-100' },
  'secondary-bg':    { light: 'white',    dark: 'gray-800' },
  'secondary-text':  { light: 'gray-700', dark: 'gray-300' },
  'secondary-border':{ light: 'gray-300', dark: 'gray-600' },
  'secondary-hover': { light: 'gray-50',  dark: 'gray-700' },
} as const satisfies Record<string, TokenValue>;

// ── Input tokens ──
export const input = {
  bg:          { light: 'white',    dark: 'gray-800' },
  border:      { light: 'gray-300', dark: 'gray-600' },
  text:        { light: 'gray-900', dark: 'white' },
  placeholder: { light: 'gray-400', dark: 'gray-500' },
  focus:       { light: 'gray-500', dark: 'gray-400' },
} as const satisfies Record<string, TokenValue>;

// ── Highlight tokens (featured pricing cards, etc.) ──
export const highlight = {
  bg:        { light: 'gray-900', dark: 'white' },
  text:      { light: 'white',    dark: 'gray-900' },
  secondary: { light: 'gray-300', dark: 'gray-500' },
  'cta-bg':  { light: 'white',    dark: 'gray-900' },
  'cta-text':{ light: 'gray-900', dark: 'white' },
} as const satisfies Record<string, TokenValue>;

// ── All semantic tokens flat (for resolvers) ──
export const semanticTokens = {
  // Surfaces
  'surface.default': surface.default,
  'surface.alt': surface.alt,
  'surface.muted': surface.muted,
  'surface.card': surface.card,
  'surface.card-alt': surface['card-alt'],
  'surface.placeholder': surface.placeholder,
  'surface.avatar': surface.avatar,
  'surface.elevated': surface.elevated,
  // Ink
  'ink.default': ink.default,
  'ink.secondary': ink.secondary,
  'ink.muted': ink.muted,
  'ink.faint': ink.faint,
  'ink.inverse': ink.inverse,
  'ink.link': ink.link,
  // Border
  'border.default': border.default,
  'border.light': border.light,
  'border.focus': border.focus,
  'border.divider': border.divider,
  // CTA
  'cta.primary-bg': cta['primary-bg'],
  'cta.primary-text': cta['primary-text'],
  'cta.primary-hover': cta['primary-hover'],
  'cta.secondary-bg': cta['secondary-bg'],
  'cta.secondary-text': cta['secondary-text'],
  'cta.secondary-border': cta['secondary-border'],
  'cta.secondary-hover': cta['secondary-hover'],
  // Input
  'input.bg': input.bg,
  'input.border': input.border,
  'input.text': input.text,
  'input.placeholder': input.placeholder,
  'input.focus': input.focus,
  // Highlight
  'highlight.bg': highlight.bg,
  'highlight.text': highlight.text,
  'highlight.secondary': highlight.secondary,
  'highlight.cta-bg': highlight['cta-bg'],
  'highlight.cta-text': highlight['cta-text'],
} as const;

export type SemanticTokenKey = keyof typeof semanticTokens;
