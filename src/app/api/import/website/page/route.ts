import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchCleanContent } from '@/lib/import/html-analyzer';
import { analyzePageWithAI } from '@/lib/import/ai-analyzer';
import { trackUsage } from '@/lib/ai/track-usage';
import { hasEnoughCredits } from '@/lib/db/credits';

export const maxDuration = 60;

// POST /api/import/website/page — Import a single page into an existing project
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Credit check
    const creditCheck = await hasEnoughCredits(user.id);
    if (!creditCheck.ok) {
      return NextResponse.json({ error: 'Insufficient credits', balance: creditCheck.balance }, { status: 402 });
    }

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
    const startTime = Date.now();
    const result = await analyzePageWithAI(content, name || 'Page', url);
    const durationMs = Date.now() - startTime;

    // Track AI usage
    if (result.usage) {
      await trackUsage({
        userId: user.id,
        projectId,
        endpoint: 'import/website/page',
        model: result.usage.model,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        durationMs,
      });
    }

    if (result.sections.length === 0) {
      return NextResponse.json({ error: 'No sections detected', skipped: true }, { status: 200 });
    }
    const sections = result.sections;

    // Check if page already exists at this sort_order (e.g., Home placeholder)
    let pageId: string;
    const { data: existingPages } = await supabase
      .from('structr_pages')
      .select('id')
      .eq('project_id', projectId)
      .eq('sort_order', sortOrder ?? 0);

    if (existingPages && existingPages.length > 0) {
      // Update existing page — delete placeholder sections first
      pageId = existingPages[0].id;
      await supabase.from('structr_sections').delete().eq('page_id', pageId);
      await supabase.from('structr_pages').update({ name: name || 'Page' }).eq('id', pageId);
    } else {
      // Create new page
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
      pageId = dbPage.id;
    }
    const dbPage = { id: pageId };

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
