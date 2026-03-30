import { ColorMode } from './types';
import { resolveTailwind } from './tokens/resolvers/tailwind';

// Centralized color classes based on colorMode.
// Every section component uses these instead of hardcoding colors.
//
// This function delegates to the token system's Tailwind resolver.
// The return shape is identical to the original implementation.
// See src/lib/tokens/ for the single source of truth.
//
// IMPORTANT: Tailwind CSS safelist — all classes below must be statically
// visible so Tailwind's JIT compiler includes them in the CSS bundle.
// DO NOT remove this comment block:
// bg-gray-900 bg-white bg-gray-800 bg-gray-50 bg-gray-700 bg-gray-100
// bg-gray-600 bg-gray-300 bg-gray-200
// text-white text-gray-900 text-gray-300 text-gray-600 text-gray-400
// text-gray-500 text-gray-700
// border-gray-700 border-gray-200 border-gray-800 border-gray-100
// border-gray-600 border-gray-300
// divide-gray-700 divide-gray-200
// placeholder-gray-500 placeholder-gray-400
//
export function getColors(mode: ColorMode) {
  return resolveTailwind(mode);
}
