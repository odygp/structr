import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from '@/lib/ai/system-prompt';
import { parseAiResponse } from '@/lib/ai/parse-response';
import { buildWizardPrompt, type WizardData } from '@/lib/templates';
import { trackUsage, MODELS } from '@/lib/ai/track-usage';
import { hasEnoughStars } from '@/lib/db/credits';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, pageName, sortOrder, wizardData } = await request.json() as {
      projectId: string;
      pageName: string;
      sortOrder: number;
      wizardData: WizardData;
    };

    // Star check
    const starCheck = await hasEnoughStars(user.id, 5);
    if (!starCheck.ok) {
      return NextResponse.json({ error: 'Insufficient stars', balance: starCheck.balance, required: 5 }, { status: 402 });
    }

    if (!projectId || !pageName) {
      return NextResponse.json({ error: 'projectId and pageName required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    // Build a focused prompt for just this one page
    const basePrompt = buildWizardPrompt({ ...wizardData, pages: [pageName] });
    const focusedPrompt = `${basePrompt}\n\nIMPORTANT: Generate sections for ONLY the "${pageName}" page. Return a single page with appropriate sections.`;

    const startTime = Date.now();
    const model = MODELS.wizard;
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model,
      max_tokens: 3000,
      system: [{ type: 'text', text: await getSystemPrompt(), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: focusedPrompt }],
    });

    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No AI response' }, { status: 500 });
    }

    const aiResult = parseAiResponse(textBlock.text);
    const pageData = aiResult.pages[0];
    if (!pageData || pageData.sections.length === 0) {
      return NextResponse.json({ error: 'No sections generated', done: false });
    }

    // Check if page already exists (for the first page which was created as placeholder)
    const { data: existingPages } = await supabase
      .from('structr_pages')
      .select('id')
      .eq('project_id', projectId)
      .eq('sort_order', sortOrder);

    let pageId: string;

    if (existingPages && existingPages.length > 0) {
      // Update existing page — delete placeholder sections first
      pageId = existingPages[0].id;
      await supabase.from('structr_sections').delete().eq('page_id', pageId);
      // Update page name
      await supabase.from('structr_pages').update({ name: pageName }).eq('id', pageId);
    } else {
      // Create new page
      const { data: newPage, error: pgErr } = await supabase
        .from('structr_pages')
        .insert({ project_id: projectId, name: pageName, sort_order: sortOrder })
        .select()
        .single();

      if (pgErr || !newPage) {
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
      }
      pageId = newPage.id;
    }

    // Insert sections
    const sectionRows = pageData.sections.map((s, j) => ({
      page_id: pageId,
      category: s.category,
      variant_id: s.variantId,
      content: s.content,
      color_mode: s.colorMode || 'light',
      sort_order: j,
    }));

    await supabase.from('structr_sections').insert(sectionRows);

    // Track usage
    await trackUsage({
      userId: user.id,
      projectId,
      endpoint: '/api/ai/generate-from-wizard/page',
      model,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({ done: true, pageName, sectionCount: sectionRows.length });
  } catch (e) {
    console.error('Wizard page generation error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
