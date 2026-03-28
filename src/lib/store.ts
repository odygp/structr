'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { current } from 'immer';
import { PlacedSection, SectionCategory, ContentValue, ColorMode } from './types';
import { getVariant } from './registry';
import { generateId } from './utils';

// ── Page & Project types ──

export interface Page {
  id: string;
  name: string;
  sections: PlacedSection[];
}

export interface Project {
  id: string;
  name: string;
  pages: Page[];
  activePageId: string;
}

// ── Undo/Redo history ──

interface HistoryEntry {
  pages: Page[];
  activePageId: string;
}

// ── Viewport ──

export type ViewportSize = 'desktop' | 'tablet' | 'mobile';

// ── Store ──

interface BuilderState {
  // Project
  projects: Project[];
  activeProjectId: string;

  // UI State
  selectedSectionId: string | null;
  viewport: ViewportSize;
  clipboard: PlacedSection | null;
  sidebarSearch: string;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;

  // Project actions
  createProject: (name: string) => void;
  switchProject: (projectId: string) => void;
  renameProject: (projectId: string, name: string) => void;
  deleteProject: (projectId: string) => void;

  // Page actions
  addPage: (name: string) => void;
  switchPage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  deletePage: (pageId: string) => void;

  // Section actions
  addSection: (category: SectionCategory, variantId: string) => void;
  addSectionWithContent: (category: SectionCategory, variantId: string, content: Record<string, ContentValue>, colorMode?: ColorMode) => void;
  insertSectionAt: (category: SectionCategory, variantId: string, index: number) => void;
  removeSection: (id: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  selectSection: (id: string | null) => void;
  changeVariant: (sectionId: string, newVariantId: string) => void;
  toggleColorMode: (sectionId: string) => void;
  updateContent: (sectionId: string, key: string, value: ContentValue) => void;
  updateItemField: (sectionId: string, arrayKey: string, itemIndex: number, fieldKey: string, value: string | boolean) => void;
  addItem: (sectionId: string, arrayKey: string) => void;
  removeItem: (sectionId: string, arrayKey: string, itemIndex: number) => void;
  duplicateSection: (id: string) => void;
  updateSectionSpacing: (sectionId: string, spacing: 'compact' | 'default' | 'spacious') => void;
  updateSectionColumns: (sectionId: string, columns: number) => void;

  // Clipboard
  copySection: (id: string) => void;
  pasteSection: () => void;

  // Viewport
  setViewport: (size: ViewportSize) => void;

  // Search
  setSidebarSearch: (query: string) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;

  // Import/Export
  exportProjectJSON: () => string;
  importProjectJSON: (json: string) => void;

  // Remote project loading (Supabase)
  loadRemoteProject: (dbProject: unknown) => void;

  // Template
  applyTemplate: (templateId: string) => void;

  // Helpers
  getActivePage: () => Page | undefined;
  getActiveProject: () => Project | undefined;
}

function createDefaultPage(name = 'Home'): Page {
  return { id: generateId(), name, sections: [] };
}

function createDefaultProject(name = 'My Website'): Project {
  const page = createDefaultPage();
  return { id: generateId(), name, pages: [page], activePageId: page.id };
}

// Helper to get active page from state
function activePage(s: { projects: Project[]; activeProjectId: string }): Page | undefined {
  const proj = s.projects.find(p => p.id === s.activeProjectId);
  return proj?.pages.find(p => p.id === proj.activePageId);
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function pushHistory(s: { projects: Project[]; activeProjectId: string; history: HistoryEntry[]; historyIndex: number }) {
  const proj = s.projects.find(p => p.id === s.activeProjectId);
  if (!proj) return;
  // Truncate future history
  s.history = s.history.slice(0, s.historyIndex + 1);
  s.history.push({
    pages: deepClone(current(proj).pages),
    activePageId: proj.activePageId,
  });
  // Keep max 50 entries
  if (s.history.length > 50) {
    s.history = s.history.slice(s.history.length - 50);
  }
  s.historyIndex = s.history.length - 1;
}

const defaultProject = createDefaultProject();

export const useBuilderStore = create<BuilderState>()(
  persist(
    immer((set, get) => ({
      projects: [defaultProject],
      activeProjectId: defaultProject.id,
      selectedSectionId: null,
      viewport: 'desktop' as ViewportSize,
      clipboard: null,
      sidebarSearch: '',
      history: [],
      historyIndex: -1,

      // ── Project actions ──
      createProject: (name) => set((s) => {
        const proj = createDefaultProject(name);
        s.projects.push(proj);
        s.activeProjectId = proj.id;
        s.selectedSectionId = null;
        s.history = [];
        s.historyIndex = -1;
      }),

      switchProject: (projectId) => set((s) => {
        s.activeProjectId = projectId;
        s.selectedSectionId = null;
        s.history = [];
        s.historyIndex = -1;
      }),

      renameProject: (projectId, name) => set((s) => {
        const proj = s.projects.find(p => p.id === projectId);
        if (proj) proj.name = name;
      }),

      deleteProject: (projectId) => set((s) => {
        if (s.projects.length <= 1) return;
        s.projects = s.projects.filter(p => p.id !== projectId);
        if (s.activeProjectId === projectId) {
          s.activeProjectId = s.projects[0].id;
        }
      }),

      // ── Page actions ──
      addPage: (name) => set((s) => {
        const proj = s.projects.find(p => p.id === s.activeProjectId);
        if (!proj) return;
        pushHistory(s);
        const page = createDefaultPage(name);
        proj.pages.push(page);
        proj.activePageId = page.id;
        s.selectedSectionId = null;
      }),

      switchPage: (pageId) => set((s) => {
        const proj = s.projects.find(p => p.id === s.activeProjectId);
        if (!proj) return;
        proj.activePageId = pageId;
        s.selectedSectionId = null;
      }),

      renamePage: (pageId, name) => set((s) => {
        const proj = s.projects.find(p => p.id === s.activeProjectId);
        const page = proj?.pages.find(pg => pg.id === pageId);
        if (page) page.name = name;
      }),

      deletePage: (pageId) => set((s) => {
        const proj = s.projects.find(p => p.id === s.activeProjectId);
        if (!proj || proj.pages.length <= 1) return;
        pushHistory(s);
        proj.pages = proj.pages.filter(pg => pg.id !== pageId);
        if (proj.activePageId === pageId) {
          proj.activePageId = proj.pages[0].id;
        }
        s.selectedSectionId = null;
      }),

      // ── Section actions ──
      addSection: (category, variantId) => set((s) => {
        const page = activePage(s);
        if (!page) return;
        const variant = getVariant(category, variantId);
        if (!variant) return;
        pushHistory(s);
        const newSection: PlacedSection = {
          id: generateId(),
          category,
          variantId,
          content: deepClone(variant.defaultContent),
          colorMode: 'light',
        };
        page.sections.push(newSection);
        s.selectedSectionId = newSection.id;
      }),

      addSectionWithContent: (category, variantId, content, colorMode = 'light') => set((s) => {
        const page = activePage(s);
        if (!page) return;
        pushHistory(s);
        const newSection: PlacedSection = {
          id: generateId(),
          category,
          variantId,
          content: deepClone(content) as Record<string, ContentValue>,
          colorMode,
        };
        page.sections.push(newSection);
        s.selectedSectionId = newSection.id;
      }),

      insertSectionAt: (category, variantId, index) => set((s) => {
        const page = activePage(s);
        if (!page) return;
        const variant = getVariant(category, variantId);
        if (!variant) return;
        pushHistory(s);
        const newSection: PlacedSection = {
          id: generateId(),
          category,
          variantId,
          content: deepClone(variant.defaultContent),
          colorMode: 'light',
        };
        const idx = Math.max(0, Math.min(index, page.sections.length));
        page.sections.splice(idx, 0, newSection);
        s.selectedSectionId = newSection.id;
      }),

      removeSection: (id) => set((s) => {
        const page = activePage(s);
        if (!page) return;
        pushHistory(s);
        page.sections = page.sections.filter(sec => sec.id !== id);
        if (s.selectedSectionId === id) s.selectedSectionId = null;
      }),

      moveSection: (from, to) => set((s) => {
        const page = activePage(s);
        if (!page) return;
        if (from < 0 || from >= page.sections.length || to < 0 || to >= page.sections.length) return;
        pushHistory(s);
        const [item] = page.sections.splice(from, 1);
        page.sections.splice(to, 0, item);
      }),

      selectSection: (id) => set((s) => { s.selectedSectionId = id; }),

      changeVariant: (sectionId, newVariantId) => set((s) => {
        const page = activePage(s);
        const sec = page?.sections.find(x => x.id === sectionId);
        if (sec) {
          pushHistory(s);
          sec.variantId = newVariantId;
        }
      }),

      toggleColorMode: (sectionId) => set((s) => {
        const page = activePage(s);
        const sec = page?.sections.find(x => x.id === sectionId);
        if (sec) {
          pushHistory(s);
          sec.colorMode = sec.colorMode === 'light' ? 'dark' : 'light';
        }
      }),

      updateContent: (sectionId, key, value) => set((s) => {
        const page = activePage(s);
        const sec = page?.sections.find(x => x.id === sectionId);
        if (sec) sec.content[key] = value;
      }),

      updateItemField: (sectionId, arrayKey, itemIndex, fieldKey, value) => set((s) => {
        const page = activePage(s);
        const sec = page?.sections.find(x => x.id === sectionId);
        if (!sec) return;
        const items = sec.content[arrayKey];
        if (!Array.isArray(items) || !items[itemIndex]) return;
        items[itemIndex][fieldKey] = value;
      }),

      addItem: (sectionId, arrayKey) => set((s) => {
        const page = activePage(s);
        const sec = page?.sections.find(x => x.id === sectionId);
        if (!sec) return;
        pushHistory(s);
        const items = sec.content[arrayKey];
        if (!Array.isArray(items)) return;
        const template = items.length > 0
          ? Object.fromEntries(Object.keys(items[0]).map(k => [k, typeof items[0][k] === 'boolean' ? false : '']))
          : {};
        items.push(template);
      }),

      removeItem: (sectionId, arrayKey, itemIndex) => set((s) => {
        const page = activePage(s);
        const sec = page?.sections.find(x => x.id === sectionId);
        if (!sec) return;
        pushHistory(s);
        const items = sec.content[arrayKey];
        if (!Array.isArray(items)) return;
        items.splice(itemIndex, 1);
      }),

      duplicateSection: (id) => set((s) => {
        const page = activePage(s);
        if (!page) return;
        const idx = page.sections.findIndex(sec => sec.id === id);
        if (idx === -1) return;
        pushHistory(s);
        const original = current(page.sections[idx]);
        const duplicate: PlacedSection = {
          id: generateId(),
          category: original.category,
          variantId: original.variantId,
          content: deepClone(original.content),
          colorMode: original.colorMode,
        };
        page.sections.splice(idx + 1, 0, duplicate);
        s.selectedSectionId = duplicate.id;
      }),

      updateSectionSpacing: (sectionId, spacing) => set((s) => {
        const page = activePage(s);
        const sec = page?.sections.find(x => x.id === sectionId);
        if (sec) {
          pushHistory(s);
          sec.content._spacing = spacing;
        }
      }),

      updateSectionColumns: (sectionId, columns) => set((s) => {
        const page = activePage(s);
        const sec = page?.sections.find(x => x.id === sectionId);
        if (sec) {
          pushHistory(s);
          sec.content._columns = String(columns);
        }
      }),

      // ── Clipboard ──
      copySection: (id) => set((s) => {
        const page = activePage(s);
        const sec = page?.sections.find(x => x.id === id);
        if (sec) s.clipboard = deepClone(current(sec));
      }),

      pasteSection: () => set((s) => {
        const page = activePage(s);
        if (!page || !s.clipboard) return;
        pushHistory(s);
        const pasted: PlacedSection = {
          ...deepClone(s.clipboard),
          id: generateId(),
        };
        page.sections.push(pasted);
        s.selectedSectionId = pasted.id;
      }),

      // ── Viewport ──
      setViewport: (size) => set((s) => { s.viewport = size; }),

      // ── Search ──
      setSidebarSearch: (query) => set((s) => { s.sidebarSearch = query; }),

      // ── Undo/Redo ──
      undo: () => set((s) => {
        if (s.historyIndex <= 0) return;
        const proj = s.projects.find(p => p.id === s.activeProjectId);
        if (!proj) return;
        // Save current state if at the end
        if (s.historyIndex === s.history.length - 1) {
          s.history.push({
            pages: deepClone(current(proj).pages),
            activePageId: proj.activePageId,
          });
        }
        s.historyIndex--;
        const entry = s.history[s.historyIndex];
        proj.pages = deepClone(entry.pages);
        proj.activePageId = entry.activePageId;
        s.selectedSectionId = null;
      }),

      redo: () => set((s) => {
        if (s.historyIndex >= s.history.length - 1) return;
        const proj = s.projects.find(p => p.id === s.activeProjectId);
        if (!proj) return;
        s.historyIndex++;
        const entry = s.history[s.historyIndex];
        proj.pages = deepClone(entry.pages);
        proj.activePageId = entry.activePageId;
        s.selectedSectionId = null;
      }),

      // ── Import/Export ──
      exportProjectJSON: () => {
        const state = get();
        const proj = state.projects.find(p => p.id === state.activeProjectId);
        if (!proj) return '{}';
        return JSON.stringify(proj, null, 2);
      },

      importProjectJSON: (json) => set((s) => {
        try {
          const proj = JSON.parse(json) as Project;
          proj.id = generateId(); // Assign new ID
          s.projects.push(proj);
          s.activeProjectId = proj.id;
          s.selectedSectionId = null;
          s.history = [];
          s.historyIndex = -1;
        } catch {
          // Invalid JSON, ignore
        }
      }),

      // ── Remote Project Loading ──
      loadRemoteProject: (dbProject: unknown) => set((s) => {
        try {
          const dp = dbProject as { id: string; name: string; structr_pages?: { id: string; name: string; sort_order: number; structr_sections?: { id: string; category: string; variant_id: string; content: Record<string, unknown>; color_mode: string; sort_order: number; }[] }[] };
          const pages: Page[] = (dp.structr_pages || [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(p => ({
              id: p.id,
              name: p.name,
              sections: (p.structr_sections || [])
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(sec => ({
                  id: sec.id,
                  category: sec.category as SectionCategory,
                  variantId: sec.variant_id,
                  content: sec.content as Record<string, ContentValue>,
                  colorMode: (sec.color_mode || 'light') as ColorMode,
                })),
            }));

          const project: Project = {
            id: dp.id,
            name: dp.name,
            pages: pages.length > 0 ? pages : [{ id: generateId(), name: 'Home', sections: [] }],
            activePageId: pages[0]?.id || '',
          };
          if (!project.activePageId) project.activePageId = project.pages[0].id;

          // Replace if exists, otherwise add
          const idx = s.projects.findIndex(p => p.id === project.id);
          if (idx >= 0) {
            s.projects[idx] = project;
          } else {
            s.projects.push(project);
          }
          s.activeProjectId = project.id;
          s.selectedSectionId = null;
          s.history = [];
          s.historyIndex = -1;
        } catch (e) {
          console.error('Failed to load remote project:', e);
        }
      }),

      // ── Templates ──
      applyTemplate: (templateId) => set((s) => {
        const page = activePage(s);
        if (!page) return;
        pushHistory(s);
        const templates = getTemplates();
        const template = templates[templateId];
        if (template) {
          page.sections = template.map(sec => ({
            ...sec,
            id: generateId(),
            content: deepClone(sec.content),
          }));
          s.selectedSectionId = null;
        }
      }),

      // ── Helpers ──
      getActivePage: () => {
        const state = get();
        const proj = state.projects.find(p => p.id === state.activeProjectId);
        return proj?.pages.find(pg => pg.id === proj.activePageId);
      },

      getActiveProject: () => {
        const state = get();
        return state.projects.find(p => p.id === state.activeProjectId);
      },
    })),
    {
      name: 'structr-builder-v2',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);

// ── Page Templates ──

function getTemplates(): Record<string, Omit<PlacedSection, 'id'>[]> {
  return {
    'saas-landing': [
      { category: 'header', variantId: 'header-simple', content: { logo: 'Structr', links: [{ label: 'Features' }, { label: 'Pricing' }, { label: 'About' }], ctaText: 'Get Started' }, colorMode: 'light' },
      { category: 'hero', variantId: 'hero-centered', content: { title: 'The modern way to build websites', subtitle: 'Create beautiful, responsive websites in minutes with our drag-and-drop builder.', ctaText: 'Start Free Trial', ctaSecondaryText: 'Watch Demo', showPrimaryButton: true, showSecondaryButton: true }, colorMode: 'light' },
      { category: 'logos', variantId: 'logos-simple', content: { title: 'Trusted by 10,000+ teams worldwide', logos: [{ name: 'Acme' }, { name: 'Globex' }, { name: 'Initech' }, { name: 'Umbrella' }, { name: 'Stark' }] }, colorMode: 'light' },
      { category: 'features', variantId: 'features-grid', content: { title: 'Everything you need to succeed', subtitle: 'Powerful features designed to help you build faster.', features: [{ title: 'Drag & Drop', description: 'Intuitive visual builder with real-time preview.' }, { title: 'Responsive', description: 'Looks perfect on every device, automatically.' }, { title: 'Fast Export', description: 'Export clean HTML or sync directly to Figma.' }] }, colorMode: 'light' },
      { category: 'stats', variantId: 'stats-row', content: { title: 'Built for scale', stats: [{ value: '10K+', label: 'Active Users' }, { value: '99.9%', label: 'Uptime' }, { value: '150+', label: 'Countries' }, { value: '4.9★', label: 'Rating' }] }, colorMode: 'light' },
      { category: 'testimonials', variantId: 'testimonials-cards', content: { title: 'Loved by designers and developers', testimonials: [{ quote: 'This tool cut our design time in half.', author: 'Sarah Chen', role: 'Head of Design, TechCo' }, { quote: 'The best wireframing tool I have ever used.', author: 'Mike Johnson', role: 'Freelance Designer' }, { quote: 'Our whole team uses it daily.', author: 'Emily Davis', role: 'Product Manager, StartupXYZ' }] }, colorMode: 'light' },
      { category: 'pricing', variantId: 'pricing-3col', content: { title: 'Simple, transparent pricing', subtitle: 'No hidden fees. Cancel anytime.', plans: [{ name: 'Starter', price: '$0', period: '/month', description: 'For individuals', features: '5 projects, Basic export, Community support', ctaText: 'Get Started', highlighted: false }, { name: 'Pro', price: '$19', period: '/month', description: 'For teams', features: 'Unlimited projects, Figma export, Priority support, Custom templates', ctaText: 'Start Free Trial', highlighted: true }, { name: 'Enterprise', price: '$49', period: '/month', description: 'For organizations', features: 'Everything in Pro, SSO, Custom branding, Dedicated support', ctaText: 'Contact Sales', highlighted: false }] }, colorMode: 'light' },
      { category: 'faq', variantId: 'faq-accordion', content: { title: 'Frequently asked questions', subtitle: '', questions: [{ question: 'Is there a free plan?', answer: 'Yes! Our Starter plan is completely free with up to 5 projects.' }, { question: 'Can I export to Figma?', answer: 'Yes, Pro and Enterprise plans include direct Figma export with components and variants.' }, { question: 'Do you offer refunds?', answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans.' }] }, colorMode: 'light' },
      { category: 'cta', variantId: 'cta-centered', content: { title: 'Ready to build something amazing?', subtitle: 'Join thousands of teams already using Structr.', ctaText: 'Start Free Trial', ctaSecondaryText: '', showPrimaryButton: true, showSecondaryButton: false }, colorMode: 'light' },
      { category: 'footer', variantId: 'footer-4col', content: { logo: 'Structr', description: 'The modern wireframe builder.', copyright: '2024 Structr. All rights reserved.', columns: [{ title: 'Product', links: 'Features, Pricing, Templates, Changelog' }, { title: 'Company', links: 'About, Blog, Careers, Contact' }, { title: 'Resources', links: 'Docs, Help Center, Community, API' }, { title: 'Legal', links: 'Privacy, Terms, Cookies' }] }, colorMode: 'light' },
    ],
    'portfolio': [
      { category: 'header', variantId: 'header-simple', content: { logo: 'Jane Doe', links: [{ label: 'Work' }, { label: 'About' }, { label: 'Contact' }], ctaText: 'Hire Me' }, colorMode: 'light' },
      { category: 'hero', variantId: 'hero-minimal', content: { title: 'I design digital experiences that people love', subtitle: '', ctaText: 'View My Work', ctaSecondaryText: '', showPrimaryButton: true, showSecondaryButton: false }, colorMode: 'light' },
      { category: 'gallery', variantId: 'gallery-grid', content: { title: 'Selected Work', subtitle: 'A collection of recent projects.', images: [{ caption: 'Brand Identity — Acme Corp' }, { caption: 'Web App — FinTech Dashboard' }, { caption: 'Mobile App — Health Tracker' }, { caption: 'E-commerce — Fashion Store' }, { caption: 'SaaS — Project Manager' }, { caption: 'Website — Agency Rebrand' }] }, colorMode: 'light' },
      { category: 'about', variantId: 'about-split', content: { title: 'About me', description: 'I am a product designer with 8+ years of experience creating digital products for startups and enterprises. I specialize in user research, interaction design, and design systems.', mission: 'I believe great design is invisible — it just works.' }, colorMode: 'light' },
      { category: 'testimonials', variantId: 'testimonials-single', content: { title: 'What clients say', testimonials: [{ quote: 'Jane transformed our product from a confusing tool into something our users actually enjoy. Her attention to detail and user empathy is unmatched.', author: 'Tom Richards', role: 'CEO at Acme Corp' }] }, colorMode: 'light' },
      { category: 'contact', variantId: 'contact-centered', content: { title: 'Let\'s work together', subtitle: 'Have a project in mind? I\'d love to hear about it.', email: 'jane@example.com', phone: '', address: '' }, colorMode: 'light' },
      { category: 'footer', variantId: 'footer-minimal', content: { logo: '', description: '', copyright: '2024 Jane Doe. All rights reserved.', columns: [] }, colorMode: 'light' },
    ],
    'blog': [
      { category: 'header', variantId: 'header-simple', content: { logo: 'The Blog', links: [{ label: 'Articles' }, { label: 'Categories' }, { label: 'About' }], ctaText: 'Subscribe' }, colorMode: 'light' },
      { category: 'hero', variantId: 'hero-centered', content: { title: 'Stories, insights, and ideas', subtitle: 'Exploring design, technology, and the future of digital products.', ctaText: 'Latest Articles', ctaSecondaryText: '', showPrimaryButton: true, showSecondaryButton: false }, colorMode: 'light' },
      { category: 'blog', variantId: 'blog-featured', content: { title: 'Featured', subtitle: '', posts: [{ title: 'The Future of Design Systems', excerpt: 'How design systems are evolving to meet the needs of modern product teams.', author: 'Alex Morgan', date: 'Mar 20, 2024' }, { title: '10 Tips for Better UX Writing', excerpt: 'Small copy changes that make a big difference in user experience.', author: 'Sam Lee', date: 'Mar 15, 2024' }, { title: 'Building Accessible Components', excerpt: 'A practical guide to making your UI components work for everyone.', author: 'Jordan Park', date: 'Mar 10, 2024' }] }, colorMode: 'light' },
      { category: 'blog', variantId: 'blog-grid', content: { title: 'Recent Articles', subtitle: '', posts: [{ title: 'Design Trends 2024', excerpt: 'What is shaping the visual landscape this year.', author: 'Alex Morgan', date: 'Mar 8, 2024' }, { title: 'Figma vs Sketch in 2024', excerpt: 'An honest comparison of the two leading design tools.', author: 'Sam Lee', date: 'Mar 5, 2024' }, { title: 'Remote Design Teams', excerpt: 'How to collaborate effectively across time zones.', author: 'Jordan Park', date: 'Mar 1, 2024' }] }, colorMode: 'light' },
      { category: 'cta', variantId: 'cta-newsletter', content: { title: 'Never miss a post', subtitle: 'Get weekly insights delivered to your inbox.', ctaText: 'Subscribe', ctaSecondaryText: '', showPrimaryButton: true, showSecondaryButton: false }, colorMode: 'light' },
      { category: 'footer', variantId: 'footer-simple', content: { logo: 'The Blog', description: 'Stories worth reading.', copyright: '2024 The Blog. All rights reserved.', columns: [{ title: 'Links', links: 'Articles, About, RSS, Contact' }] }, colorMode: 'light' },
    ],
  };
}

export { getTemplates };
