import { createClient } from '@/lib/supabase/server';
import { debitCredits } from '@/lib/db/credits';

// Pricing per 1M tokens (as of 2026)
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5-20251001': { input: 1.0, output: 5.0 },
  'claude-3-5-haiku-20241022': { input: 0.80, output: 4.0 },
  'claude-haiku-4-20250414': { input: 0.80, output: 4.0 },
};

// Recommended models per use case
export const MODELS = {
  // Full page generation from prompt — needs good reasoning
  generate: 'claude-sonnet-4-20250514',
  // Page analysis from website import — needs understanding
  analyze: 'claude-sonnet-4-20250514',
  // Section generation from page name only — simpler task, haiku is fine
  generateFromName: 'claude-haiku-4-5-20251001',
  // Wizard page generation — needs quality content
  wizard: 'claude-sonnet-4-20250514',
} as const;

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING[model] || PRICING['claude-sonnet-4-20250514'];
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

export async function trackUsage({
  userId,
  projectId,
  endpoint,
  model,
  inputTokens,
  outputTokens,
  durationMs,
}: {
  userId: string;
  projectId?: string;
  endpoint: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  durationMs?: number;
}) {
  try {
    const cost = calculateCost(model, inputTokens, outputTokens);
    const supabase = await createClient();
    await supabase.from('structr_ai_usage').insert({
      user_id: userId,
      project_id: projectId || null,
      endpoint,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: cost,
      duration_ms: durationMs || null,
    });

    // Debit credits for the AI usage cost
    await debitCredits(userId, cost, `${endpoint} (${model.split('-').slice(0, 2).join('-')})`);
  } catch (e) {
    console.error('Failed to track AI usage:', e);
  }
}
