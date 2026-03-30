// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BORDER RADIUS TOKENS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const radius = {
  none: { px: 0,    twClass: 'rounded-none' },
  sm:   { px: 4,    twClass: 'rounded' },
  md:   { px: 8,    twClass: 'rounded-lg' },
  lg:   { px: 12,   twClass: 'rounded-xl' },
  xl:   { px: 16,   twClass: 'rounded-2xl' },
  '2xl':{ px: 24,   twClass: 'rounded-3xl' },
  full: { px: 9999, twClass: 'rounded-full' },
} as const;

export type RadiusScale = keyof typeof radius;

/** Get Tailwind class for a named radius token */
export function radiusClass(scale: RadiusScale): string {
  return radius[scale]?.twClass || radius.md.twClass;
}
