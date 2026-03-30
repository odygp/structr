// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRIMITIVES — Raw color palette (Tailwind gray scale)
// Single source of truth. All semantic tokens reference these.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const primitives = {
  white:    '#ffffff',
  black:    '#000000',
  'gray-50':  '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
} as const;

export type PrimitiveKey = keyof typeof primitives;

// Tailwind class mappings for each primitive
export const twBg: Record<PrimitiveKey, string> = {
  white:      'bg-white',
  black:      'bg-black',
  'gray-50':  'bg-gray-50',
  'gray-100': 'bg-gray-100',
  'gray-200': 'bg-gray-200',
  'gray-300': 'bg-gray-300',
  'gray-400': 'bg-gray-400',
  'gray-500': 'bg-gray-500',
  'gray-600': 'bg-gray-600',
  'gray-700': 'bg-gray-700',
  'gray-800': 'bg-gray-800',
  'gray-900': 'bg-gray-900',
};

export const twText: Record<PrimitiveKey, string> = {
  white:      'text-white',
  black:      'text-black',
  'gray-50':  'text-gray-50',
  'gray-100': 'text-gray-100',
  'gray-200': 'text-gray-200',
  'gray-300': 'text-gray-300',
  'gray-400': 'text-gray-400',
  'gray-500': 'text-gray-500',
  'gray-600': 'text-gray-600',
  'gray-700': 'text-gray-700',
  'gray-800': 'text-gray-800',
  'gray-900': 'text-gray-900',
};

export const twBorder: Record<PrimitiveKey, string> = {
  white:      'border-white',
  black:      'border-black',
  'gray-50':  'border-gray-50',
  'gray-100': 'border-gray-100',
  'gray-200': 'border-gray-200',
  'gray-300': 'border-gray-300',
  'gray-400': 'border-gray-400',
  'gray-500': 'border-gray-500',
  'gray-600': 'border-gray-600',
  'gray-700': 'border-gray-700',
  'gray-800': 'border-gray-800',
  'gray-900': 'border-gray-900',
};

export const twDivide: Record<string, string> = {
  'gray-100': 'divide-gray-100',
  'gray-200': 'divide-gray-200',
  'gray-700': 'divide-gray-700',
  'gray-800': 'divide-gray-800',
};

export const twPlaceholder: Record<string, string> = {
  'gray-400': 'placeholder-gray-400',
  'gray-500': 'placeholder-gray-500',
};
