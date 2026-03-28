import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { parseAiResponse } from '@/lib/ai/parse-response';
import { buildWizardPrompt, type WizardData } from '@/lib/templates';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wizardData: WizardData = await request.json();
    if (!wizardData.description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    // Build the rich prompt from wizard data
    const prompt = buildWizardPrompt(wizardData);

    // Save custom category request if "other" was selected
    if (wizardData.category === 'other' && wizardData.customCategory) {
      supabase.from('structr_component_requests').insert({
        suggested_category: wizardData.customCategory,
        suggested_variant_name: 'Custom Category Request',
        description: `User requested category "${wizardData.customCategory}" for: ${wizardData.description}`,
        source_url: null,
        source_page_name: null,
        extracted_content: { wizardData },
        preview_html: null,
        status: 'pending',
      }).then(undefined, console.error);
    }

    // Call Claude
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse AI response
    const aiResult = parseAiResponse(textBlock.text);

    // Use business name or description for project name
    const projectName = wizardData.businessName || wizardData.description.slice(0, 40);

    // Create project
    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: projectName })
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

    return NextResponse.json({ projectId: project.id, projectName });
  } catch (e) {
    console.error('Wizard generation error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
