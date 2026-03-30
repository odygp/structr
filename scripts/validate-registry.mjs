#!/usr/bin/env node
/**
 * Validates that the section registry, component files, HTML export,
 * and AI system prompt are all in sync.
 *
 * Usage: node scripts/validate-registry.mjs
 * Exit code 0 = all good, 1 = mismatches found
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SECTIONS_DIR = path.join(ROOT, 'src/components/sections');
const INDEX_FILE = path.join(SECTIONS_DIR, 'index.ts');
const EXPORT_HTML_FILE = path.join(ROOT, 'src/lib/export-html.ts');
const PROMPT_FILE = path.join(ROOT, 'src/lib/ai/system-prompt.ts');
const REGISTRY_FILE = path.join(ROOT, 'src/lib/registry.ts');

const errors = [];
const warnings = [];

// ── 1. Parse registry: extract category->variants mapping ──
// Match each { category: '...', ... variants: [...] } block
const registrySrc = fs.readFileSync(REGISTRY_FILE, 'utf-8');
const categoryBlocks = registrySrc.split(/\/\/\s*──/).slice(1); // split by category comment markers

const categoryVariants = {}; // { category: [variantId, ...] }
for (const block of categoryBlocks) {
  const catMatch = block.match(/category:\s*'([^']+)'/);
  if (!catMatch) continue;
  const category = catMatch[1];
  const variants = [...block.matchAll(/variantId:\s*'([^']+)'/g)].map(m => m[1]);
  if (variants.length > 0) {
    categoryVariants[category] = variants;
  }
}

const allCategories = Object.keys(categoryVariants);
const allVariants = Object.values(categoryVariants).flat();

console.log(`Registry: ${allCategories.length} categories, ${allVariants.length} variants\n`);

// ── 2. Check component index has all variants ──
const indexSrc = fs.readFileSync(INDEX_FILE, 'utf-8');
for (const variant of allVariants) {
  if (!indexSrc.includes(`'${variant}'`)) {
    errors.push(`MISSING in index.ts: variant '${variant}' is in registry but not in component index`);
  }
}

// Check for orphan components
const indexVariants = [...indexSrc.matchAll(/'([a-z0-9-]+)':\s*\w+/g)].map(m => m[1]);
for (const variant of indexVariants) {
  if (!allVariants.includes(variant)) {
    warnings.push(`ORPHAN in index.ts: '${variant}' is in component index but not in registry`);
  }
}

// ── 3. Check .tsx files exist on disk ──
for (const [category, variants] of Object.entries(categoryVariants)) {
  const catDir = path.join(SECTIONS_DIR, category);
  if (!fs.existsSync(catDir)) {
    errors.push(`MISSING directory: src/components/sections/${category}/`);
    continue;
  }

  const files = fs.readdirSync(catDir).filter(f => f.endsWith('.tsx'));
  for (const variant of variants) {
    const found = files.some(f => {
      const name = f.replace('.tsx', '');
      return indexSrc.includes(`'${variant}': ${name}`);
    });
    if (!found) {
      errors.push(`MISSING .tsx file for variant '${variant}' in ${category}/`);
    }
  }
}

// ── 4. Check HTML export has renderers ──
const exportSrc = fs.readFileSync(EXPORT_HTML_FILE, 'utf-8');
for (const variant of allVariants) {
  if (!exportSrc.includes(`'${variant}'`)) {
    warnings.push(`MISSING HTML renderer for '${variant}'`);
  }
}

// ── 5. Check system prompt mentions all categories ──
const promptSrc = fs.readFileSync(PROMPT_FILE, 'utf-8');
for (const cat of allCategories) {
  const hasVariantListed = categoryVariants[cat].some(v => promptSrc.includes(v));
  if (!hasVariantListed) {
    warnings.push(`MISSING in system prompt: category '${cat}' has no variants listed`);
  }
}

// ── Report ──
if (errors.length > 0) {
  console.log('ERRORS (must fix):');
  errors.forEach(e => console.log(`  ✗ ${e}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('WARNINGS (should fix):');
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✓ All checks passed — registry, components, HTML export, and system prompt are in sync.');
}

process.exit(errors.length > 0 ? 1 : 0);
