// Parses Octopus.do export files (CSV, XLSX, XML, TXT) into a unified page list

import * as XLSX from 'xlsx';

export interface OctopusPage {
  name: string;
  level: number;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  blocks?: string[]; // block/section titles from the page
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

  // Auto-detect
  if (text.trim().startsWith('<?xml') || text.includes('<octopus')) return parseOctopusXML(text);
  if (text.includes(',') && text.split('\n')[0].includes(',')) return parseOctopusCSV(text);
  return parseOctopusTXT(text);
}

// ── CSV Parser ──
// Octopus.do CSV format:
//   Parent Page ID, Page ID, Page title, Block title, Block content, ...
// Pages have Page title set, blocks have Block title set
export function parseOctopusCSV(text: string): OctopusPage[] {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Detect delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  // Parse header
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

  // Find column indices
  const parentIdIdx = headers.findIndex(h => h.includes('parent') && h.includes('id'));
  const pageIdIdx = headers.findIndex(h => h === 'page id' || (h.includes('page') && h.includes('id') && !h.includes('parent')));
  const pageTitleIdx = headers.findIndex(h => h === 'page title' || h === 'page name');
  const blockTitleIdx = headers.findIndex(h => h === 'block title' || h === 'block name');
  const blockContentIdx = headers.findIndex(h => h === 'block content');
  const seoTitleIdx = headers.findIndex(h => h === 'seo title');
  const seoDescIdx = headers.findIndex(h => h === 'seo description');
  const seoH1Idx = headers.findIndex(h => h === 'seo h1');

  // Parse rows
  const rows = lines.slice(1).map(l => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of l) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === delimiter.charAt(0) && !inQuotes) { cells.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  });

  // Build page map: pageId → { name, parentId, blocks, seo }
  const pageMap = new Map<string, {
    name: string;
    parentId: string | null;
    blocks: string[];
    seoTitle?: string;
    seoDesc?: string;
    seoH1?: string;
  }>();

  // First pass: find pages (rows with Page title)
  const rootPageId = rows.find(r => {
    const parentId = parentIdIdx >= 0 ? r[parentIdIdx] : '';
    const pageTitle = pageTitleIdx >= 0 ? r[pageTitleIdx] : '';
    return (parentId === 'null' || parentId === '' || !parentId) && pageTitle;
  })?.[pageIdIdx >= 0 ? pageIdIdx : 1] || '';

  for (const row of rows) {
    const pageId = pageIdIdx >= 0 ? row[pageIdIdx] : row[1] || '';
    const parentId = parentIdIdx >= 0 ? row[parentIdIdx] : row[0] || '';
    const pageTitle = pageTitleIdx >= 0 ? row[pageTitleIdx] : '';
    const blockTitle = blockTitleIdx >= 0 ? row[blockTitleIdx] : '';
    const seoTitle = seoTitleIdx >= 0 ? row[seoTitleIdx] : undefined;
    const seoDesc = seoDescIdx >= 0 ? row[seoDescIdx] : undefined;
    const seoH1 = seoH1Idx >= 0 ? row[seoH1Idx] : undefined;

    if (pageTitle && pageTitle !== 'null') {
      // This is a page row
      pageMap.set(pageId, {
        name: pageTitle,
        parentId: parentId === 'null' ? null : parentId || null,
        blocks: [],
        seoTitle: seoTitle && seoTitle !== 'null' ? seoTitle : undefined,
        seoDesc: seoDesc && seoDesc !== 'null' ? seoDesc : undefined,
        seoH1: seoH1 && seoH1 !== 'null' ? seoH1 : undefined,
      });
    } else if (blockTitle && blockTitle !== 'null') {
      // This is a block row — find the parent page
      const parent = parentId && parentId !== 'null' ? parentId : '';
      const page = pageMap.get(parent);
      if (page) {
        page.blocks.push(blockTitle);
      }
    }
  }

  // Build hierarchy levels
  const levelMap = new Map<string, number>();
  function getLevel(pageId: string): number {
    if (levelMap.has(pageId)) return levelMap.get(pageId)!;
    const page = pageMap.get(pageId);
    if (!page || !page.parentId || page.parentId === rootPageId) {
      levelMap.set(pageId, 0);
      return 0;
    }
    const parentLevel = pageMap.has(page.parentId) ? getLevel(page.parentId) : -1;
    const level = parentLevel + 1;
    levelMap.set(pageId, level);
    return level;
  }

  const pages: OctopusPage[] = [];
  for (const [pageId, page] of pageMap) {
    pages.push({
      name: page.name,
      level: getLevel(pageId),
      description: page.blocks.length > 0 ? page.blocks.join(', ') : undefined,
      seoTitle: page.seoTitle || page.seoH1,
      seoDescription: page.seoDesc,
      blocks: page.blocks,
    });
  }

  return pages;
}

// ── XLSX Parser ──
export function parseOctopusXLSX(buffer: ArrayBuffer): OctopusPage[] {
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Try CSV-style parsing on each sheet
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const pages = parseOctopusCSV(csv);
    if (pages.length > 0) return pages;
  }

  // Fallback: just read first column as page names
  let bestPages: OctopusPage[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
    if (rows.length === 0) continue;

    const nameKey = Object.keys(rows[0])[0];
    const pages = rows
      .filter(r => r[nameKey]?.toString().trim())
      .map(r => ({ name: r[nameKey].toString().trim(), level: 0 }));

    if (pages.length > bestPages.length) bestPages = pages;
  }

  return bestPages;
}

