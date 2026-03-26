export function getSpacingClasses(spacing: string | undefined, category?: string): string {
  if (category === 'header' || category === 'banner') {
    switch (spacing) {
      case 'compact': return 'py-2 px-3 @md:px-4';
      case 'spacious': return 'py-6 px-4 @md:px-12';
      default: return 'py-4 px-4 @md:px-8';
    }
  }
  if (category === 'footer') {
    switch (spacing) {
      case 'compact': return 'py-6 @md:py-8 px-4 @md:px-6';
      case 'spacious': return 'py-14 @md:py-20 px-4 @md:px-12';
      default: return 'py-10 @md:py-16 px-4 @md:px-8';
    }
  }
  switch (spacing) {
    case 'compact': return 'py-8 @md:py-10 px-4 @md:px-6';
    case 'spacious': return 'py-20 @md:py-28 px-4 @md:px-12';
    default: return 'py-14 @md:py-20 px-4 @md:px-8';
  }
}
