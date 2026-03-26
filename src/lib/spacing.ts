export function getSpacingClasses(spacing: string | undefined, category?: string): string {
  if (category === 'header' || category === 'banner') {
    switch (spacing) {
      case 'compact': return 'py-2 px-4';
      case 'spacious': return 'py-6 px-12';
      default: return 'py-4 px-8';
    }
  }
  if (category === 'footer') {
    switch (spacing) {
      case 'compact': return 'py-8 px-6';
      case 'spacious': return 'py-20 px-12';
      default: return 'py-16 px-8';
    }
  }
  switch (spacing) {
    case 'compact': return 'py-10 px-6';
    case 'spacious': return 'py-28 px-12';
    default: return 'py-20 px-8';
  }
}
