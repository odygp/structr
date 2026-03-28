// Parses Octopus.do export files (CSV, XLSX, XML, TXT) into a unified page list

import * as XLSX from 'xlsx';

export interface OctopusPage {
  name: string;
  level: number;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentName?: string;
}

// ── Auto-detect format and parse ──
export function parseOctopusFile(content: string | ArrayBuffer, filename: string): OctopusPage[] {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (ext === 'xlsx' || ext === 'xls') {
    return parseOctopusXLSX(content as ArrayBuffer);
  }

  const text = typeof content === 'string' ? content : new TextDecoder().decode(content as ArrayBuffer);

  if (ext === 'xml') return parseOctopusXML(text);
  if (ext === 'csv') return parseOctopusCSV(text);
  if (ext === 'txt') return parseOctopusTXT(text);

  // Try to auto-detect
  if (text.trim().startsWith('<?xml') || text.trim().startsWith('<urlset')) return parseOctopusXML(text);
  if (text.includes(',') && text.split('\n')[0].includes(',')) return parseOctopusCSV(text);
  return parseOctopusTXT(text);
}

// ── CSV Parser ──
// Handles formats like:
//   Page Name, Level, Description
//   Home, 0, Main landing page
//   About Us, 1, Company info
// Or Octopus.do style with semicolons
export function parseOctopusCSV(text: string): OctopusPage[] {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Detect delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  const rows = lines.map(l => l.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, '')));

  // Detect header row
  const header = rows[0].map(h => h.toLowerCase());
  const hasHeader = header.some(h =>
    ['name', 'page', 'title', 'label', 'level', 'depth', 'description', 'url'].includes(h)
  );

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const headerRow = hasHeader ? header : [];

  // Find column indices
  const nameIdx = headerRow.findIndex(h => ['name', 'page', 'title', 'label', 'page name', 'page title'].includes(h));
  const levelIdx = headerRow.findIndex(h => ['level', 'depth', 'hierarchy'].includes(h));
  const descIdx = headerRow.findIndex(h => ['description', 'desc', 'notes', 'content'].includes(h));
  const seoTitleIdx = headerRow.findIndex(h => ['seo title', 'meta title', 'seo_title'].includes(h));
  const seoDescIdx = headerRow.findIndex(h => ['seo description', 'meta description', 'seo_description'].includes(h));

  return dataRows
    .filter(row => row.length > 0 && row[0])
    .map(row => {
      const name = row[nameIdx >= 0 ? nameIdx : 0] || '';
      const level = levelIdx >= 0 ? parseInt(row[levelIdx]) || 0 : 0;
      const description = descIdx >= 0 ? row[descIdx] : undefined;
      const seoTitle = seoTitleIdx >= 0 ? row[seoTitleIdx] : undefined;
      const seoDescription = seoDescIdx >= 0 ? row[seoDescIdx] : undefined;

      return { name, level, description, seoTitle, seoDescription };
    })
    .filter(p => p.name.trim());
}

// ── XLSX Parser ──
export function parseOctopusXLSX(buffer: ArrayBuffer): OctopusPage[] {
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Try each sheet, pick the one with most page-like data
  let bestPages: OctopusPage[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });

    if (rows.length === 0) continue;

    // Find the column that contains page names
    const headers = Object.keys(rows[0]).map(h => h.toLowerCase());
    const nameKey = Object.keys(rows[0]).find((_, i) =>
      ['name', 'page', 'title', 'label', 'page name', 'page title'].includes(headers[i])
    ) || Object.keys(rows[0])[0]; // fallback to first column

    const levelKey = Object.keys(rows[0]).find((_, i) =>
      ['level', 'depth', 'hierarchy'].includes(headers[i])
    );
    const descKey = Object.keys(rows[0]).find((_, i) =>
      ['description', 'desc', 'notes', 'content'].includes(headers[i])
    );
    const seoTitleKey = Object.keys(rows[0]).find((_, i) =>
      ['seo title', 'meta title', 'seo_title'].includes(headers[i])
    );
    const seoDescKey = Object.keys(rows[0]).find((_, i) =>
      ['seo description', 'meta description', 'seo_description'].includes(headers[i])
    );

    const pages = rows
      .filter(row => row[nameKey]?.toString().trim())
      .map(row => ({
        name: row[nameKey]?.toString().trim() || '',
        level: levelKey ? parseInt(row[levelKey]?.toString()) || 0 : 0,
        description: descKey ? row[descKey]?.toString() : undefined,
        seoTitle: seoTitleKey ? row[seoTitleKey]?.toString() : undefined,
        seoDescription: seoDescKey ? row[seoDescKey]?.toString() : undefined,
      }));

    if (pages.length > bestPages.length) bestPages = pages;
  }

  return bestPages;
}

// ── XML Parser (sitemap.xml) ──
export function parseOctopusXML(text: string): OctopusPage[] {
  const pages: OctopusPage[] = [];

  // Extract <loc> tags from sitemap.xml
  const locRegex = /<loc>\s*(.*?)\s*<\/loc>/gi;
  let match;

  while ((match = locRegex.exec(text)) !== null) {
    const url = match[1].trim();
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.replace(/^\/|\/$/g, '');

      if (!path) {
        pages.push({ name: 'Home', level: 0 });
      } else {
        const segments = path.split('/');
        const pageName = segments[segments.length - 1]
          .replace(/[-_]/g, ' ')
          .replace(/\.\w+$/, '') // remove file extensions
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        pages.push({
          name: pageName,
          level: segments.length - 1,
          parentName: segments.length > 1
            ? segments[segments.length - 2].replace(/[-_]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : undefined,
        });
      }
    } catch {
      // If URL parsing fails, use the raw text
      pages.push({ name: url, level: 0 });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return pages.filter(p => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── TXT Parser (indented page tree) ──
// Handles formats like:
//   Home
//     About Us
//       Team
//     Services
//       Web Design
//       Development
//     Contact
export function parseOctopusTXT(text: string): OctopusPage[] {
  const lines = text.split('\n').filter(l => l.trim());

  return lines.map(line => {
    // Count leading whitespace (spaces or tabs)
    const match = line.match(/^(\s*)/);
    const indent = match ? match[1].length : 0;

    // Determine level based on indent
    // Tabs = 1 level each, spaces = detect unit (usually 2 or 4)
    const hasTabs = line.startsWith('\t');
    let level: number;

    if (hasTabs) {
      level = (line.match(/^\t*/)?.[0]?.length) || 0;
    } else {
      // Auto-detect indent unit from first indented line
      const firstIndent = lines.find(l => l.match(/^ +/))?.match(/^ +/)?.[0]?.length || 2;
      level = Math.floor(indent / firstIndent);
    }

    const name = line.trim();

    // Check if line has a description after a separator (e.g., "About Us - Company info")
    const parts = name.split(/\s*[-–—|]\s*/);
    if (parts.length > 1) {
      return {
        name: parts[0].trim(),
        level,
        description: parts.slice(1).join(' ').trim(),
      };
    }

    return { name, level };
  }).filter(p => p.name);
}
