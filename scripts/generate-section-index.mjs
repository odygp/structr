#!/usr/bin/env node
/**
 * Generates src/components/sections/index.ts from the filesystem.
 * Scans each category directory for .tsx files and builds the
 * import list + componentRegistry map.
 *
 * Usage: node scripts/generate-section-index.mjs
 */

import fs from 'fs';
import path from 'path';

const SECTIONS_DIR = path.resolve('src/components/sections');
const OUTPUT = path.join(SECTIONS_DIR, 'index.ts');

// Directories to skip (not section categories)
const SKIP = new Set(['__tests__', 'shared', 'utils']);

// Collect all category directories
const categories = fs.readdirSync(SECTIONS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && !SKIP.has(d.name))
  .map(d => d.name)
  .sort();

const imports = [];
const entries = [];

for (const cat of categories) {
  const catDir = path.join(SECTIONS_DIR, cat);
  const files = fs.readdirSync(catDir)
    .filter(f => f.endsWith('.tsx') && !f.startsWith('_'))
    .sort();

  if (files.length === 0) continue;

  imports.push(`// ${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
  entries.push(`  // ${cat.charAt(0).toUpperCase() + cat.slice(1)}`);

  for (const file of files) {
    const componentName = file.replace('.tsx', '');
    const variantId = componentNameToVariantId(componentName, cat);

    imports.push(`import ${componentName} from './${cat}/${componentName}';`);
    entries.push(`  '${variantId}': ${componentName},`);
  }

  imports.push('');
  entries.push('');
}

/**
 * Convert PascalCase component name to kebab-case variant ID.
 * Handles: CTA -> cta (not c-t-a), 2Column -> 2column, 4Col -> 4col
 * Uses the category directory name as the prefix (Logo->logos, Download->downloads).
 */
function componentNameToVariantId(name, category) {
  // Split PascalCase: handle runs of uppercase (CTA->CTA), numbers (2Column->2Column)
  const parts = name.match(/[A-Z]{2,}(?=[A-Z][a-z]|$)|\d+[A-Za-z]*|[A-Z][a-z]*/g) || [];
  const kebabParts = parts.map(p => p.toLowerCase());

  // Replace the first part (component prefix) with the actual category name
  // e.g. "logo" -> "logos", "download" -> "downloads"
  const componentPrefix = kebabParts[0];
  if (category.startsWith(componentPrefix) && componentPrefix !== category) {
    kebabParts[0] = category;
  }

  return kebabParts.join('-');
}

const output = `import { ComponentType } from 'react';
import { ColorMode } from '@/lib/types';

${imports.join('\n')}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionComponentProps = { content: any; colorMode?: ColorMode; sectionId?: string };

export const componentRegistry: Record<string, ComponentType<SectionComponentProps>> = {
${entries.join('\n')}};
`;

fs.writeFileSync(OUTPUT, output, 'utf-8');

console.log(`Generated ${OUTPUT}`);
console.log(`  Categories: ${categories.length}`);
console.log(`  Components: ${entries.filter(e => e.includes("'")).length}`);
