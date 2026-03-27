// Utility: discover all pages from a website
// Uses sitemap.xml + link extraction from nav/footer

export interface DiscoveredPage {
  url: string;
  name: string;
}

export async function discoverPages(baseUrl: string): Promise<DiscoveredPage[]> {
  const origin = new URL(baseUrl).origin;
  const pages: Map<string, string> = new Map(); // url -> name

  // Always include the provided URL
  pages.set(baseUrl, 'Home');

  // 1. Try sitemap.xml
  try {
    const sitemapUrls = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
    for (const sitemapUrl of sitemapUrls) {
      const res = await fetch(sitemapUrl, {
        headers: { 'User-Agent': 'Structr/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const xml = await res.text();
        // Extract <loc> URLs
        const locs = xml.match(/<loc>(.*?)<\/loc>/gi) || [];
        for (const loc of locs) {
          const url = loc.replace(/<\/?loc>/gi, '').trim();
          if (url.startsWith(origin) && !url.match(/\.(jpg|png|gif|svg|css|js|pdf|xml|json|ico|woff|ttf)$/i)) {
            const path = new URL(url).pathname;
            const name = pathToName(path);
            if (!pages.has(url)) pages.set(url, name);
          }
        }
        if (pages.size > 1) break; // Found pages from sitemap
      }
    }
  } catch {}

  // 2. Fetch homepage and extract nav/footer links
  try {
    const res = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Structr/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const html = await res.text();
      // Extract all internal links
      const linkPattern = /href=["'](\/[^"'#?]*|https?:\/\/[^"'#?]*?)["']/gi;
      let match;
      while ((match = linkPattern.exec(html)) !== null) {
        let href = match[1];
        // Make absolute
        if (href.startsWith('/')) href = origin + href;
        try {
          const url = new URL(href);
          if (url.origin !== origin) continue;
          if (url.pathname.match(/\.(jpg|png|gif|svg|css|js|pdf|xml|json|ico|woff|ttf)$/i)) continue;
          const clean = url.origin + url.pathname.replace(/\/$/, '') || url.origin + '/';
          const name = pathToName(url.pathname);
          if (!pages.has(clean) && name) pages.set(clean, name);
        } catch {}
      }
    }
  } catch {}

  // Limit to 20 pages max, prioritize common ones
  const priority = ['home', 'about', 'pricing', 'features', 'contact', 'blog', 'team', 'faq', 'products', 'services', 'portfolio', 'gallery', 'careers', 'press', 'terms', 'privacy'];
  const sorted = Array.from(pages.entries()).sort((a, b) => {
    const aName = a[1].toLowerCase();
    const bName = b[1].toLowerCase();
    const aIdx = priority.findIndex(p => aName.includes(p));
    const bIdx = priority.findIndex(p => bName.includes(p));
    if (a[0] === baseUrl) return -1;
    if (b[0] === baseUrl) return 1;
    if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
    if (aIdx >= 0) return -1;
    if (bIdx >= 0) return 1;
    return 0;
  });

  return sorted.slice(0, 20).map(([url, name]) => ({ url, name }));
}

function pathToName(path: string): string {
  const clean = path.replace(/^\/|\/$/g, '');
  if (!clean) return 'Home';
  // Take last segment
  const segments = clean.split('/');
  const last = segments[segments.length - 1];
  return last
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim() || 'Page';
}

// Fetch clean content using Jina Reader API
export async function fetchCleanContent(url: string): Promise<string> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/markdown',
        'User-Agent': 'Structr/1.0',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (res.ok) {
      const text = await res.text();
      if (text.length > 100) return text;
    }
  } catch {}

  // Fallback: direct fetch + strip tags
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Structr/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const html = await res.text();
      return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  } catch {}

  return '';
}
