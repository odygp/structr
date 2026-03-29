import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSectionsForPage } from '@/lib/import/ai-analyzer';
import { trackUsage } from '@/lib/ai/track-usage';
import { hasEnoughCredits } from '@/lib/db/credits';

export const maxDuration = 60;

// POST — generate sections for a single page from its name
export async function POST(request: Request) {
  try {
    const { projectId, name, description, seoTitle, seoDescription, sortOrder } = await request.json();
    if (!projectId || !name) {
      return NextResponse.json({ error: 'projectId and name required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Credit check
    if (user) {
      const creditCheck = await hasEnoughCredits(user.id);
      if (!creditCheck.ok) {
        return NextResponse.json({ error: 'Insufficient credits', balance: creditCheck.balance }, { status: 402 });
      }
    }

    // Generate sections using AI
    const startTime = Date.now();
    const result = await generateSectionsForPage(
      name,
      description,
      { title: seoTitle, description: seoDescription }
    );

    const durationMs = Date.now() - startTime;

    // Track AI usage
    if (result.usage && user) {
      await trackUsage({
        userId: user.id,
        projectId,
        endpoint: 'import/octopus/page',
        model: result.usage.model,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        durationMs,
      });
    }

    if (result.sections.length === 0) {
      return NextResponse.json({ error: 'No sections generated', skipped: true });
    }

    // Check if page already exists (e.g., Home placeholder)
    let pageId: string;
    const { data: existingPages } = await supabase
      .from('structr_pages')
      .select('id')
      .eq('project_id', projectId)
      .eq('sort_order', sortOrder ?? 0);

    if (existingPages && existingPages.length > 0) {
      pageId = existingPages[0].id;
      await supabase.from('structr_sections').delete().eq('page_id', pageId);
      await supabase.from('structr_pages').update({ name }).eq('id', pageId);
    } else {
      const { data: dbPage, error: pgErr } = await supabase
        .from('structr_pages')
        .insert({ project_id: projectId, name, sort_order: sortOrder ?? 0 })
        .select()
        .single();
      if (pgErr) throw pgErr;
      pageId = dbPage.id;
    }

    // Insert sections
    const sectionRows = result.sections.map((s, i) => ({
      page_id: pageId,
      category: s.category,
      variant_id: s.variantId,
      content: s.content,
      color_mode: s.colorMode || 'light',
      sort_order: i,
    }));

    const { error: secErr } = await supabase
      .from('structr_sections')
      .insert(sectionRows);

    if (secErr) throw secErr;

    return NextResponse.json({
      done: true,
      pageId,
      sectionCount: sectionRows.length,
    });
  } catch (e) {
    console.error('Octopus page generation error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
