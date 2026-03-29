import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchCleanContent } from '@/lib/import/html-analyzer';
import { analyzePageWithAI, generateSectionsForPage } from '@/lib/import/ai-analyzer';
import { trackUsage, MODELS } from '@/lib/ai/track-usage';
import { hasEnoughStars } from '@/lib/db/credits';
import { getStarCost } from '@/lib/credits/star-config';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { parseAiResponse } from '@/lib/ai/parse-response';
import { buildWizardPrompt } from '@/lib/templates';

export const maxDuration = 60;

// POST /api/import/process — Process the next pending job for a project
export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Star check — cost depends on job type, determined after fetching job
    // Defer check until we know the job type

    // Find oldest pending job for this project
    const { data: job, error: fetchErr } = await supabase
      .from('structr_import_queue')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'pending')
      .order('sort_order', { ascending: true })
      .limit(1)
      .single();

    if (fetchErr || !job) {
      return NextResponse.json({ done: true, message: 'No pending jobs' });
    }

    // Star check based on job type
    if (user) {
      const starCost = getStarCost('', job.job_type);
      const starCheck = await hasEnoughStars(user.id, starCost);
      if (!starCheck.ok) {
        return NextResponse.json({ error: 'Insufficient stars', balance: starCheck.balance, required: starCost }, { status: 402 });
      }
    }

    // Mark as processing
    await supabase
      .from('structr_import_queue')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', job.id);

    try {
      const startTime = Date.now();
      let sections: { category: string; variantId: string; content: Record<string, unknown>; colorMode?: string }[] = [];
      let usageData: { model: string; inputTokens: number; outputTokens: number } | null = null;
      let endpoint = '';

      // --- WEBSITE IMPORT ---
      if (job.job_type === 'website') {
        endpoint = 'import/website/page';
        const url = job.payload?.url;
        if (!url) throw new Error('No URL in payload');

        const content = await fetchCleanContent(url);
        if (!content || content.length < 50) {
          // Mark as skipped — no content to analyze
          await supabase
            .from('structr_import_queue')
            .update({ status: 'skipped', completed_at: new Date().toISOString(), error_message: 'Could not extract content' })
            .eq('id', job.id);
          triggerNext(projectId);
          return NextResponse.json({ done: true, skipped: true });
        }

        const result = await analyzePageWithAI(content, job.page_name, url);
        if (result.usage) usageData = result.usage;
        sections = result.sections;
      }

      // --- OCTOPUS IMPORT ---
      else if (job.job_type === 'octopus') {
        endpoint = 'import/octopus/page';
        const result = await generateSectionsForPage(
          job.page_name,
          job.payload?.description,
          { title: job.payload?.seoTitle, description: job.payload?.seoDescription }
        );
        if (result.usage) usageData = result.usage;
        sections = result.sections;
      }

      // --- WIZARD IMPORT ---
      else if (job.job_type === 'wizard') {
        endpoint = 'import/wizard/page';
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

        const wizardData = job.payload?.wizardData;
        const basePrompt = buildWizardPrompt({ ...wizardData, pages: [job.page_name] });
        const focusedPrompt = `${basePrompt}\n\nIMPORTANT: Generate sections for ONLY the "${job.page_name}" page. Return a single page with appropriate sections.`;

        const model = MODELS.wizard;
        const anthropic = new Anthropic({ apiKey });
        const message = await anthropic.messages.create({
          model,
          max_tokens: 3000,
          system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: focusedPrompt }],
        });

        const textBlock = message.content.find(b => b.type === 'text');
        if (!textBlock || textBlock.type !== 'text') throw new Error('No AI response');

        const aiResult = parseAiResponse(textBlock.text);
        const pageData = aiResult.pages[0];
        if (pageData) sections = pageData.sections;

        usageData = {
          model,
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        };
      }

      const durationMs = Date.now() - startTime;

      // Track AI usage
      if (usageData) {
        await trackUsage({
          userId: job.user_id,
          projectId,
          endpoint,
          model: usageData.model,
          inputTokens: usageData.inputTokens,
          jobType: job.job_type,
          outputTokens: usageData.outputTokens,
          durationMs,
        });
      }

      if (sections.length === 0) {
        await supabase
          .from('structr_import_queue')
          .update({ status: 'skipped', completed_at: new Date().toISOString(), error_message: 'No sections generated' })
          .eq('id', job.id);
        triggerNext(projectId);
        return NextResponse.json({ done: true, skipped: true });
      }

      // Create or update page in structr_pages
      let pageId: string;
      const { data: existingPages } = await supabase
        .from('structr_pages')
        .select('id')
        .eq('project_id', projectId)
        .eq('sort_order', job.sort_order);

      if (existingPages && existingPages.length > 0) {
        pageId = existingPages[0].id;
        await supabase.from('structr_sections').delete().eq('page_id', pageId);
        await supabase.from('structr_pages').update({ name: job.page_name }).eq('id', pageId);
      } else {
        const { data: dbPage, error: pgErr } = await supabase
          .from('structr_pages')
          .insert({ project_id: projectId, name: job.page_name, sort_order: job.sort_order })
          .select()
          .single();
        if (pgErr || !dbPage) throw new Error('Failed to create page');
        pageId = dbPage.id;
      }

      // Insert sections
      const sectionRows = sections.map((s, i) => ({
        page_id: pageId,
        category: s.category,
        variant_id: s.variantId,
        content: s.content,
        color_mode: s.colorMode || 'light',
        sort_order: i,
      }));

      await supabase.from('structr_sections').insert(sectionRows);

      // Mark job as completed
      await supabase
        .from('structr_import_queue')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', job.id);

      // Self-chain: trigger next job
      triggerNext(projectId);

      return NextResponse.json({ done: true, pageId, sectionCount: sectionRows.length });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`Import job ${job.id} failed:`, msg);

      // Mark as failed
      await supabase
        .from('structr_import_queue')
        .update({
          status: 'failed',
          error_message: msg,
          retry_count: (job.retry_count || 0) + 1,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      // Continue to next job even if this one failed
      triggerNext(projectId);

      return NextResponse.json({ done: true, error: msg });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Process route error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Fire-and-forget call to process next job
function triggerNext(projectId: string) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SUPABASE_URL
      ? 'https://structr.holy.black' // Production fallback
      : 'http://localhost:3000';

  fetch(`${baseUrl}/api/import/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  }).catch(() => {
    // Silently fail — cron will pick up stalled jobs
  });
}
