export interface ChangelogEntry {
  date: string;
  title: string;
  description: string;
  tag: 'feature' | 'fix' | 'improvement';
}

// Reverse-chronological. Add new entries at the top.
// To automate: run `claude /changelog` to generate entries from recent git commits.
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-03-29',
    title: 'Marketing site: pricing, changelog, legal pages',
    description: 'Added dedicated pricing page with feature comparison table and FAQ, changelog page with full history, privacy policy, and terms of service. Shared navigation and footer across all public pages.',
    tag: 'feature',
  },
  {
    date: '2026-03-29',
    title: 'UI polish: 11 improvements',
    description: 'Project card thumbnails with mini wireframe previews, hover effects, dark mode toggle, Cmd+K search shortcut, toast notifications, star cost labels in buttons, unpublished changes indicator, enhanced empty states, and auto-cleanup of abandoned projects.',
    tag: 'improvement',
  },
  {
    date: '2026-03-29',
    title: 'Star currency system',
    description: 'Replaced dollar-based credits with an abstract "stars" currency. New users get 50 free stars. Each AI action has a clear star cost (Generate=10, Import=5, Edit=1). Decoupled from API costs for sustainable pricing.',
    tag: 'feature',
  },
  {
    date: '2026-03-29',
    title: 'Landing page',
    description: 'Full marketing landing page with hero, features grid, how-it-works steps, use cases, AI editing demo, pricing preview, and final CTA.',
    tag: 'feature',
  },
  {
    date: '2026-03-29',
    title: 'Fix: imports completing reliably',
    description: 'Fixed a critical bug where website imports, wizard generation, and Octopus imports would get stuck forever. The server-side processing had no auth context, so database queries returned empty. Now the client drives processing with proper authentication.',
    tag: 'fix',
  },
  {
    date: '2026-03-29',
    title: 'Version history & usage tracking',
    description: 'Browse all project versions, save manual snapshots, and restore to any previous version. New Usage tab in Settings shows star balance, daily usage chart, feature breakdown, and transaction history.',
    tag: 'feature',
  },
  {
    date: '2026-03-29',
    title: 'Sharing, activity feed & publishing',
    description: 'Invite team members by email with viewer/editor/admin roles. Activity feed tracks all project changes. Publish projects to clean /p/slug URLs with version snapshots. Comments with threading and resolve/unresolve.',
    tag: 'feature',
  },
  {
    date: '2026-03-28',
    title: 'Dashboard organization',
    description: 'Tab navigation (All Projects, Favorites, Drafts, Archived, Shared with me), project card favorites with star toggle, context menus with archive/restore/delete, search with filtering, and notification API.',
    tag: 'feature',
  },
  {
    date: '2026-03-28',
    title: 'Settings page',
    description: 'Profile management (display name), preferences (default viewport, AI mode, background color), and the foundation for the Usage tab.',
    tag: 'feature',
  },
  {
    date: '2026-03-28',
    title: 'Builder UI overhaul',
    description: 'Document sidebar with background color picker, floating section action buttons (drag, duplicate, AI edit, save as reusable, delete), persistent AI chat sessions with typewriter animation, resizable sidebars with drag handles.',
    tag: 'improvement',
  },
  {
    date: '2026-03-28',
    title: 'Reusable sections catalog',
    description: 'Save any section as reusable from the floating actions. Reusable category appears at the top of the section catalog with count badge. Click to add, hover to delete.',
    tag: 'feature',
  },
  {
    date: '2026-03-28',
    title: 'AI cost optimization',
    description: 'Switched simple tasks to Claude Haiku (75% cheaper), added prompt caching (90% savings on repeated system prompts), reduced max_tokens for smaller responses. ~50-60% total API cost reduction.',
    tag: 'improvement',
  },
  {
    date: '2026-03-28',
    title: 'Server-side import queue',
    description: 'Imports now process via a queue system with background job processing. Supports website import, Octopus.do import, and guided setup wizard. Each page generates independently with proper error handling and retry logic.',
    tag: 'feature',
  },
  {
    date: '2026-03-28',
    title: 'Page selection for imports',
    description: 'Users can now choose which pages to generate before importing, saving AI credits on unwanted pages. Works across all import methods.',
    tag: 'improvement',
  },
  {
    date: '2026-03-28',
    title: 'Website & Octopus.do import',
    description: 'Import any website by URL: discovers pages via sitemap and link extraction, analyzes HTML structure with AI, maps to wireframe sections. Also supports importing sitemaps from Octopus.do with SEO metadata.',
    tag: 'feature',
  },
  {
    date: '2026-03-27',
    title: 'Guided setup wizard',
    description: '4-step wizard for creating wireframes: pick category (SaaS, restaurant, portfolio, etc.), select pages, add business details, set content tone. AI generates tailored multi-page wireframes.',
    tag: 'feature',
  },
  {
    date: '2026-03-27',
    title: 'AI generation from prompt',
    description: 'Core feature: describe your website in natural language and AI generates a complete wireframe with multiple pages, proper sections, and realistic content.',
    tag: 'feature',
  },
  {
    date: '2026-03-27',
    title: 'Section-based wireframe builder',
    description: 'Drag-and-drop wireframe builder with 20+ section types (header, hero, features, pricing, testimonials, FAQ, CTA, footer, and more). Each section has multiple variants and editable content.',
    tag: 'feature',
  },
];
