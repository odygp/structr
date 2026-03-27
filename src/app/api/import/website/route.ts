import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeHtml } from '@/lib/import/html-analyzer';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await request.json();
    if (!url?.trim()) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    // Fetch the page
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Structr/1.0; +https://structr.vercel.app)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${res.status} ${res.statusText}` }, { status: 400 });
    }

    const html = await res.text();
    if (!html || html.length < 100) {
      return NextResponse.json({ error: 'Empty or invalid page' }, { status: 400 });
    }

    // Analyze HTML structure
    const sections = analyzeHtml(html);
    if (sections.length === 0) {
      return NextResponse.json({ error: 'Could not detect any sections on this page' }, { status: 400 });
    }

    // Extract project name from URL
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const projectName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1) + ' Import';

    // Create project
    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: projectName })
      .select()
      .single();

    if (pErr) throw pErr;

    // Create page with detected sections
    const { data: page, error: pgErr } = await supabase
      .from('structr_pages')
      .insert({ project_id: project.id, name: 'Home', sort_order: 0 })
      .select()
      .single();

    if (pgErr || !page) throw pgErr;

    const sectionRows = sections.map((s, i) => ({
      page_id: page.id,
      category: s.category,
      variant_id: s.variantId,
      content: s.content,
      color_mode: 'light',
      sort_order: i,
    }));

    await supabase.from('structr_sections').insert(sectionRows);

    return NextResponse.json({ projectId: project.id, projectName, sectionCount: sections.length });
  } catch (e) {
    console.error('Import error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
