import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProject, deleteProject, saveProjectData, updateProject } from '@/lib/db/projects';
import { getProjectRole, hasPermission, acceptPendingInvites } from '@/lib/db/members';
import { logActivity } from '@/lib/db/activity';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Auto-accept any pending invites for this user
    if (user.email) await acceptPendingInvites(user.id, user.email);

    const role = await getProjectRole(id, user.id);
    if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const project = await getProject(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ...project, _role: role });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'editor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (body.pages) {
      await saveProjectData(id, body.pages);
      await logActivity(id, user.id, 'edited', { type: 'pages' });
    }

    if (body.name || body.thumbnail_url) {
      await updateProject(id, { name: body.name, thumbnail_url: body.thumbnail_url });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'editor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    await updateProject(id, body);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'owner')) {
      return NextResponse.json({ error: 'Only owners can delete projects' }, { status: 403 });
    }

    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
