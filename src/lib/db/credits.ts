import { createClient } from '@/lib/supabase/server';
import { INITIAL_FREE_STARS } from '@/lib/credits/star-config';

/** Get or create a user's star balance. New users get 50 free stars. */
export async function getOrCreateStarBalance(userId: string): Promise<{ balance: number; lifetime_used: number }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('structr_credits')
    .select('balance, lifetime_used')
    .eq('user_id', userId)
    .single();

  if (existing) return { balance: Number(existing.balance), lifetime_used: Number(existing.lifetime_used) };

  // Create with initial stars
  const { data: created, error } = await supabase
    .from('structr_credits')
    .insert({ user_id: userId, balance: INITIAL_FREE_STARS, lifetime_used: 0 })
    .select('balance, lifetime_used')
    .single();

  if (error) {
    // Race condition — another request may have created it
    const { data: retry } = await supabase
      .from('structr_credits')
      .select('balance, lifetime_used')
      .eq('user_id', userId)
      .single();
    if (retry) return { balance: Number(retry.balance), lifetime_used: Number(retry.lifetime_used) };
    throw error;
  }

  // Log the initial grant
  await supabase.from('structr_credit_transactions').insert({
    user_id: userId,
    type: 'grant',
    amount: INITIAL_FREE_STARS,
    balance_after: INITIAL_FREE_STARS,
    description: `Welcome bonus — ${INITIAL_FREE_STARS} free stars`,
  });

  return { balance: Number(created.balance), lifetime_used: Number(created.lifetime_used) };
}

/** Check if user has enough stars for an action. */
export async function hasEnoughStars(userId: string, starCost: number = 1): Promise<{ ok: boolean; balance: number }> {
  const { balance } = await getOrCreateStarBalance(userId);
  return { ok: balance >= starCost, balance };
}

/** Debit stars after an AI call. Returns new balance. */
export async function debitStars(
  userId: string,
  stars: number,
  description: string,
  referenceId?: string
): Promise<number> {
  if (stars <= 0) return (await getOrCreateStarBalance(userId)).balance;

  const supabase = await createClient();
  const { balance, lifetime_used } = await getOrCreateStarBalance(userId);

  const actualDebit = Math.min(stars, balance);
  const newBalance = Math.max(0, balance - stars);

  await supabase
    .from('structr_credits')
    .update({
      balance: newBalance,
      lifetime_used: lifetime_used + actualDebit,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  await supabase.from('structr_credit_transactions').insert({
    user_id: userId,
    type: 'debit',
    amount: -actualDebit,
    balance_after: newBalance,
    description,
    reference_id: referenceId || null,
  });

  return newBalance;
}

/** Grant stars to a user (admin action or future Stripe). */
export async function grantStars(
  userId: string,
  stars: number,
  description: string
): Promise<number> {
  const supabase = await createClient();
  const { balance } = await getOrCreateStarBalance(userId);
  const newBalance = balance + stars;

  await supabase
    .from('structr_credits')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  await supabase.from('structr_credit_transactions').insert({
    user_id: userId,
    type: 'grant',
    amount: stars,
    balance_after: newBalance,
    description,
  });

  return newBalance;
}
