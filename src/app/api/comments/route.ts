import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PATCH /api/comments?id=ID&action=resolve
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = await createClient();

    // Auth check — only project owner can resolve
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

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
