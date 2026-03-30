// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPOGRAPHY TOKENS — Named type scale
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TypeToken {
  size: number;       // px
  lineHeight: number; // px
  weight: 'regular' | 'medium' | 'semibold' | 'bold';
  letterSpacing?: string; // em
  twClass: string;    // Tailwind class string
}

export const typography: Record<string, TypeToken> = {
  display: { size: 48, lineHeight: 48, weight: 'bold',     letterSpacing: '-0.02em', twClass: 'text-5xl font-bold tracking-tight' },
  h1:      { size: 36, lineHeight: 40, weight: 'bold',     letterSpacing: '-0.02em', twClass: 'text-4xl font-bold tracking-tight' },
  h2:      { size: 30, lineHeight: 36, weight: 'bold',     letterSpacing: '-0.01em', twClass: 'text-3xl font-bold' },
  h3:      { size: 24, lineHeight: 32, weight: 'semibold', twClass: 'text-2xl font-semibold' },
  h4:      { size: 20, lineHeight: 28, weight: 'semibold', twClass: 'text-xl font-semibold' },
  'body-lg':  { size: 18, lineHeight: 28, weight: 'regular', twClass: 'text-lg' },
  body:       { size: 16, lineHeight: 24, weight: 'regular', twClass: 'text-base' },
  'body-sm':  { size: 14, lineHeight: 20, weight: 'regular', twClass: 'text-sm' },
  caption:    { size: 12, lineHeight: 16, weight: 'regular', letterSpacing: '0.01em', twClass: 'text-xs tracking-wide' },
  label:      { size: 14, lineHeight: 20, weight: 'medium',  twClass: 'text-sm font-medium' },
  'label-sm': { size: 12, lineHeight: 16, weight: 'medium',  letterSpacing: '0.01em', twClass: 'text-xs font-medium tracking-wide' },
};

export type TypeScale = keyof typeof typography;

/** Get Tailwind classes for a named type scale entry */
export function typeClass(scale: TypeScale): string {
  return typography[scale]?.twClass || typography.body.twClass;
}

// Figma-compatible font size map (matches the plugin's FONT_SIZE)
export const figmaFontSize: Record<string, { s: number; lh: number }> = {
  xs:   { s: 12, lh: 16 },
  sm:   { s: 14, lh: 20 },
  base: { s: 16, lh: 24 },
  lg:   { s: 18, lh: 28 },
  xl:   { s: 20, lh: 28 },
  '2xl':{ s: 24, lh: 32 },
  '3xl':{ s: 30, lh: 36 },
  '4xl':{ s: 36, lh: 40 },
  '5xl':{ s: 48, lh: 48 },
};
