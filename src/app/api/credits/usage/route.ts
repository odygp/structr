import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStarCost, ENDPOINT_LABELS } from '@/lib/credits/star-config';

// GET /api/credits/usage — returns AI usage breakdown
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: usage } = await supabase
      .from('structr_ai_usage')
      .select('endpoint, model, cost_usd, input_tokens, output_tokens, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    const records = usage || [];

    // Daily breakdown (star costs)
    const dailyMap: Record<string, number> = {};
    for (const r of records) {
      const day = r.created_at.split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + getStarCost(r.endpoint);
    }
    const daily = Object.entries(dailyMap).map(([date, stars]) => ({ date, stars }));

    // Endpoint breakdown
    const endpointMap: Record<string, { calls: number; stars: number; costUsd: number }> = {};
    for (const r of records) {
      const ep = r.endpoint || 'unknown';
      if (!endpointMap[ep]) endpointMap[ep] = { calls: 0, stars: 0, costUsd: 0 };
      endpointMap[ep].calls++;
      endpointMap[ep].stars += getStarCost(r.endpoint);
      endpointMap[ep].costUsd += Number(r.cost_usd);
    }
    const byEndpoint = Object.entries(endpointMap).map(([endpoint, stats]) => ({
      endpoint,
      label: ENDPOINT_LABELS[endpoint] || endpoint,
      calls: stats.calls,
      stars: stats.stars,
      starCostPerCall: getStarCost(endpoint),
    }));

    // Totals
    const totalCalls = records.length;
    const totalStars = records.reduce((s, r) => s + getStarCost(r.endpoint), 0);

    return NextResponse.json({
      totalCalls,
      totalStars,
      daily,
      byEndpoint,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
