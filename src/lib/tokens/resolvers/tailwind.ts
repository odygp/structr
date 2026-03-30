// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAILWIND RESOLVER — Returns Tailwind class strings
// This is the backward-compatible bridge: produces the same output
// shape as the original getColors() function.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ColorMode } from '@/lib/types';
import { surface, ink, border as borderTokens, cta, input, highlight } from '../semantic';
import { twBg, twText, twBorder, twDivide, twPlaceholder } from '../primitives';
import type { PrimitiveKey } from '../primitives';

function bg(token: { light: PrimitiveKey; dark: PrimitiveKey }, mode: ColorMode): string {
  return twBg[mode === 'dark' ? token.dark : token.light];
}
function text(token: { light: PrimitiveKey; dark: PrimitiveKey }, mode: ColorMode): string {
  return twText[mode === 'dark' ? token.dark : token.light];
}
function bdr(token: { light: PrimitiveKey; dark: PrimitiveKey }, mode: ColorMode): string {
  return twBorder[mode === 'dark' ? token.dark : token.light];
}

/**
 * Resolves semantic tokens to Tailwind class strings.
 * Returns the EXACT same shape as the original getColors() function.
 * All 87 existing components work without any changes.
 */
export function resolveTailwind(mode: ColorMode) {
  return {
    // Backgrounds
    bg:            bg(surface.default, mode),
    bgAlt:         bg(surface.alt, mode),
    bgMuted:       bg(surface.muted, mode),
    bgCard:        bg(surface.card, mode),
    bgCardAlt:     bg(surface['card-alt'], mode),
    bgPlaceholder: bg(surface.placeholder, mode),
    bgAvatar:      bg(surface.avatar, mode),

    // Text
    text:          text(ink.default, mode),
    textSecondary: text(ink.secondary, mode),
    textMuted:     text(ink.muted, mode),
    textLight:     text(ink.faint, mode),

    // Buttons (compound classes)
    btnPrimary:   `${bg(cta['primary-bg'], mode)} ${text(cta['primary-text'], mode)}`,
    btnSecondary: `border ${bdr(cta['secondary-border'], mode)} ${text(cta['secondary-text'], mode)}`,
    btnSmall:     `${bg(cta['primary-bg'], mode)} ${text(cta['primary-text'], mode)}`,

    // Borders
    border:      bdr(borderTokens.default, mode),
    borderLight: bdr(borderTokens.light, mode),
    divider:     mode === 'dark' ? twDivide['gray-700'] : twDivide['gray-200'],

    // Form inputs (compound class)
    input: `${bg(input.bg, mode)} ${bdr(input.border, mode)} ${text(input.text, mode)} ${mode === 'dark' ? twPlaceholder['gray-500'] : twPlaceholder['gray-400']}`,

    // Highlighted card (pricing)
    hlBg:            bg(highlight.bg, mode),
    hlText:          text(highlight.text, mode),
    hlTextSecondary: text(highlight.secondary, mode),
    hlBtn:           `${bg(highlight['cta-bg'], mode)} ${text(highlight['cta-text'], mode)}`,
  };
}

export type TailwindTokens = ReturnType<typeof resolveTailwind>;
