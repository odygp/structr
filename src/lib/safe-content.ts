// Safe content utilities for handling AI-generated content that may not match expected types

/** Safely converts any value to a string. Handles objects by extracting label/title/name. */
export function safeStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    // Try common text field names
    if (typeof obj.label === 'string') return obj.label;
    if (typeof obj.title === 'string') return obj.title;
    if (typeof obj.name === 'string') return obj.name;
    if (typeof obj.text === 'string') return obj.text;
    if (typeof obj.value === 'string') return obj.value;
  }
  return String(v);
}

/** Ensures a value is always an array of record items. */
export function safeItems(v: unknown): Record<string, unknown>[] {
  if (Array.isArray(v)) return v.map(item => {
    if (typeof item === 'string') return { label: item, title: item, name: item };
    if (typeof item === 'object' && item !== null) return item as Record<string, unknown>;
    return { label: String(item) };
  });
  return [];
}

/** Parses a comma-separated string OR array into string[]. Handles objects in arrays. */
export function safeLinks(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map(item => {
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>;
        return String(obj.label || obj.title || obj.name || obj.text || '').trim();
      }
      return String(item).trim();
    }).filter(Boolean);
  }
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}
