# How to Create a New Section Category in Structr

This document is a self-contained guide for an AI coding agent (Claude Code) to autonomously create a brand new section category in the Structr wireframe builder. Follow every step in order. Do not skip steps.

---

## 1. Overview: Categories vs Variants

A **section category** is a distinct content type with its own unique set of fields. Examples: `hero`, `pricing`, `faq`, `team`. Each category defines a `contentSchema` that describes what data it holds (title, subtitle, items array, etc.).

A **variant** is a different visual layout of the same content fields. For example, the `hero` category has five variants: `hero-centered`, `hero-split`, `hero-with-image`, `hero-minimal`, `hero-with-form`. All five share the same content fields (title, subtitle, ctaText, etc.) but render them in different arrangements.

When creating a new section category, you are creating:
1. A new content schema (what fields the section has)
2. One or more variant components (how those fields are displayed)
3. Registration in the central registry
4. AI prompt integration so the AI can generate this section type
5. HTML export renderers for each variant

The project currently has **22 section categories** and **87 total variants**.

---

## 2. Figma Design Reference (Optional Step 0)

If a Figma URL is provided with the request, use the Figma MCP tools to extract design specifications before writing any code.

### Extract design context
```
Use get_design_context MCP tool with the fileKey and nodeId extracted from the URL.
URL format: https://figma.com/design/:fileKey/:fileName?node-id=:nodeId
```

### Get visual reference
```
Use get_screenshot MCP tool to capture the node for visual comparison.
```

### Check design tokens/variables
```
Use get_variable_defs MCP tool to see which design tokens the Figma file uses.
```

### Map Figma values to Structr tokens

**Fills (background/text colors):** Map to the semantic color tokens from `getColors()`. Do NOT hardcode hex values. Use token names like `c.bg`, `c.text`, `c.bgCard`, etc. See the full token table in Section 11.

**Font sizes:** Map to the typography scale:

| Figma size | Structr equivalent |
|---|---|
| 48px | `text-5xl` (display) |
| 36px | `text-4xl` (h1) |
| 30px | `text-3xl` (h2) |
| 24px | `text-2xl` (h3) |
| 20px | `text-xl` (h4) |
| 18px | `text-lg` (body-lg) |
| 16px | `text-base` (body) |
| 14px | `text-sm` (body-sm / label) |
| 12px | `text-xs` (caption / label-sm) |

**Spacing:** Map to Tailwind gap/padding values. Use `getSpacingClasses()` for outer section padding. Inner spacing uses standard Tailwind: `gap-4`, `gap-6`, `gap-8`, `p-6`, `p-8`, etc.

**Corner radius:** Map to the radius scale:

| Figma radius | Tailwind class |
|---|---|
| 0 | `rounded-none` |
| 4px | `rounded-sm` |
| 8px | `rounded-lg` |
| 12px | `rounded-xl` |
| 16px | `rounded-2xl` |
| 24px | `rounded-3xl` |
| 9999px | `rounded-full` |

### Verify fidelity
After building the component, use the preview MCP tools to take a screenshot and compare it side-by-side with the Figma screenshot. Adjust spacing, sizing, and colors until the implementation matches.

If **no Figma URL** is provided, skip this step entirely and use standard template patterns based on existing sections.

---

## 3. Step 1 -- Design the Content Schema

The content schema defines what editable fields appear in the sidebar when a user selects this section. It lives in `src/lib/registry.ts`.

### Field types

| Type | Description | Example use |
|---|---|---|
| `text` | Single-line text input | Titles, button labels, names |
| `textarea` | Multi-line text input | Descriptions, long content |
| `boolean` | Toggle switch | Show/hide elements |
| `items` | Repeating array of objects | List items, cards, team members |

The `items` type requires a nested `itemFields` array defining the shape of each item.

### TypeScript types (from `src/lib/types.ts`)

```typescript
export type FieldType = 'text' | 'textarea' | 'image' | 'items' | 'boolean';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  itemFields?: FieldSchema[];
}

export type ContentValue = string | boolean | ContentItem[];

export interface ContentItem {
  [key: string]: string | boolean;
}

export type SectionContent = Record<string, ContentValue>;
```

