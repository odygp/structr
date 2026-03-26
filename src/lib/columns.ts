export function getGridColsClass(columns: string | number | undefined): string {
  const cols = Number(columns) || 3;
  switch (cols) {
    case 2: return 'grid-cols-1 @md:grid-cols-2';
    case 3: return 'grid-cols-1 @md:grid-cols-3';
    case 4: return 'grid-cols-2 @md:grid-cols-4';
    default: return 'grid-cols-1 @md:grid-cols-3';
  }
}
