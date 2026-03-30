# Structr Component Building Guide

This guide is the single reference for building new section components and updating existing ones. Follow these rules exactly — they ensure consistency across all 500+ components and all export targets.

## Token System (`src/lib/tokens/`)

All colors, typography, spacing, radius, and shadows are defined as **design tokens** with a single source of truth. Tokens resolve to different formats per export target:

| Resolver | Output | Used by |
|----------|--------|---------|
| `resolvers/tailwind.ts` | Tailwind class strings | React components |
| `resolvers/hex.ts` | Hex color values | PDF, JSON/CMS export |
| `resolvers/figma.ts` | 0-1 RGB values | Figma plugin |
| `resolvers/css.ts` | CSS custom properties | Webflow, runtime theming |

## Building a React Component

### Required imports (always the same)

```tsx
'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';
```

### Component structure

```tsx
export default function SectionName({
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
    <section className={`${spacing} ${c.bg}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section content here */}
      </div>
    </section>
  );
}
```

### Token usage reference

| Token | Use for | Example |
|-------|---------|---------|
| `c.bg` | Section background | `<section className={c.bg}>` |
| `c.bgAlt` | Alternate/hero backgrounds | Hero sections, dark CTA |
| `c.bgCard` | Card surfaces | Feature cards, pricing cards |
| `c.bgCardAlt` | Alternate card bg | Nested cards |
| `c.bgMuted` | Badges, tags, subtle fills | Category pills, status badges |
| `c.bgPlaceholder` | Image placeholder rectangles | `<div className={`${c.bgPlaceholder} rounded-lg h-48`}>` |
| `c.bgAvatar` | Circular avatar placeholders | Team member avatars |
| `c.text` | Primary headings and body | H1, H2, strong body text |
| `c.textSecondary` | Subtitles, descriptions | Paragraphs below headings |
| `c.textMuted` | Metadata, dates, captions | Timestamps, helper text |
| `c.textLight` | Disabled/faint text | Hint text, placeholders |
| `c.btnPrimary` | Primary CTA button | `<div className={`${c.btnPrimary} px-6 py-3 rounded-xl`}>` |
| `c.btnSecondary` | Secondary CTA button | Outline buttons |
| `c.btnSmall` | Compact header buttons | Nav CTA buttons |
| `c.border` | Card and section borders | `border ${c.border}` |
| `c.borderLight` | Subtle separators | Light dividers |
| `c.divider` | Horizontal rules | `<div className={c.divider}>` |
| `c.input` | Form fields (compound) | `<input className={`${c.input} rounded-lg px-4 py-3`}>` |
| `c.hlBg` | Highlighted card bg | "Most popular" pricing tier |
| `c.hlText` | Highlighted card text | Inverse text on featured card |
| `c.hlTextSecondary` | Highlighted secondary text | Muted text on featured card |
| `c.hlBtn` | Highlighted card CTA | CTA button on featured card |

### Typography helpers (optional, for new components)

```tsx
import { typeClass } from '@/lib/tokens';

// Returns Tailwind classes: 'text-4xl font-bold tracking-tight'
<h1 className={`${typeClass('h1')} ${c.text}`}>...</h1>

// Available scales: display, h1, h2, h3, h4, body-lg, body, body-sm, caption, label, label-sm
```

### Border radius helpers (optional)

```tsx
import { radiusClass } from '@/lib/tokens';

// Returns: 'rounded-xl'
<div className={radiusClass('lg')}>...</div>

// Available: none, sm, md, lg, xl, 2xl, full
```

## Responsiveness Rules

### Container queries (REQUIRED for all components)

Components render inside the Structr builder panel at variable widths. **Always use `@container` queries**, not viewport media queries.

```tsx
// Correct — adapts to container width
<div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3">

// WRONG — would break in the builder preview
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Standard responsive patterns

**Grids:**
```
grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3
```

**Split layouts:**
```
flex flex-col @md:flex-row @md:items-center gap-8
```

**Typography scaling:**
```
text-2xl @md:text-4xl @lg:text-5xl  (headings)
text-base @md:text-lg               (body)
```

**Section padding:**
```
Use getSpacingClasses() — handles all responsive padding
```

**Container width:**
```
max-w-7xl mx-auto
```

### Content rules

- ALL text must be wrapped in `<EditableText>` for inline editing
- Array content: `(content.features || []).map(...)`
- Image placeholders: `<div className={`${c.bgPlaceholder} rounded-lg`} />`
- Boolean toggles: `content.showField !== false && <Element />`
- Default values: always provide fallbacks for optional content fields

## Files to Update Per New Variant

1. **Component TSX**: `src/components/sections/{category}/{VariantName}.tsx`
2. **Component registry**: `src/components/sections/index.ts` — add import + map entry
3. **Section registry**: `src/lib/registry.ts` — add contentSchema + defaultContent + variant entry
4. **AI parse validation**: `src/lib/ai/parse-response.ts` — add to `VALID_VARIANTS`
5. **AI system prompt**: `src/lib/ai/system-prompt.ts` — add variant to category list with description
6. **HTML export**: `src/lib/export-html.ts` — add HTML renderer function
7. **Variant thumbnail**: `src/components/builder/VariantThumbnail.tsx` — optional SVG preview

## Figma Component Requirements

Every section exported to Figma must be a proper component (not detached frames):

### Required component properties

| Content field type | Figma property type | Notes |
|---|---|---|
| `text` field | TEXT property | `addComponentProperty("Headline", "TEXT", "Default")` |
| `textarea` field | TEXT property | Same as text, longer default |
| `boolean` field | BOOLEAN property | Wraps element in frame, binds visibility via `linkVis()` |
| `image` field | Not a property | Uses Image Placeholder atom instance |
| `items` array | Nested instances | Each item = instance of a molecule component |

### Color binding (mandatory)

All fills and strokes must be bound to Figma Variables (Semantic Colors collection):

```javascript
bindFill(sectionFrame, 'bg');           // section background
bindFill(cardFrame, 'bgCard');          // card surface
bindFill(headingText, 'text');          // primary text
bindFill(subtitleText, 'textSecondary'); // secondary text
bindStroke(cardFrame, 'border');        // card border
```

### Auto-layout rules

- Section width: FILL (stretches to parent)
- Section height: HUG (adapts to content)
- Cards: set `minWidth: 280` for grid flexibility
- Text nodes: `textAutoResize = "HEIGHT"` with fixed width

## Pre-Merge Checklist

Every Claude session must verify ALL of these before committing:

- [ ] `npm run build` passes with zero TypeScript errors
- [ ] Dev server renders the section correctly (screenshot via preview MCP)
- [ ] Section renders in BOTH light and dark mode (verified)
- [ ] HTML export includes correct token classes for the section's color mode
- [ ] `test-project.json` is generated with the new section (both modes)
- [ ] Section appears in the catalog and can be added to a project
- [ ] AI generation can produce the section (variant ID in VALID_VARIANTS + system prompt)
- [ ] If Figma link provided: verify component properties + variable bindings via Figma MCP