### Real example: Hero category content schema

```typescript
contentSchema: [
  { key: 'title', label: 'Headline', type: 'text' },
  { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
  { key: 'showPrimaryButton', label: 'Show Primary Button', type: 'boolean' },
  { key: 'ctaText', label: 'Primary Button Text', type: 'text' },
  { key: 'showSecondaryButton', label: 'Show Secondary Button', type: 'boolean' },
  { key: 'ctaSecondaryText', label: 'Secondary Button Text', type: 'text' },
  { key: 'showTertiaryButton', label: 'Show Tertiary Button', type: 'boolean' },
  { key: 'ctaTertiaryText', label: 'Tertiary Button Text', type: 'text' },
],
```

### Real example: Process category with items array

```typescript
contentSchema: [
  { key: 'title', label: 'Section Title', type: 'text' },
  { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
  { key: 'steps', label: 'Steps', type: 'items', itemFields: [
    { key: 'title', label: 'Step Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ]},
],
```

### Real example: Pricing category with complex items

```typescript
contentSchema: [
  { key: 'title', label: 'Section Title', type: 'text' },
  { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
  { key: 'plans', label: 'Plans', type: 'items', itemFields: [
    { key: 'name', label: 'Plan Name', type: 'text' },
    { key: 'price', label: 'Price', type: 'text' },
    { key: 'period', label: 'Period', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'features', label: 'Features (comma-separated)', type: 'textarea' },
    { key: 'ctaText', label: 'Button Text', type: 'text' },
    { key: 'highlighted', label: 'Highlighted', type: 'boolean' },
  ]},
],
```

### Design guidelines for content schemas
- Keep field count minimal. Each field appears in the sidebar editor.
- Use `text` for single-line values, `textarea` for multi-line.
- Use `boolean` for show/hide toggles on optional UI elements.
- Use `items` for any repeating content (cards, list items, team members, etc.).
- Name the `key` values consistently: `title`, `subtitle`, `ctaText` are standard.
- The `label` is what users see in the sidebar panel.

---

## 4. Step 2 -- Create Component Directory + TSX Files

### Directory structure

Each category gets its own directory under `src/components/sections/`:

```
src/components/sections/{category}/
  {VariantName}.tsx
  {VariantName2}.tsx
```

For example, creating a "Services" category with two variants:
```
src/components/sections/services/
  ServicesGrid.tsx
  ServicesCards.tsx
```

### File naming convention

The component file name is PascalCase and maps to the variant ID through the generation script:
- `ServicesGrid.tsx` maps to variant ID `services-grid`
- `ServicesCards.tsx` maps to variant ID `services-cards`
- `FeaturesWithImage.tsx` maps to `features-with-image`
- `Pricing3Col.tsx` maps to `pricing-3col`

### Full component template

Use this exact template for every variant component. This is the canonical pattern used by all 87 existing components:

