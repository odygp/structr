import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { discoverPages } from '@/lib/import/html-analyzer';

export const maxDuration = 15; // Only discovering pages — should be fast

// POST /api/import/website — Discover pages + create empty project
// All page content is imported in the background via /api/import/website/page
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, discoverOnly, selectedPages } = await request.json();
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

    // Step 1: Discover all pages (fast — sitemap + link extraction)
    const discoveredPages = await discoverPages(baseUrl);
    if (discoveredPages.length === 0) {
      return NextResponse.json({ error: 'Could not discover any pages on this website' }, { status: 400 });
    }

    const pageList = discoveredPages.slice(0, 20).map((p, i) => ({
      url: p.url,
      name: p.name,
      sortOrder: i,
    }));

    // Discovery only — return pages for user to select
    if (discoverOnly) {
      return NextResponse.json({ pages: pageList, projectName });
    }

    // Step 2: Create project and queue selected pages
    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: projectName })
      .select()
      .single();
    if (pErr) throw pErr;

    // Use selectedPages if provided, otherwise all discovered
    const pagesToImport = selectedPages
      ? pageList.filter((p: { name: string }) => selectedPages.includes(p.name))
      : pageList;

    const queueRows = pagesToImport.map((p: { name: string; url: string; sortOrder: number }, i: number) => ({
      project_id: project.id,
      user_id: user.id,
      job_type: 'website',
      page_name: p.name,
      sort_order: i,
      status: 'pending',
      payload: { url: p.url },
    }));

    await supabase.from('structr_import_queue').insert(queueRows);

    // Trigger processing immediately (fire-and-forget)
    const apiBase = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://structr.holy.black';
    fetch(`${apiBase}/api/import/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    }).catch(() => {});

    return NextResponse.json({
      projectId: project.id,
      projectName,
      pageCount: queueRows.length,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Import error:', msg);
    return NextResponse.json({ error: `Import failed: ${msg}` }, { status: 500 });
  }
}
