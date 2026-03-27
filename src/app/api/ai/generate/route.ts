import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { parseAiResponse } from '@/lib/ai/parse-response';

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt } = await request.json();
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    // Call Claude
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt.trim() }],
    });

    // Extract text response
    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse the AI response
    const aiResult = parseAiResponse(textBlock.text);

    // Create project in Supabase
    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: aiResult.projectName })
      .select()
      .single();

    if (pErr) throw pErr;

    // Create pages and sections
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

    return NextResponse.json({ projectId: project.id, projectName: aiResult.projectName });
  } catch (e) {
    console.error('AI generation error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
