import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['odysseas@holy.gd', 'odysseasgp@gmail.com'];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all usage data (for a small app, this is fine)
    const { data: allUsage } = await supabase
      .from('structr_ai_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    const rows = allUsage || [];

    // Calculate KPIs
    const totalCalls = rows.length;
    const totalCost = rows.reduce((sum, r) => sum + Number(r.cost_usd), 0);
    const totalInputTokens = rows.reduce((sum, r) => sum + r.input_tokens, 0);
    const totalOutputTokens = rows.reduce((sum, r) => sum + r.output_tokens, 0);

    // Today
    const today = new Date().toISOString().split('T')[0];
    const todayRows = rows.filter(r => r.created_at?.startsWith(today));
    const todayCost = todayRows.reduce((sum, r) => sum + Number(r.cost_usd), 0);
    const todayCalls = todayRows.length;

    // By model
    const byModel: Record<string, { calls: number; cost: number; inputTokens: number; outputTokens: number }> = {};
    rows.forEach(r => {
      if (!byModel[r.model]) byModel[r.model] = { calls: 0, cost: 0, inputTokens: 0, outputTokens: 0 };
      byModel[r.model].calls++;
      byModel[r.model].cost += Number(r.cost_usd);
      byModel[r.model].inputTokens += r.input_tokens;
      byModel[r.model].outputTokens += r.output_tokens;
    });

    // By endpoint
    const byEndpoint: Record<string, { calls: number; cost: number }> = {};
    rows.forEach(r => {
      if (!byEndpoint[r.endpoint]) byEndpoint[r.endpoint] = { calls: 0, cost: 0 };
      byEndpoint[r.endpoint].calls++;
      byEndpoint[r.endpoint].cost += Number(r.cost_usd);
    });

    // Top projects by cost
    const projectCosts: Record<string, { calls: number; cost: number; tokens: number }> = {};
    rows.forEach(r => {
      if (!r.project_id) return;
      if (!projectCosts[r.project_id]) projectCosts[r.project_id] = { calls: 0, cost: 0, tokens: 0 };
      projectCosts[r.project_id].calls++;
      projectCosts[r.project_id].cost += Number(r.cost_usd);
      projectCosts[r.project_id].tokens += r.input_tokens + r.output_tokens;
    });

    const topProjectIds = Object.entries(projectCosts)
      .sort(([, a], [, b]) => b.cost - a.cost)
      .slice(0, 10)
      .map(([id]) => id);

    // Fetch project names and user info
    let topProjects: { projectId: string; projectName: string; userEmail: string; calls: number; cost: number; tokens: number }[] = [];
    if (topProjectIds.length > 0) {
      const { data: projects } = await supabase
        .from('structr_projects')
        .select('id, name, user_id')
        .in('id', topProjectIds);

      topProjects = topProjectIds.map(pid => {
        const proj = (projects || []).find(p => p.id === pid);
        const stats = projectCosts[pid];
        return {
          projectId: pid,
          projectName: proj?.name || 'Unknown',
          userEmail: proj?.user_id?.slice(0, 8) || 'Unknown', // We'll resolve below
          calls: stats.calls,
          cost: stats.cost,
          tokens: stats.tokens,
        };
      });
    }

    // Top users by cost
    const userCosts: Record<string, { calls: number; cost: number; tokens: number }> = {};
    rows.forEach(r => {
      if (!userCosts[r.user_id]) userCosts[r.user_id] = { calls: 0, cost: 0, tokens: 0 };
      userCosts[r.user_id].calls++;
      userCosts[r.user_id].cost += Number(r.cost_usd);
      userCosts[r.user_id].tokens += r.input_tokens + r.output_tokens;
    });

    const topUsers = Object.entries(userCosts)
      .sort(([, a], [, b]) => b.cost - a.cost)
      .slice(0, 10)
      .map(([userId, stats]) => ({
        userId: userId.slice(0, 8) + '...',
        ...stats,
      }));

    return NextResponse.json({
      kpis: {
        totalCalls,
        totalCost: Math.round(totalCost * 10000) / 10000,
        totalInputTokens,
        totalOutputTokens,
        todayCalls,
        todayCost: Math.round(todayCost * 10000) / 10000,
        avgCostPerCall: totalCalls > 0 ? Math.round((totalCost / totalCalls) * 10000) / 10000 : 0,
      },
      byModel: Object.entries(byModel).map(([model, stats]) => ({
        model,
        ...stats,
        cost: Math.round(stats.cost * 10000) / 10000,
      })),
      byEndpoint: Object.entries(byEndpoint)
        .map(([endpoint, stats]) => ({
          endpoint,
          ...stats,
          cost: Math.round(stats.cost * 10000) / 10000,
        }))
        .sort((a, b) => b.cost - a.cost),
      topProjects: topProjects.map(p => ({ ...p, cost: Math.round(p.cost * 10000) / 10000 })),
      topUsers: topUsers.map(u => ({ ...u, cost: Math.round(u.cost * 10000) / 10000 })),
      recentCalls: rows.slice(0, 20).map(r => ({
        endpoint: r.endpoint,
        model: r.model,
        inputTokens: r.input_tokens,
        outputTokens: r.output_tokens,
        cost: Math.round(Number(r.cost_usd) * 10000) / 10000,
        durationMs: r.duration_ms,
        createdAt: r.created_at,
      })),
    });
  } catch (e) {
    console.error('Admin usage error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
