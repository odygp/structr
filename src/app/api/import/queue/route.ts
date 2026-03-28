import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/import/queue?projectId=X — Poll import progress
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: jobs, error } = await supabase
      .from('structr_import_queue')
      .select('id, page_name, sort_order, status, job_type, error_message, created_at, completed_at')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const total = jobs?.length || 0;
    const completed = jobs?.filter(j => j.status === 'completed').length || 0;
    const failed = jobs?.filter(j => j.status === 'failed' || j.status === 'skipped').length || 0;
    const pending = jobs?.filter(j => j.status === 'pending').length || 0;
    const processing = jobs?.filter(j => j.status === 'processing').length || 0;

    return NextResponse.json({
      jobs: jobs || [],
      summary: { total, completed, failed, pending, processing },
      allDone: pending === 0 && processing === 0,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
