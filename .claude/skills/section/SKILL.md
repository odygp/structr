---
name: section
description: Build and manage wireframe sections. Sub-commands: create (new category), add-variant (to existing category), validate (check registry sync). Use when building, extending, or validating section components.
argument-hint: <create|add-variant|validate> [name] [figma-url?]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# Section Management

Parse the sub-command from `$ARGUMENTS`:
- First word = sub-command: `create`, `add-variant`, or `validate`
- Remaining words = arguments (name, Figma URL, etc.)

If no sub-command is provided or it's unclear, ask the user which operation they want.

---

## Sub-command: `create`

Creates a brand new section category (e.g., newsletter, careers, integrations) with its own content fields.

### Full reference: @NEW_SECTION.md

### Workflow

**1. Gather requirements** — ask the user:
- Category name (if not in arguments)
- "Do you have a Figma design?" (if no URL in arguments)
- How many variants to create initially
- Key content fields the section needs

**2. If Figma URL provided** — extract design specs:
- `get_design_context` with the Figma URL to fetch layout, spacing, colors, typography
- `get_screenshot` for visual reference
- `get_variable_defs` for design token usage
- Map Figma values to Structr tokens:
  - Fills → `surface.*` / `ink.*` semantic tokens
  - Font sizes → typography scale (display=48, h1=36, h2=30, h3=24, h4=20, body-lg=18, body=16, body-sm=14, caption=12)
  - Corner radius → radius scale (none=0, sm=4, md=8, lg=12, xl=16, 2xl=24, full=9999)
  - Spacing → Tailwind gap/padding values
- Build pixel-perfect to the design

**3. Execute these steps:**
1. Design content schema — field types: `text`, `textarea`, `boolean`, `items` (with `itemFields`)
2. Create `src/components/sections/{category}/{VariantName}.tsx` — see component template below
3. Add full category to `src/lib/registry.ts` — `category`, `categoryLabel`, `icon`, `contentSchema`, `variants` array
4. Add to AI prompt in `src/lib/ai/system-prompt.ts` — add variants under "Available Section Categories and Variants" AND fields under "Content Fields Per Category" in `STRUCTURE_PROMPT`
5. Add HTML renderer in `src/lib/export-html.ts` — one per variant
6. Optional: Add thumbnail in `src/components/builder/VariantThumbnail.tsx`

**4. Auto-generate and validate:**
```bash
npm run generate:sections
npm run validate:registry
npm run build
```

**5. Verify** — preview in dev server (light + dark mode). If Figma design was provided, compare screenshots.

---

## Sub-command: `add-variant`

Adds a new variant (different layout) to an existing section category. Reuses the parent's content fields.

### Full reference: @NEW_VARIANT.md

### Workflow

**1. Gather requirements** — ask the user:
- Parent category (if not in arguments): header, hero, features, pricing, etc.
- Variant name: e.g., "with-video", "tabs", "minimal"
- "Do you have a Figma design?"

**2. If Figma URL provided** — same Figma MCP workflow as `create`.

**3. Check parent category** — read `src/lib/registry.ts`:
- Find the parent's `contentSchema` (the fields your variant MUST use)
- Check existing variants to avoid duplicating layouts
- Use `defaultContent` as starting point

**4. Execute these steps:**
1. Create `src/components/sections/{category}/{VariantName}.tsx`
2. Add variant to parent's `variants` array in `src/lib/registry.ts`
3. Add HTML renderer in `src/lib/export-html.ts`

**5. Auto-generate and validate:**
```bash
npm run generate:sections
npm run validate:registry
npm run build
```

**6. Verify** — preview in dev server (light + dark mode). No AI prompt changes needed (registry auto-syncs to validation).

---

## Sub-command: `validate`

Checks that all files are in sync. No arguments needed.

```bash
npm run validate:registry
```

This checks:
- Every variant in registry has a component file
- Every variant has an HTML export renderer
- AI system prompt mentions all categories
- Component index is up to date

If it reports issues, fix them. To regenerate the component index: `npm run generate:sections`

---

## Component Template

```tsx
'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function VariantName({
  content, colorMode, sectionId
}: {
  content: Record<string, any>;
  colorMode?: ColorMode;
  sectionId?: string;
}) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'category');
  const id = sectionId || '';

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        <EditableText
          sectionId={id}
          fieldKey="title"
          value={content.title as string}
          placeholder="Add headline..."
          tag="h1"
          className={`text-3xl @md:text-5xl font-bold ${c.text} leading-tight`}
        />
      </div>
    </section>
  );
}
```

## Token Quick Reference

Colors via `const c = getColors(colorMode || 'light')`:

| Token | Use |
|-------|-----|
| `c.bg` | Section background |
| `c.bgAlt` | Alternate/hero backgrounds |
| `c.bgCard` | Card surfaces |
| `c.bgCardAlt` | Nested cards |
| `c.bgMuted` | Badges, tags |
| `c.bgPlaceholder` | Image placeholder rectangles |
| `c.bgAvatar` | Avatar circles |
| `c.text` | Primary headings, body |
| `c.textSecondary` | Subtitles, descriptions |
| `c.textMuted` | Metadata, dates |
| `c.textLight` | Disabled/faint text |
| `c.btnPrimary` | Primary CTA button |
| `c.btnSecondary` | Secondary CTA button |
| `c.btnSmall` | Compact header buttons |
| `c.border` | Card borders |
| `c.borderLight` | Subtle separators |
| `c.divider` | Horizontal rules |
| `c.input` | Form fields (compound: bg + border + text + placeholder) |
| `c.hlBg` | Highlighted card background |
| `c.hlText` | Highlighted card text |
| `c.hlTextSecondary` | Highlighted secondary text |
| `c.hlBtn` | Highlighted card CTA |

Typography: `import { typeClass } from '@/lib/tokens'` — `typeClass('h1')` returns `'text-4xl font-bold tracking-tight'`

Radius: `import { radiusClass } from '@/lib/tokens'` — `radiusClass('lg')` returns `'rounded-xl'`

## Responsiveness Rules

**ALWAYS** use `@container` queries, **NEVER** viewport media queries:
- Grids: `grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3`
- Split: `flex flex-col @md:flex-row @md:items-center gap-8`
- Typography: `text-2xl @md:text-4xl @lg:text-5xl`
- Padding: `getSpacingClasses()` handles it
- Container: `max-w-7xl mx-auto`

## Content Rules

- ALL text → `<EditableText sectionId={id} fieldKey="key" value={content.key} tag="h1" className="..." />`
- Arrays → `(content.features || []).map(...)`
- Images → `<div className={`${c.bgPlaceholder} rounded-lg h-48`} />`
- Booleans → `content.showField !== false && <Element />`

## HTML Export Pattern

```typescript
'variant-id': (c) => `<section class="py-24 px-8">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-5xl font-bold text-gray-900 mb-6">${escapeHtml(str(c.title))}</h1>
    <p class="text-xl text-gray-600 mb-8">${escapeHtml(str(c.subtitle))}</p>
  </div>
</section>`,
```

Helpers: `escapeHtml(str)`, `str(val)` (safe string cast), `renderItems(items, fallback)` (safe array cast).
