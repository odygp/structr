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

### Phase 1: Discovery (ask before doing anything)

Use AskUserQuestion or direct questions to gather ALL of the following before writing any code. Do NOT proceed to planning until you have answers for each.

**Q1 — Category name**
What is the section category called? (e.g., "newsletter", "careers", "integrations", "portfolio")

**Q2 — Description & purpose**
What is this section for? What problem does it solve on the page? Where does it typically appear in the page flow? (e.g., "A newsletter signup section that captures email addresses. Usually placed before the footer as a final conversion point.")

**Q3 — Content fields**
What content should be editable in this section? List every field the user should be able to customize. For each field, clarify:
- Field name and what it's for
- Type: short text, long text, on/off toggle, or a repeating list of items
- Example default value

Examples from existing categories:
- Hero: title, subtitle, primary CTA text, secondary CTA text, show/hide buttons
- Pricing: title, subtitle, plans (each with name, price, period, features, CTA, highlighted flag)
- FAQ: title, subtitle, questions (each with question + answer)

**Q4 — Variants**
How many layout variants do you want initially? Describe each briefly.
(e.g., "Two: one centered with a simple form, one split with image on the left and form on the right")

**Q5 — Figma design**
Do you have a Figma design for this section? If yes, paste the Figma URL(s).
- If Figma URL is provided, I will extract exact spacing, colors, typography, and build pixel-perfect
- If no Figma URL, I will use standard Structr layout patterns and tokens

**Q6 — Special behavior**
Anything unusual? (e.g., toggle between monthly/yearly, accordion expand/collapse, carousel, category filters, form validation)

### Phase 2: Plan

After gathering answers, enter plan mode and present an implementation plan:

1. **Content schema** — list every field with its type (`text`, `textarea`, `boolean`, `items` with `itemFields`)
2. **Default content** — the realistic placeholder values each variant starts with
3. **Layout description** — for each variant, describe the visual structure (grid, flexbox, centered, split, etc.)
4. **Figma mapping** (if URL provided) — show which Figma values map to which tokens
5. **Files to create/modify** — exact file paths

Wait for user approval before writing code.

### Phase 3: If Figma URL was provided

Extract design specs using Figma MCP tools:
- `get_design_context` with the Figma URL to fetch layout, spacing, colors, typography
- `get_screenshot` for visual reference
- `get_variable_defs` for design token usage
- Map Figma values to Structr tokens:
  - Fills → `surface.*` / `ink.*` semantic tokens
  - Font sizes → typography scale (display=48, h1=36, h2=30, h3=24, h4=20, body-lg=18, body=16, body-sm=14, caption=12)
  - Corner radius → radius scale (none=0, sm=4, md=8, lg=12, xl=16, 2xl=24, full=9999)
  - Spacing → Tailwind gap/padding values
- Build pixel-perfect to the design

### Phase 4: Execute

1. Create `src/components/sections/{category}/{VariantName}.tsx` — see component template below
2. Add full category to `src/lib/registry.ts` — `category`, `categoryLabel`, `icon`, `contentSchema`, `variants` array
3. Add to AI prompt in `src/lib/ai/system-prompt.ts` — add variants under "Available Section Categories and Variants" AND fields under "Content Fields Per Category" in `STRUCTURE_PROMPT`
4. Add HTML renderer in `src/lib/export-html.ts` — one per variant
5. Optional: Add thumbnail in `src/components/builder/VariantThumbnail.tsx`

### Phase 5: Auto-generate and validate

```bash
npm run generate:sections
npm run validate:registry
npm run build
```

### Phase 6: Verify

- Preview in dev server (light + dark mode)
- If Figma design was provided, compare preview screenshot with Figma screenshot
- Confirm HTML export renders correctly

---

## Sub-command: `add-variant`

Adds a new variant (different layout) to an existing section category. Reuses the parent's content fields.

### Full reference: @NEW_VARIANT.md

### Phase 1: Discovery

**Q1 — Parent category**
Which existing category? (header, hero, features, pricing, testimonials, faq, cta, blog, about, contact, team, footer, gallery, store, showcase, process, downloads, comparison, error, banner, logos, stats)

**Q2 — Variant name & description**
What should this variant be called and what makes it different from existing variants?
(e.g., "hero-video — like hero-centered but with a full-width video embed instead of an image placeholder")

**Q3 — Figma design**
Do you have a Figma design? Paste the URL if yes.

**Q4 — Special behavior**
Anything beyond a layout change? (e.g., new interactive elements, animations)

### Phase 2: Plan

Read `src/lib/registry.ts` and find the parent category's `contentSchema` and existing variants. Then present a plan:

1. **Parent fields** — confirm which content fields from the schema this variant will use
2. **Layout description** — how this variant arranges the fields differently
3. **Figma mapping** (if URL provided)
4. **Files to create/modify**

Wait for approval.

### Phase 3: If Figma URL provided — same workflow as `create`.

### Phase 4: Execute

1. Create `src/components/sections/{category}/{VariantName}.tsx`
2. Add variant to parent's `variants` array in `src/lib/registry.ts`
3. Add HTML renderer in `src/lib/export-html.ts`

### Phase 5: Auto-generate and validate

```bash
npm run generate:sections
npm run validate:registry
npm run build
```

### Phase 6: Verify

Preview in dev server (light + dark mode). No AI prompt changes needed (registry auto-syncs).

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
