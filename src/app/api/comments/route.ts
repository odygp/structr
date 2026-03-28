import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logActivity, notifyCollaborators } from '@/lib/db/activity';

// GET /api/comments?project=ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project');
    if (!projectId) return NextResponse.json({ error: 'project required' }, { status: 400 });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('structr_comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/comments
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, page_index, section_index, element_selector, author_name, message, x_percent, y_percent, parent_id } = body;

    if (!project_id || !author_name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'project_id, author_name, and message are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Auto-link user_id if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('structr_comments')
      .insert({
        project_id,
        page_index: page_index ?? 0,
        section_index: section_index ?? 0,
        element_selector: element_selector || null,
        author_name: author_name.trim(),
        message: message.trim(),
        x_percent: x_percent ?? null,
        y_percent: y_percent ?? null,
        parent_id: parent_id || null,
        user_id: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity and notify collaborators
    if (user) {
      await logActivity(project_id, user.id, 'commented', {
        message: message.trim().substring(0, 100),
        section_index,
      });
    }
    await notifyCollaborators(project_id, user?.id || '', `${author_name.trim()} commented: "${message.trim().substring(0, 60)}"`);

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PATCH /api/comments?id=ID&action=resolve|unresolve
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (action === 'resolve') {
      const { error } = await supabase
        .from('structr_comments')
        .update({ resolved: true })
        .eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'unresolve') {
      const { error } = await supabase
        .from('structr_comments')
        .update({ resolved: false })
        .eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
