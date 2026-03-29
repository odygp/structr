import { createClient } from '@/lib/supabase/server';

const INITIAL_FREE_CREDITS = 5.00;

/** Get or create a user's credit balance. New users get $5.00 free credits. */
export async function getOrCreateCredits(userId: string): Promise<{ balance: number; lifetime_used: number }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('structr_credits')
    .select('balance, lifetime_used')
    .eq('user_id', userId)
    .single();

  if (existing) return { balance: Number(existing.balance), lifetime_used: Number(existing.lifetime_used) };

  // Create with initial credits
  const { data: created, error } = await supabase
    .from('structr_credits')
    .insert({ user_id: userId, balance: INITIAL_FREE_CREDITS, lifetime_used: 0 })
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
    amount: INITIAL_FREE_CREDITS,
    balance_after: INITIAL_FREE_CREDITS,
    description: 'Welcome bonus — free credits',
  });

  return { balance: Number(created.balance), lifetime_used: Number(created.lifetime_used) };
}

/** Check if user has enough credits for an estimated cost. */
export async function hasEnoughCredits(userId: string, estimatedCost: number = 0.01): Promise<{ ok: boolean; balance: number }> {
  const { balance } = await getOrCreateCredits(userId);
  return { ok: balance >= estimatedCost, balance };
}

/** Debit credits after an AI call. Returns new balance. */
export async function debitCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string
): Promise<number> {
  if (amount <= 0) return (await getOrCreateCredits(userId)).balance;

  const supabase = await createClient();
  const { balance, lifetime_used } = await getOrCreateCredits(userId);

  const actualDebit = Math.min(amount, balance);
  const newBalance = Math.max(0, balance - amount);

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

/** Grant credits to a user (admin action or future Stripe). */
export async function grantCredits(
  userId: string,
  amount: number,
  description: string
): Promise<number> {
  const supabase = await createClient();
  const { balance } = await getOrCreateCredits(userId);
  const newBalance = balance + amount;

  await supabase
    .from('structr_credits')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  await supabase.from('structr_credit_transactions').insert({
    user_id: userId,
    type: 'grant',
    amount,
    balance_after: newBalance,
    description,
  });

  return newBalance;
}
