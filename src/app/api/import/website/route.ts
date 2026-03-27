import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { discoverPages, fetchCleanContent } from '@/lib/import/html-analyzer';
import { analyzePageWithAI } from '@/lib/import/ai-analyzer';

export const maxDuration = 60;

// POST /api/import/website — Discover pages + import homepage only
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await request.json();
    if (!url?.trim()) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const baseUrl = parsedUrl.origin + parsedUrl.pathname;
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    const projectName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1) + ' Import';

    // Step 1: Discover all pages (fast)
    const discoveredPages = await discoverPages(baseUrl);
    if (discoveredPages.length === 0) {
      return NextResponse.json({ error: 'Could not discover any pages' }, { status: 400 });
    }

    // Step 2: Fetch + analyze ONLY the homepage
    const homepage = discoveredPages[0];
    const content = await fetchCleanContent(homepage.url);
    if (!content || content.length < 50) {
      return NextResponse.json({ error: 'Could not extract content from the homepage' }, { status: 400 });
    }

    const sections = await analyzePageWithAI(content, homepage.name);
    if (sections.length === 0) {
      return NextResponse.json({ error: 'AI could not detect any sections on the homepage' }, { status: 400 });
    }

    // Step 3: Create project + homepage in Supabase
    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: projectName })
      .select()
      .single();
    if (pErr) throw pErr;

    const { data: dbPage, error: pgErr } = await supabase
      .from('structr_pages')
      .insert({ project_id: project.id, name: homepage.name, sort_order: 0 })
      .select()
      .single();
    if (pgErr || !dbPage) throw pgErr;

    const sectionRows = sections.map((s, idx) => ({
      page_id: dbPage.id,
      category: s.category,
      variant_id: s.variantId,
      content: s.content,
      color_mode: s.colorMode || 'light',
      sort_order: idx,
    }));
    await supabase.from('structr_sections').insert(sectionRows);

    // Return project + remaining pages to process
    const remainingPages = discoveredPages.slice(1, 10); // Up to 9 more pages

    return NextResponse.json({
      projectId: project.id,
      projectName,
      homepageSections: sections.length,
      pendingPages: remainingPages.map((p, i) => ({
        url: p.url,
        name: p.name,
        sortOrder: i + 1,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Import error:', msg);
    return NextResponse.json({ error: `Import failed: ${msg}` }, { status: 500 });
  }
}
