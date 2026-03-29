import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { hasEnoughStars } from '@/lib/db/credits';
import { getProject } from '@/lib/db/projects';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { calculateResolveCost } from '@/lib/credits/star-config';

export const maxDuration = 60;

// POST /api/ai/resolve-comments — Generate a plan to address unresolved comments
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await request.json();
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

    // Star check — minimum 1 star to generate plan (actual cost calculated after)
    const starCheck = await hasEnoughStars(user.id, 1);
    if (!starCheck.ok) {
      return NextResponse.json({ error: 'Insufficient stars', balance: starCheck.balance, required: 1 }, { status: 402 });
    }

    // Fetch unresolved comments
    const { data: comments } = await supabase
      .from('structr_comments')
      .select('*')
      .eq('project_id', projectId)
      .eq('resolved', false)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (!comments || comments.length === 0) {
      return NextResponse.json({ error: 'No unresolved comments found' }, { status: 400 });
    }

    // Fetch full project structure
    const project = await getProject(projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Build project structure summary for AI
    const projectStructure = project.structr_pages.map((page, pageIdx) => ({
      pageIndex: pageIdx,
      pageName: page.name,
      sections: (page.structr_sections || []).map((section, secIdx) => ({
        sectionIndex: secIdx,
        id: section.id,
        category: section.category,
        variantId: section.variant_id,
        contentSummary: summarizeContent(section.content),
      })),
    }));

    // Build comments list for AI
    const commentsList = comments.map(c => ({
      id: c.id,
      pageIndex: c.page_index,
      sectionIndex: c.section_index,
      authorName: c.author_name,
      message: c.message,
    }));

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    const anthropic = new Anthropic({ apiKey });

    const resolverPrompt = `You are analyzing client feedback comments on a wireframe project and generating a JSON action plan to address them.

## Available section types for new sections:
${SYSTEM_PROMPT.split('## Available Section Categories and Variants')[1]?.split('## Response Format')[0] || '(see section catalog)'}

## Rules:
- Each action must reference which comment ID(s) it resolves via "resolvesComments" array
- For "edit_content": return only the specific fields to change in "changes" object
- For "add_section": pick an appropriate category and variantId from the available list, generate realistic content
- For "reorder": use fromIndex/toIndex (0-based section indices within the page)
- For "remove_section": specify the sectionIndex to remove
- Group related comments into single actions when possible
- Be conservative — only make changes explicitly requested in the comments
- If a comment is unclear, still include it but note the ambiguity in the description

## Action types:
- "edit_content": Modify text/content fields in an existing section
- "reorder": Move a section to a different position
- "add_section": Create a new section with content
- "remove_section": Delete a section

Return ONLY valid JSON in this exact format:
\`\`\`json
{
  "plan": [
    {
      "type": "edit_content" | "reorder" | "add_section" | "remove_section",
      "pageIndex": 0,
      "sectionIndex": 1,
      "description": "Human-readable description of the change",
      "changes": { "title": "New Title" },
      "resolvesComments": ["comment-id-1"]
    }
  ],
  "summary": "X changes across Y pages, resolving Z comments"
}
\`\`\`

For "add_section", include: category, variantId, content (full content object), afterIndex (insert after this section index)
For "reorder", include: fromIndex, toIndex
For "remove_section", include: sectionIndex`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: [{ type: 'text', text: resolverPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `## Current Project Structure:\n${JSON.stringify(projectStructure, null, 2)}\n\n## Unresolved Comments:\n${JSON.stringify(commentsList, null, 2)}\n\nGenerate an action plan to address all these comments.`,
      }],
    });

    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No AI response' }, { status: 500 });
    }

    // Parse JSON from response
    let plan;
    try {
      let json = textBlock.text.trim();
      const codeBlockMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) json = codeBlockMatch[1].trim();
      if (!json.startsWith('{')) {
        const objMatch = json.match(/\{[\s\S]*\}/);
        if (objMatch) json = objMatch[0];
      }
      plan = JSON.parse(json);
    } catch {
      return NextResponse.json({
        error: 'AI returned invalid plan format',
        rawResponse: textBlock.text.slice(0, 1000),
      }, { status: 500 });
    }

    const actions = plan.plan || [];
    const starCost = calculateResolveCost(actions);

    return NextResponse.json({
      plan: actions,
      summary: plan.summary || `${actions.length} changes proposed`,
      commentCount: comments.length,
      starCost,
      // Include tokens for tracking (tracked on apply, not here)
      _usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });
  } catch (e) {
    console.error('Resolve comments error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** Summarize section content for AI context (keep it short) */
function summarizeContent(content: Record<string, unknown>): string {
  const parts: string[] = [];
  if (content.title) parts.push(`title: "${String(content.title).slice(0, 60)}"`);
  if (content.subtitle) parts.push(`subtitle: "${String(content.subtitle).slice(0, 60)}"`);
  if (Array.isArray(content.features)) parts.push(`${content.features.length} features`);
  if (Array.isArray(content.plans)) parts.push(`${content.plans.length} pricing plans`);
  if (Array.isArray(content.testimonials)) parts.push(`${content.testimonials.length} testimonials`);
  if (Array.isArray(content.items)) parts.push(`${content.items.length} items`);
  if (Array.isArray(content.links)) parts.push(`${content.links.length} links`);
  return parts.join(', ') || 'empty';
}
