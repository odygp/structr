import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { parseAiResponse } from '@/lib/ai/parse-response';
import { trackUsage, MODELS } from '@/lib/ai/track-usage';
import { hasEnoughCredits } from '@/lib/db/credits';

export const maxDuration = 60;

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

    const { prompt, selectedPages } = await request.json();
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    const startTime = Date.now();
    const model = MODELS.generate;

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: selectedPages?.length
        ? `${prompt.trim()}\n\nIMPORTANT: Generate ONLY these pages: ${selectedPages.join(', ')}`
        : prompt.trim()
      }],
    });

    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const aiResult = parseAiResponse(textBlock.text);

    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: aiResult.projectName })
      .select()
      .single();

    if (pErr) throw pErr;

    for (let i = 0; i < aiResult.pages.length; i++) {
      const page = aiResult.pages[i];
      const { data: dbPage, error: pgErr } = await supabase
        .from('structr_pages')
        .insert({ project_id: project.id, name: page.name, sort_order: i })
        .select()
        .single();

      if (pgErr || !dbPage) continue;

      if (page.sections.length > 0) {
        const sectionRows = page.sections.map((s, j) => ({
          page_id: dbPage.id,
          category: s.category,
          variant_id: s.variantId,
          content: s.content,
          color_mode: s.colorMode || 'light',
          sort_order: j,
        }));
        await supabase.from('structr_sections').insert(sectionRows);
      }
    }

    // Track usage
    await trackUsage({
      userId: user.id,
      projectId: project.id,
      endpoint: '/api/ai/generate',
      model,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({ projectId: project.id, projectName: aiResult.projectName });
  } catch (e) {
    console.error('AI generation error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