// ── XML Parser (Octopus.do format) ──
// Octopus.do XML uses <octopus><tree><node> structure, NOT sitemap.xml
export function parseOctopusXML(text: string): OctopusPage[] {
  const pages: OctopusPage[] = [];

  // Check if it's Octopus.do format
  if (text.includes('<octopus') || text.includes('<tree>')) {
    parseOctopusNodes(text, pages, 0);
  } else {
    // Standard sitemap.xml fallback
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
            .replace(/\.\w+$/, '')
            .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          pages.push({ name: pageName, level: segments.length - 1 });
        }
      } catch {
        pages.push({ name: url, level: 0 });
      }
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

function parseOctopusNodes(xml: string, pages: OctopusPage[], level: number) {
  // Find all <node> elements and their content
  // Octopus.do XML has nested <node> elements inside <tree> or inside other <node>s

  // Extract top-level nodes from the tree
  const nodeRegex = /<node>([\s\S]*?)<\/node>/g;

  // We need a recursive approach. Since XML parsing without a DOM is tricky,
  // let's use a simpler regex-based approach that finds <text> and <block> tags

  // Strategy: find all <text> tags that represent page names
  // and <block><title> tags that represent blocks within pages
  // The nesting of <node> determines the level

  // Simple approach: split by <node> and track depth
  let depth = 0;
  let currentPage: OctopusPage | null = null;
  const lines = xml.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '<node>') {
      depth++;
    } else if (trimmed === '</node>') {
      if (currentPage) {
        pages.push(currentPage);
        currentPage = null;
      }
      depth--;
    } else if (trimmed.startsWith('<text>') || (trimmed.startsWith('<text') && trimmed.includes('>'))) {
      const textMatch = trimmed.match(/<text>(.*?)<\/text>/);
      if (textMatch) {
        const name = textMatch[1].trim();
        if (name) {
          currentPage = { name, level: Math.max(0, depth - 2), blocks: [] }; // depth-2 because <tree> and first <node>
        }
      }
    } else if (trimmed.startsWith('<title>') && currentPage) {
      const titleMatch = trimmed.match(/<title>(.*?)<\/title>/);
      if (titleMatch) {
        const blockTitle = titleMatch[1].trim();
        if (blockTitle && currentPage.blocks) {
          currentPage.blocks.push(blockTitle);
        }
      }
    }
  }

  // Handle multiline <text> tags
  if (pages.length === 0) {
    // Try multiline approach
    const textRegex = /<text>\s*([\s\S]*?)\s*<\/text>/g;
    const blockRegex = /<block>\s*<title>\s*([\s\S]*?)\s*<\/title>/g;
    let match;
    const allTexts: string[] = [];
    const blocksByIndex: Map<number, string[]> = new Map();

    while ((match = textRegex.exec(xml)) !== null) {
      allTexts.push(match[1].trim());
    }

    // Find blocks between consecutive <text> tags
    let lastTextEnd = 0;
    for (let i = 0; i < allTexts.length; i++) {
      const textPos = xml.indexOf(allTexts[i], lastTextEnd);
      const nextTextPos = i < allTexts.length - 1 ? xml.indexOf(allTexts[i + 1], textPos + allTexts[i].length) : xml.length;

      const sectionXml = xml.substring(textPos, nextTextPos);
      const blocks: string[] = [];
      let bm;
      const localBlockRegex = /<title>\s*([\s\S]*?)\s*<\/title>/g;
      while ((bm = localBlockRegex.exec(sectionXml)) !== null) {
        const bt = bm[1].trim();
        if (bt && bt !== allTexts[i]) blocks.push(bt);
      }

      blocksByIndex.set(i, blocks);
      lastTextEnd = textPos + allTexts[i].length;
    }

    // Determine levels from node nesting depth
    for (let i = 0; i < allTexts.length; i++) {
      const name = allTexts[i];
      if (!name) continue;

      // Find nesting depth by counting parent <node> tags before this text
      const pos = xml.indexOf(name);
      const before = xml.substring(0, pos);
      const openNodes = (before.match(/<node>/g) || []).length;
      const closeNodes = (before.match(/<\/node>/g) || []).length;
      const depth = Math.max(0, openNodes - closeNodes - 2); // -2 for <tree> wrapper

      const blocks = blocksByIndex.get(i) || [];
      pages.push({
        name,
        level: depth,
        description: blocks.length > 0 ? blocks.join(', ') : undefined,
        blocks,
      });
    }
  }
}

// ── TXT Parser (Octopus.do numbered format) ──
// Format:
//   1 Home
//     Header
//     Hero section
//   1.1 Services
//     Feature 1
//     Feature 2
//   1.2 Pricing
export function parseOctopusTXT(text: string): OctopusPage[] {
  const lines = text.split('\n');
  const pages: OctopusPage[] = [];
  let currentPage: OctopusPage | null = null;

  // Skip header lines (first few lines are metadata)
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\d+(\.\d+)*\s+\S/)) {
      startIdx = i;
      break;
    }
  }

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this is a page line (starts with a number like "1", "1.1", "1.2.3")
    const pageMatch = trimmed.match(/^(\d+(?:\.\d+)*)\s+(.+)$/);

    if (pageMatch) {
      // Save previous page
      if (currentPage) pages.push(currentPage);

      const number = pageMatch[1];
      const name = pageMatch[2].trim();
      const level = number.split('.').length - 1; // "1" = 0, "1.1" = 1, "1.1.1" = 2

      currentPage = { name, level, blocks: [] };
    } else if (currentPage && trimmed) {
      // This is a block/section within the current page
      if (!currentPage.blocks) currentPage.blocks = [];
      currentPage.blocks.push(trimmed);
    }
  }

  // Don't forget the last page
  if (currentPage) pages.push(currentPage);

  // Add description from blocks
  for (const page of pages) {
    if (page.blocks && page.blocks.length > 0) {
      page.description = page.blocks.join(', ');
    }
  }

  return pages;
}
