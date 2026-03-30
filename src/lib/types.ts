// ── Section Categories ──────────────────────────────

export type SectionCategory =
  | 'hero'
  | 'header'
  | 'features'
  | 'pricing'
  | 'faq'
  | 'testimonials'
  | 'cta'
  | 'about'
  | 'contact'
  | 'footer'
  | 'stats'
  | 'team'
  | 'logos'
  | 'blog'
  | 'gallery'
  | 'banner'
  | 'showcase'
  | 'error'
  | 'process'
  | 'downloads'
  | 'comparison'
  | 'store';

// ── Content Field Schema ────────────────────────────

export type FieldType = 'text' | 'textarea' | 'image' | 'items' | 'boolean';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  itemFields?: FieldSchema[];
}

// ── Content Values ──────────────────────────────────

export type ContentValue = string | boolean | ContentItem[];

export interface ContentItem {
  [key: string]: string | boolean;
}

export type SectionContent = Record<string, ContentValue>;

// ── Variant Definition ──────────────────────────────

export interface VariantDefinition {
  variantId: string;
  variantName: string;
  defaultContent: SectionContent;
}

// ── Section Definition ──────────────────────────────

export interface SectionDefinition {
  category: SectionCategory;
  categoryLabel: string;
  icon: string;
  contentSchema: FieldSchema[];
  variants: VariantDefinition[];
}

// ── Placed Section (builder state) ──────────────────

export type ColorMode = 'light' | 'dark';

export interface PlacedSection {
  id: string;
  category: SectionCategory;
  variantId: string;
  content: SectionContent;
  colorMode: ColorMode;
  reusableSourceId?: string; // Links to structr_reusable_sections.id for synced instances
}

// ── Figma Export Types ──────────────────────────────

export interface FigmaFill {
  type: 'SOLID';
  color: { r: number; g: number; b: number };
  opacity?: number;
}

export interface FigmaNodeSpec {
  type: 'frame' | 'text' | 'rectangle' | 'ellipse' | 'component';
  name: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  fills?: FigmaFill[];
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  itemSpacing?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  cornerRadius?: number;
  children?: FigmaNodeSpec[];
  characters?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT';
  layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
  layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
}

export interface FigmaExportPayload {
  title: string;
  componentDefinitions: {
    category: SectionCategory;
    categoryLabel: string;
    variants: {
      variantId: string;
      variantName: string;
      spec: FigmaNodeSpec;
    }[];
  }[];
  sections: {
    category: SectionCategory;
    variantId: string;
    variantName: string;
    content: SectionContent;
    spec: FigmaNodeSpec;
  }[];
}
