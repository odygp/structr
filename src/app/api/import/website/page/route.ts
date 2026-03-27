import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchCleanContent } from '@/lib/import/html-analyzer';
import { analyzePageWithAI } from '@/lib/import/ai-analyzer';

export const maxDuration = 60;

// POST /api/import/website/page — Import a single page into an existing project
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, url, name, sortOrder } = await request.json();
    if (!projectId || !url) {
      return NextResponse.json({ error: 'projectId and url are required' }, { status: 400 });
    }

    // Fetch content
    const content = await fetchCleanContent(url);
    if (!content || content.length < 50) {
      return NextResponse.json({ error: 'Could not extract content', skipped: true }, { status: 200 });
    }

    // AI analysis
    const sections = await analyzePageWithAI(content, name || 'Page');
    if (sections.length === 0) {
      return NextResponse.json({ error: 'No sections detected', skipped: true }, { status: 200 });
    }

    // Create page
    const { data: dbPage, error: pgErr } = await supabase
      .from('structr_pages')
      .insert({
        project_id: projectId,
        name: name || 'Page',
        sort_order: sortOrder ?? 0,
      })
      .select()
      .single();

    if (pgErr || !dbPage) {
      return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }

    // Create sections
    const sectionRows = sections.map((s, idx) => ({
      page_id: dbPage.id,
      category: s.category,
      variant_id: s.variantId,
      content: s.content,
      color_mode: s.colorMode || 'light',
      sort_order: idx,
    }));

    await supabase.from('structr_sections').insert(sectionRows);

    return NextResponse.json({
      pageId: dbPage.id,
      pageName: name,
      sectionCount: sections.length,
      done: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Page import error:', msg);
    return NextResponse.json({ error: msg, skipped: true }, { status: 200 }); // Don't fail the whole import
  }
}
