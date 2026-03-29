import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/credits/usage — returns AI usage breakdown from structr_ai_usage
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get all usage for this user in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: usage } = await supabase
      .from('structr_ai_usage')
      .select('endpoint, model, cost_usd, input_tokens, output_tokens, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    const records = usage || [];

    // Daily breakdown
    const dailyMap: Record<string, number> = {};
    for (const r of records) {
      const day = r.created_at.split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + Number(r.cost_usd);
    }
    const daily = Object.entries(dailyMap).map(([date, cost]) => ({ date, cost: Math.round(cost * 10000) / 10000 }));

    // Endpoint breakdown
    const endpointMap: Record<string, { calls: number; cost: number }> = {};
    for (const r of records) {
      const ep = r.endpoint || 'unknown';
      if (!endpointMap[ep]) endpointMap[ep] = { calls: 0, cost: 0 };
      endpointMap[ep].calls++;
      endpointMap[ep].cost += Number(r.cost_usd);
    }
    const byEndpoint = Object.entries(endpointMap).map(([endpoint, stats]) => ({
      endpoint,
      calls: stats.calls,
      cost: Math.round(stats.cost * 10000) / 10000,
    }));

    // Model breakdown
    const modelMap: Record<string, { calls: number; cost: number }> = {};
    for (const r of records) {
      const m = r.model || 'unknown';
      if (!modelMap[m]) modelMap[m] = { calls: 0, cost: 0 };
      modelMap[m].calls++;
      modelMap[m].cost += Number(r.cost_usd);
    }
    const byModel = Object.entries(modelMap).map(([model, stats]) => ({
      model,
      calls: stats.calls,
      cost: Math.round(stats.cost * 10000) / 10000,
    }));

    // Totals
    const totalCalls = records.length;
    const totalCost = Math.round(records.reduce((s, r) => s + Number(r.cost_usd), 0) * 10000) / 10000;

    return NextResponse.json({
      totalCalls,
      totalCost,
      daily,
      byEndpoint,
      byModel,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
