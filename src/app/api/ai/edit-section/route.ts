import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { trackUsage, MODELS } from '@/lib/ai/track-usage';

export const maxDuration = 30;

// POST /api/ai/edit-section — Edit a section's content using AI
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sectionId, projectId, category, variantId, content, instruction, mode } = await request.json();
    if (!instruction?.trim()) return NextResponse.json({ error: 'Instruction required' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    const startTime = Date.now();
    const model = MODELS.generate;

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: [{ type: 'text', text: `You are an AI assistant that edits wireframe section content. You receive the current content of a section (as JSON) and a user instruction about what to change.

Return ONLY valid JSON with the updated content fields. Keep the same JSON structure — only modify the fields that the user's instruction refers to. Do not add new fields unless specifically asked.

Section type: ${category} (variant: ${variantId})

${mode === 'plan' ? 'IMPORTANT: Do NOT return the updated JSON yet. Instead, describe what changes you would make in plain text. List each change as a bullet point. The user will review and approve before you apply.' : 'Return the updated content JSON directly.'}`, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Current section content:\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\`\n\nInstruction: ${instruction.trim()}`,
      }],
    });

    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No AI response' }, { status: 500 });
    }

    const durationMs = Date.now() - startTime;

    // Track usage
    await trackUsage({
      userId: user.id,
      projectId: projectId || undefined,
      endpoint: 'ai/edit-section',
      model,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      durationMs,
    });

    // In plan mode, return the suggestion text
    if (mode === 'plan') {
      return NextResponse.json({
        mode: 'plan',
        suggestion: textBlock.text,
      });
    }

    // In auto mode, parse the JSON response
    let updatedContent;
    try {
      let json = textBlock.text.trim();
      const codeBlockMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) json = codeBlockMatch[1].trim();
      if (!json.startsWith('{')) {
        const objMatch = json.match(/\{[\s\S]*\}/);
        if (objMatch) json = objMatch[0];
      }
      updatedContent = JSON.parse(json);
    } catch {
      return NextResponse.json({
        error: 'AI returned invalid JSON. Try rephrasing your instruction.',
        rawResponse: textBlock.text.slice(0, 500),
      }, { status: 200 });
    }

    // If sectionId provided, update in DB too
    if (sectionId) {
      await supabase
        .from('structr_sections')
        .update({ content: updatedContent })
        .eq('id', sectionId);
    }

    return NextResponse.json({
      mode: 'auto',
      content: updatedContent,
    });
  } catch (e) {
    console.error('Edit section error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
