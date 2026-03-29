import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateStarBalance } from '@/lib/db/credits';

// GET /api/credits — returns user's star balance + recent transactions
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { balance, lifetime_used } = await getOrCreateStarBalance(user.id);

    // Fetch recent transactions
    const { data: transactions } = await supabase
      .from('structr_credit_transactions')
      .select('id, type, amount, balance_after, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    return NextResponse.json({
      stars: balance,
      lifetime_used,
      transactions: transactions || [],
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
