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

    // Step 1: Discover all pages (fast — sitemap + link extraction)
    const discoveredPages = await discoverPages(baseUrl);
    if (discoveredPages.length === 0) {
      return NextResponse.json({ error: 'Could not discover any pages on this website' }, { status: 400 });
    }

    // Step 2: Create empty project in Supabase
    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: projectName })
      .select()
      .single();
    if (pErr) throw pErr;

    // Return project + ALL discovered pages for background processing
    const allPages = discoveredPages.slice(0, 10).map((p, i) => ({
      url: p.url,
      name: p.name,
      sortOrder: i,
    }));

    return NextResponse.json({
      projectId: project.id,
      projectName,
      pages: allPages,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Import error:', msg);
    return NextResponse.json({ error: `Import failed: ${msg}` }, { status: 500 });
  }
}
