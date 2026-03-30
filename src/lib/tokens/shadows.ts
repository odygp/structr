// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHADOW / ELEVATION TOKENS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const shadows = {
  0: { css: 'none',                                              twClass: 'shadow-none' },
  1: { css: '0 1px 2px 0 rgb(0 0 0 / 0.05)',                    twClass: 'shadow-sm' },
  2: { css: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', twClass: 'shadow-md' },
  3: { css: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', twClass: 'shadow-lg' },
} as const;

export type ElevationLevel = keyof typeof shadows;

/** Get Tailwind class for an elevation level */
export function shadowClass(level: ElevationLevel): string {
  return shadows[level]?.twClass || shadows[0].twClass;
}