```tsx
'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function VariantName({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'CATEGORY_NAME');

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        </div>

        {/* Content area */}
        <div className="mt-16 grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-8">
          {(content.items as Array<{ title: string; description: string }> || []).map((item, i) => (
            <div key={i} className={`${c.bgCard} ${c.border} border rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold ${c.text}`}>{item.title}</h3>
              <p className={`mt-2 text-sm ${c.textSecondary} leading-relaxed`}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Real example: ProcessSteps component (from `src/components/sections/process/ProcessSteps.tsx`)

```tsx
'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function ProcessSteps({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const id = sectionId || '';
  const spacing = getSpacingClasses(content._spacing as string, 'process');
  const steps = (content.steps as Array<{ title: string; description: string }>) || [];

  return (
    <section className={`${c.bg} ${spacing}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-3xl font-bold ${c.text}`}>
            <EditableText sectionId={id} fieldKey="title" value={content.title as string} placeholder="Add title..." />
          </h2>
          <p className={`mt-4 text-lg ${c.textSecondary}`}>
            <EditableText sectionId={id} fieldKey="subtitle" value={content.subtitle as string} placeholder="Add subtitle..." />
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full ${c.btnPrimary} flex items-center justify-center text-lg font-bold`}>
                {i + 1}
              </div>
              <h3 className={`mt-4 text-lg font-semibold ${c.text}`}>{step.title}</h3>
              <p className={`mt-2 text-sm ${c.textSecondary} leading-relaxed`}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Real example: HeroCentered component (from `src/components/sections/hero/HeroCentered.tsx`)

```tsx
'use client';
import { ColorMode } from '@/lib/types';
import { getColors } from '@/lib/colors';
import { getSpacingClasses } from '@/lib/spacing';
import EditableText from '@/components/builder/EditableText';

export default function HeroCentered({ content, colorMode, sectionId }: { content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }) {
  const c = getColors(colorMode || 'light');
  const spacing = getSpacingClasses(content._spacing as string, 'hero');
  const id = sectionId || '';

  return (
    <section className={`${c.bgAlt} ${spacing}`}>
      <div className="max-w-3xl mx-auto text-center">
        <EditableText
          sectionId={id}
          fieldKey="title"
          value={content.title as string}
          placeholder="Add headline..."
          tag="h1"
          className={`text-3xl @md:text-5xl font-bold ${c.text} leading-tight`}
        />
        <EditableText
          sectionId={id}
          fieldKey="subtitle"
          value={content.subtitle as string}
          placeholder="Add subtitle..."
          tag="p"
          className={`mt-4 @md:mt-6 text-lg @md:text-xl ${c.textSecondary} leading-relaxed`}
        />
        {(content.showPrimaryButton || content.showSecondaryButton || content.showTertiaryButton) && (
          <div className="mt-10 flex flex-col @sm:flex-row items-center justify-center gap-3 @sm:gap-4">
            {content.showPrimaryButton !== false && content.ctaText && (
              <button className={`${c.btnPrimary} rounded-lg px-6 py-3 text-sm font-medium`}>
                <EditableText
                  sectionId={id}
                  fieldKey="ctaText"
                  value={content.ctaText as string}
                  placeholder="Button"
                />
              </button>
            )}
            {content.showSecondaryButton && content.ctaSecondaryText && (
              <button className={`${c.btnSecondary} rounded-lg px-6 py-3 text-sm font-medium`}>
                <EditableText
                  sectionId={id}
                  fieldKey="ctaSecondaryText"
                  value={content.ctaSecondaryText as string}
                  placeholder="Button"
                />
              </button>
            )}
            {content.showTertiaryButton && content.ctaTertiaryText && (
              <span className={`text-sm font-medium ${c.textSecondary} underline underline-offset-4 cursor-pointer`}>
                <EditableText
                  sectionId={id}
                  fieldKey="ctaTertiaryText"
                  value={content.ctaTertiaryText as string}
                  placeholder="Link text"
                />
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
```

### Critical rules for component code

1. **Always use `'use client';`** as the first line.
2. **Always import these four things:** `ColorMode`, `getColors`, `getSpacingClasses`, `EditableText`.
3. **Props signature is always:** `{ content: Record<string, any>; colorMode?: ColorMode; sectionId?: string }`.
4. **First three lines of the function body are always:**
   ```tsx
   const c = getColors(colorMode || 'light');
   const id = sectionId || '';
   const spacing = getSpacingClasses(content._spacing as string, 'CATEGORY_NAME');
   ```
5. **Never hardcode colors.** Use `c.bg`, `c.text`, `c.bgCard`, etc. from the token system.
6. **All text must use `<EditableText>`** for inline editing in the builder.
7. **Use container queries** (`@md:`, `@lg:`, `@sm:`) instead of viewport queries (`md:`, `lg:`, `sm:`).
8. **Always guard array access:** `(content.items || []).map(...)`.
9. **Image placeholders:** Use `<div className={\`${c.bgPlaceholder} rounded-lg aspect-video\`} />`.

---

## 5. Step 3 -- Register in Section Registry

Edit `src/lib/registry.ts` to add the new category.

### Add a SectionCategory type entry

Open `src/lib/types.ts` and add your new category to the `SectionCategory` union type:

```typescript
export type SectionCategory =
  | 'hero'
  | 'header'
  // ... existing categories ...
  | 'store'
  | 'YOUR_NEW_CATEGORY';  // <-- Add here
```

### Add default content constants (optional but recommended)

At the top of `src/lib/registry.ts`, add default content for your new category. This follows the same pattern as existing defaults:

```typescript
const defaultYourItems = [
  { title: 'Item One', description: 'A brief description of this item.' },
  { title: 'Item Two', description: 'A brief description of this item.' },
  { title: 'Item Three', description: 'A brief description of this item.' },
];
```

### Add the full category object

Add a new entry to the `sectionRegistry` array in `src/lib/registry.ts`. Place it in alphabetical order among the categories (or logically grouped with similar categories).

Here is the full structure to add, using "services" as an example:

```typescript
// ── Services ──
{
  category: 'services',
  categoryLabel: 'Services',
  icon: 'Briefcase',
  contentSchema: [
    { key: 'title', label: 'Section Title', type: 'text' },
    { key: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
    { key: 'services', label: 'Services', type: 'items', itemFields: [
      { key: 'title', label: 'Service Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'price', label: 'Price', type: 'text' },
    ]},
  ],
  variants: [
    { variantId: 'services-grid', variantName: 'Grid', defaultContent: { title: 'Our Services', subtitle: 'What we offer.', services: [...defaultServices] } },
    { variantId: 'services-cards', variantName: 'Cards', defaultContent: { title: 'Our Services', subtitle: 'What we offer.', services: [...defaultServices] } },
  ],
},
```

### Available icon names

Icons come from the `lucide-react` package. Common choices:

| Icon | Good for |
|---|---|
| `Sparkles` | Hero, AI features |
| `LayoutGrid` | Features, grid layouts |
| `CreditCard` | Pricing |
| `Quote` | Testimonials |
| `HelpCircle` | FAQ |
| `MousePointerClick` | CTA |
| `FileText` | Blog, content |
| `Users` / `Users2` | About, Team |
| `Mail` | Contact |
| `Image` | Gallery |
| `Flag` | Banner |
| `Trophy` | Showcase, portfolio |
| `ListOrdered` | Process, steps |
| `Download` | Downloads |
| `ArrowLeftRight` | Comparison |
| `ShoppingBag` | Store, products |
| `PanelTop` | Header |
| `PanelBottom` | Footer |
| `BarChart3` | Stats |
| `Building2` | Logos |
| `AlertTriangle` | Error |
| `Briefcase` | Services |
| `Calendar` | Events |
| `Star` | Reviews |
| `Map` | Location |
| `Video` | Media |

---

## 6. Step 4 -- Add to AI Structure Prompt

Edit `src/lib/ai/system-prompt.ts` to teach the AI about the new section category. You must edit the `STRUCTURE_PROMPT` constant in **two places**.

### Place 1: Add variants under "Available Section Categories and Variants"

Find the section that lists all categories and their variants. Add your new category in the appropriate position:

```typescript
### Services
- services-grid: 3-column service cards with prices
- services-cards: Card layout with icons and descriptions
```

### Place 2: Add content fields under "Content Fields Per Category"

Find the list of content fields per category and add yours:

```typescript
- **Services**: title, subtitle, services (array of {title, description, price})
```

### Example of the existing pattern in the prompt

```
### Process / How It Works
- process-steps: Numbered step cards
- process-timeline: Vertical timeline
```

```
- **Process**: title, subtitle, steps (array of {title, description})
```

Follow this exact pattern. The variant descriptions should be short (under 10 words) and describe the visual layout.

---

## 7. Step 5 -- Add HTML Export Renderer

Edit `src/lib/export-html.ts` to add a renderer for each variant. The HTML export system produces static HTML that users can download.

### Pattern

Each renderer is a function that takes the content object and returns an HTML string. The renderers are stored in the `htmlRenderers` record, keyed by variant ID.

### Helper functions available

```typescript
escapeHtml(str)       // Escapes HTML special characters
str(val)              // Converts unknown to string safely (returns '' for non-strings)
renderItems(items)    // Returns array or empty array if undefined
```

### Real example: hero-centered renderer

```typescript
'hero-centered': (c) => `<section class="bg-gray-50 py-24 px-8">
  <div class="max-w-4xl mx-auto text-center">
    <h1 class="text-5xl font-bold text-gray-900 mb-6">${escapeHtml(str(c.title))}</h1>
    <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">${escapeHtml(str(c.subtitle))}</p>
    <div class="flex gap-4 justify-center">
      <button class="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium">${escapeHtml(str(c.ctaText))}</button>
      ${str(c.ctaSecondaryText) ? `<button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">${escapeHtml(str(c.ctaSecondaryText))}</button>` : ''}
    </div>
  </div>
</section>`,
```

### Real example: features-grid renderer (with items array)

```typescript
'features-grid': (c) => {
  const features = renderItems(c.features as ContentItem[]);
  return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      ${features.map(f => `<div class="bg-gray-50 rounded-xl p-6">
        <div class="w-10 h-10 bg-gray-200 rounded-lg mb-4"></div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">${escapeHtml(str(f.title))}</h3>
        <p class="text-gray-600">${escapeHtml(str(f.description))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
},
```

### Template for new renderers

```typescript
'yourcat-variant': (c) => {
  const items = renderItems(c.items as ContentItem[]);
  return `<section class="py-20 px-8 bg-white">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      ${items.map(item => `<div class="bg-gray-50 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">${escapeHtml(str(item.title))}</h3>
        <p class="text-gray-600">${escapeHtml(str(item.description))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
},
```

### Important notes for HTML renderers
- Use standard Tailwind classes (NOT container queries -- HTML export uses viewport queries: `md:`, `lg:`, not `@md:`, `@lg:`).
- Always use `escapeHtml(str(...))` for user content to prevent XSS.
- Use `renderItems()` to safely handle arrays.
- Keep the HTML clean and well-indented.
- Use light-mode colors only (bg-white, text-gray-900, etc.) -- the export is static.

---

## 8. Step 6 -- Add Variant Thumbnail (Optional)

Each variant can have a small SVG thumbnail that appears in the variant picker. These are defined in `src/components/builder/VariantThumbnail.tsx`.

### SVG canvas

All thumbnails render inside a `120x58` viewBox SVG. Use simple geometric shapes to represent the layout.

### Color constants

```typescript
const C = {
  bg: '#f5f5f5',
  img: '#d4d4d4',
  text: '#a3a3a3',
  title: '#737373',
  dark: '#404040',
  accent: '#525252',
};
```

### Real example: hero-centered thumbnail

```tsx
'hero-centered': () => (
  <>
    <rect x="30" y="10" width="60" height="6" rx="1" fill={C.title} />
    <rect x="35" y="20" width="50" height="3" rx="1" fill={C.text} />
    <rect x="38" y="26" width="44" height="3" rx="1" fill={C.text} />
    <rect x="40" y="38" width="18" height="7" rx="2" fill={C.dark} />
    <rect x="60" y="38" width="18" height="7" rx="2" fill={C.bg} stroke={C.text} strokeWidth="0.5" />
  </>
),
```

### Real example: hero-split thumbnail

```tsx
'hero-split': () => (
  <>
    <rect x="6" y="12" width="40" height="6" rx="1" fill={C.title} />
    <rect x="6" y="22" width="35" height="3" rx="1" fill={C.text} />
    <rect x="6" y="28" width="30" height="3" rx="1" fill={C.text} />
    <rect x="6" y="40" width="16" height="6" rx="2" fill={C.dark} />
    <rect x="24" y="40" width="16" height="6" rx="2" fill={C.bg} stroke={C.text} strokeWidth="0.5" />
    <rect x="62" y="8" width="52" height="48" rx="6" fill={C.img} />
  </>
),
```

### Guidelines
- Use `rect` for text blocks, images, buttons, and cards.
- `C.title` for headings, `C.text` for body text, `C.dark` for buttons, `C.img` for image placeholders.
- Keep it abstract -- the thumbnail represents layout structure, not actual content.
- This step can be deferred. The UI will render a generic fallback if no thumbnail is defined.

---

## 9. Step 7 -- Regenerate Component Index

Run this command to auto-generate `src/components/sections/index.ts` from the filesystem:

```bash
npm run generate:sections
```

This script (`scripts/generate-section-index.mjs`):
1. Scans every directory under `src/components/sections/`
2. Finds all `.tsx` files (excluding those starting with `_`)
3. Converts PascalCase file names to kebab-case variant IDs
4. Generates the import statements and `componentRegistry` map

**You must run this after creating the new `.tsx` files.** The file `src/components/sections/index.ts` should NEVER be edited manually.

### How the name mapping works

The script converts PascalCase component names to kebab-case variant IDs using the category directory name as prefix:

| File path | Generated variant ID |
|---|---|
| `process/ProcessSteps.tsx` | `process-steps` |
| `process/ProcessTimeline.tsx` | `process-timeline` |
| `hero/HeroCentered.tsx` | `hero-centered` |
| `hero/HeroWithForm.tsx` | `hero-with-form` |
| `pricing/Pricing3Col.tsx` | `pricing-3col` |
| `features/Features2Column.tsx` | `features-2column` |

The generated variant ID MUST match the `variantId` in the registry. If there is a mismatch, the component will not render.

---

## 10. Step 8 -- Validate

Run the validation script to check all files are in sync:

```bash
npm run validate:registry
```

This script (`scripts/validate-registry.mjs`) checks:

1. **Component index completeness:** Every variant in the registry has a matching entry in `src/components/sections/index.ts`.
2. **No orphan components:** No components in the index that are not in the registry.
3. **TSX files exist on disk:** Every variant has a corresponding `.tsx` file in the correct directory.
4. **HTML export coverage:** Every variant has a renderer in `src/lib/export-html.ts` (warnings, not errors).
5. **System prompt coverage:** Every category has at least one variant mentioned in the AI system prompt (warnings, not errors).

Exit code 0 means all checks passed. Exit code 1 means there are errors that must be fixed.

After validation, also run the full build to catch any TypeScript errors:

```bash
npm run build
```

---

## 11. Token Reference Table

All section components use semantic color tokens from `getColors(colorMode)`. NEVER hardcode color classes.

### Background tokens

| Token | Use for | Light mode class | Dark mode class |
|---|---|---|---|
| `c.bg` | Section background | `bg-white` | `bg-gray-900` |
| `c.bgAlt` | Alternate/hero backgrounds | `bg-gray-50` | `bg-gray-800` |
| `c.bgMuted` | Muted backgrounds | `bg-gray-100` | `bg-gray-800` |
| `c.bgCard` | Card surfaces | `bg-gray-50` | `bg-gray-800` |
| `c.bgCardAlt` | Alternate card surfaces | `bg-white` | `bg-gray-700` |
| `c.bgPlaceholder` | Image placeholders | `bg-gray-200` | `bg-gray-700` |
| `c.bgAvatar` | Avatar backgrounds | `bg-gray-200` | `bg-gray-600` |

### Text tokens

| Token | Use for | Light mode class | Dark mode class |
|---|---|---|---|
| `c.text` | Primary headings, strong text | `text-gray-900` | `text-white` |
| `c.textSecondary` | Subtitles, descriptions | `text-gray-600` | `text-gray-300` |
| `c.textMuted` | Metadata, dates, captions | `text-gray-500` | `text-gray-400` |
| `c.textLight` | Faint text, tertiary | `text-gray-400` | `text-gray-500` |

### Button tokens (compound classes)

| Token | Use for | Includes |
|---|---|---|
| `c.btnPrimary` | Primary CTA buttons | Background + text color |
| `c.btnSecondary` | Secondary/outline buttons | Border + text color |
| `c.btnSmall` | Small accent buttons | Background + text color |

### Border tokens

| Token | Use for | Light mode class | Dark mode class |
|---|---|---|---|
| `c.border` | Card borders, dividers | `border-gray-200` | `border-gray-700` |
| `c.borderLight` | Lighter borders | `border-gray-100` | `border-gray-800` |
| `c.divider` | Horizontal rules (divide-*) | `divide-gray-200` | `divide-gray-700` |

### Form input token (compound class)

| Token | Use for | Includes |
|---|---|---|
| `c.input` | Form fields | Background + border + text + placeholder color |

### Highlighted card tokens (for pricing "featured" tier, etc.)

| Token | Use for | Light mode class | Dark mode class |
|---|---|---|---|
| `c.hlBg` | Highlighted card background | `bg-gray-900` | `bg-white` |
| `c.hlText` | Highlighted card heading | `text-white` | `text-gray-900` |
| `c.hlTextSecondary` | Highlighted card description | `text-gray-300` | `text-gray-600` |
| `c.hlBtn` | Highlighted card CTA button | Inverted bg + text |

### Usage examples

```tsx
// Section background
<section className={`${c.bg} ${spacing}`}>

// Card with border
<div className={`${c.bgCard} ${c.border} border rounded-xl p-6`}>

// Primary heading
<h2 className={`text-3xl font-bold ${c.text}`}>

// Subtitle text
<p className={`mt-4 text-lg ${c.textSecondary}`}>

// Muted metadata
<span className={`text-sm ${c.textMuted}`}>

// Primary button
<button className={`${c.btnPrimary} rounded-lg px-6 py-3 text-sm font-medium`}>

// Secondary button
<button className={`${c.btnSecondary} rounded-lg px-6 py-3 text-sm font-medium`}>

// Image placeholder
<div className={`${c.bgPlaceholder} rounded-lg aspect-video`} />

// Form input
<input className={`${c.input} rounded-lg px-4 py-3 text-sm`} />

// Highlighted pricing card
<div className={`${c.hlBg} rounded-xl p-8`}>
  <h3 className={`text-xl font-bold ${c.hlText}`}>
  <p className={`${c.hlTextSecondary}`}>
  <button className={`${c.hlBtn} rounded-lg px-6 py-3`}>
</div>

// Avatar placeholder
<div className={`${c.bgAvatar} rounded-full w-12 h-12`} />
```

---

## 12. Responsiveness Rules

This project uses **container queries** (not viewport queries) for responsiveness. This is critical because sections are rendered inside a preview panel that may be narrower than the viewport.

### Container query prefixes

| Prefix | Equivalent breakpoint |
|---|---|
| `@sm:` | ~640px container width |
| `@md:` | ~768px container width |
| `@lg:` | ~1024px container width |
| `@xl:` | ~1280px container width |

### Grid patterns

```tsx
// 3-column grid that collapses to 1 column on narrow containers
<div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-8">

// 2-column grid
<div className="grid grid-cols-1 @md:grid-cols-2 gap-8">

// 4-column grid (for stats, logos)
<div className="grid grid-cols-2 @md:grid-cols-4 gap-6">
```

### Split layout patterns

```tsx
// Side-by-side content + image
<div className="flex flex-col @md:flex-row @md:items-center gap-8">
  <div className="@md:w-1/2">...content...</div>
  <div className="@md:w-1/2">...image...</div>
</div>
```

### Responsive typography

```tsx
// Hero headline
<h1 className={`text-3xl @md:text-5xl font-bold ${c.text} leading-tight`}>

// Section title
<h2 className={`text-2xl @md:text-3xl font-bold ${c.text}`}>

// Responsive gap
<div className="mt-4 @md:mt-6">
```

### Section padding

Always use `getSpacingClasses()` for the outer section padding. It returns responsive padding that adapts to the container width:

```tsx
const spacing = getSpacingClasses(content._spacing as string, 'YOUR_CATEGORY');
```

Default output: `py-14 @md:py-20 px-4 @md:px-8`

For headers/banners the function returns tighter padding. For footers it returns medium padding.

### Max-width container

```tsx
<div className="max-w-7xl mx-auto">
```

Use `max-w-7xl` for full-width sections, `max-w-3xl` or `max-w-4xl` for centered content like hero text.

### EditableText usage

ALL user-facing text MUST use the `<EditableText>` component for inline editing:

```tsx
// As a heading
<EditableText
  sectionId={id}
  fieldKey="title"
  value={content.title as string}
  placeholder="Add title..."
  tag="h1"
  className={`text-3xl @md:text-5xl font-bold ${c.text}`}
/>

// As a paragraph
<EditableText
  sectionId={id}
  fieldKey="subtitle"
  value={content.subtitle as string}
  placeholder="Add subtitle..."
  tag="p"
  className={`mt-4 text-lg ${c.textSecondary}`}
/>

// Inside a button
<button className={`${c.btnPrimary} rounded-lg px-6 py-3 text-sm font-medium`}>
  <EditableText
    sectionId={id}
    fieldKey="ctaText"
    value={content.ctaText as string}
    placeholder="Button"
  />
</button>

// For items in an array (note: items in arrays may use direct rendering
// if EditableText array support is not needed for that specific field)
```

### Array content -- always guard against undefined

```tsx
const items = (content.features as Array<{ title: string; description: string }>) || [];
// OR
{(content.features || []).map((feature, i) => (
  <div key={i}>...</div>
))}
```

### Image placeholders

Never use actual images. Use colored divs:

```tsx
<div className={`${c.bgPlaceholder} rounded-lg aspect-video`} />
<div className={`${c.bgPlaceholder} rounded-2xl h-80`} />
<div className={`${c.bgAvatar} rounded-full w-12 h-12`} />
```

---

## 13. Pre-Merge Checklist

Before considering the section complete, verify ALL of the following:

- [ ] **`npm run build` passes** -- No TypeScript errors, no missing imports.
- [ ] **`npm run validate:registry` passes** -- Registry, component index, HTML export, and system prompt are in sync.
- [ ] **Dev server renders correctly** -- Start the dev server and verify each variant renders without errors. Use preview MCP tools if available.
- [ ] **Light AND dark mode** -- Every variant must look correct in both `light` and `dark` colorMode. All colors come from `getColors()` tokens, so this should work automatically if no colors are hardcoded.
- [ ] **HTML export includes renderer** -- Each variant has a corresponding entry in `src/lib/export-html.ts`.
- [ ] **AI generation works** -- The category and its variants are listed in `src/lib/ai/system-prompt.ts` under both the variants list and the content fields list.
- [ ] **SectionCategory type updated** -- The new category string is added to the `SectionCategory` union type in `src/lib/types.ts`.
- [ ] **Component index regenerated** -- `npm run generate:sections` was run after creating the `.tsx` files.
- [ ] **If Figma design provided** -- Compare the preview screenshot with the original Figma screenshot. Check spacing, typography, colors, and layout match the design.

---

## Quick Reference: Complete File Checklist

When creating a new section category called `{category}` with variants `{category}-{variant1}` and `{category}-{variant2}`:

| # | File | Action |
|---|---|---|
| 1 | `src/lib/types.ts` | Add `'{category}'` to `SectionCategory` union |
| 2 | `src/lib/registry.ts` | Add full category object with contentSchema + variants |
| 3 | `src/components/sections/{category}/{Variant1}.tsx` | Create variant component |
| 4 | `src/components/sections/{category}/{Variant2}.tsx` | Create variant component |
| 5 | `src/lib/ai/system-prompt.ts` | Add variants list + content fields to `STRUCTURE_PROMPT` |
| 6 | `src/lib/export-html.ts` | Add HTML renderer for each variant |
| 7 | `src/components/builder/VariantThumbnail.tsx` | (Optional) Add SVG thumbnails |
| 8 | Run `npm run generate:sections` | Regenerate component index |
| 9 | Run `npm run validate:registry` | Validate everything is in sync |
| 10 | Run `npm run build` | Verify no TypeScript errors |
