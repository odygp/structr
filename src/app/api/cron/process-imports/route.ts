import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/cron/process-imports — Vercel Cron fallback (every 1 min)
// Picks up stalled or pending jobs that the self-chain missed
export async function GET(request: Request) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Reset stalled jobs (processing for >2 minutes) back to pending
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    await supabase
      .from('structr_import_queue')
      .update({ status: 'pending', started_at: null })
      .eq('status', 'processing')
      .lt('started_at', twoMinAgo);

    // Find all projects with pending jobs
    const { data: pendingJobs } = await supabase
      .from('structr_import_queue')
      .select('project_id')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (!pendingJobs || pendingJobs.length === 0) {
      return NextResponse.json({ message: 'No pending jobs' });
    }

    // Get unique project IDs
    const projectIds = [...new Set(pendingJobs.map(j => j.project_id))];

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://structr.holy.black';

    // Trigger processing for each project (fire-and-forget)
    for (const projectId of projectIds) {
      fetch(`${baseUrl}/api/import/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      }).catch(() => {});
    }

    return NextResponse.json({
      message: `Triggered processing for ${projectIds.length} projects`,
      projectIds,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Cron process-imports error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
