import { ColorMode } from './types';

// Centralized color classes based on colorMode.
// Every section component uses these instead of hardcoding colors.
export function getColors(mode: ColorMode) {
  const dark = mode === 'dark';
  return {
    // Backgrounds
    bg: dark ? 'bg-gray-900' : 'bg-white',
    bgAlt: dark ? 'bg-gray-800' : 'bg-gray-50',
    bgMuted: dark ? 'bg-gray-700' : 'bg-gray-100',
    bgCard: dark ? 'bg-gray-800' : 'bg-white',
    bgCardAlt: dark ? 'bg-gray-700' : 'bg-gray-50',
    bgPlaceholder: dark ? 'bg-gray-700' : 'bg-gray-200',
    bgAvatar: dark ? 'bg-gray-600' : 'bg-gray-300',

    // Text
    text: dark ? 'text-white' : 'text-gray-900',
    textSecondary: dark ? 'text-gray-300' : 'text-gray-600',
    textMuted: dark ? 'text-gray-400' : 'text-gray-400',
    textLight: dark ? 'text-gray-500' : 'text-gray-500',

    // Buttons
    btnPrimary: dark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white',
    btnSecondary: dark ? 'border border-gray-600 text-gray-300' : 'border border-gray-300 text-gray-700',
    btnSmall: dark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white',

    // Borders
    border: dark ? 'border-gray-700' : 'border-gray-200',
    borderLight: dark ? 'border-gray-800' : 'border-gray-100',
    divider: dark ? 'divide-gray-700' : 'divide-gray-200',

    // Form inputs
    input: dark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',

    // Highlighted card (pricing)
    hlBg: dark ? 'bg-white' : 'bg-gray-900',
    hlText: dark ? 'text-gray-900' : 'text-white',
    hlTextSecondary: dark ? 'text-gray-500' : 'text-gray-300',
    hlBtn: dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
  };
}
