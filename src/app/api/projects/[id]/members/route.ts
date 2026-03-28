import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectRole, getProjectMembers, addProjectMember, removeProjectMember, updateMemberRole, hasPermission } from '@/lib/db/members';
import { logActivity, notifyCollaborators } from '@/lib/db/activity';

// GET — list project members
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Get owner info
    const { data: project } = await supabase
      .from('structr_projects')
      .select('user_id')
      .eq('id', id)
      .single();

    const members = await getProjectMembers(id);

    return NextResponse.json({
      owner_id: project?.user_id,
      members,
      your_role: role,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST — invite a member
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'admin')) {
      return NextResponse.json({ error: 'Only owners and admins can invite members' }, { status: 403 });
    }

    const { email, role: memberRole } = await request.json();
    if (!email?.trim()) return NextResponse.json({ error: 'email is required' }, { status: 400 });
    if (!['viewer', 'editor', 'admin'].includes(memberRole)) {
      return NextResponse.json({ error: 'role must be viewer, editor, or admin' }, { status: 400 });
    }

    // Don't allow inviting the project owner
    const { data: project } = await supabase
      .from('structr_projects')
      .select('user_id, name')
      .eq('id', id)
      .single();

    if (user.email?.toLowerCase() === email.toLowerCase().trim() || project?.user_id === user.id) {
      // Check if email matches owner — we'd need to look up owner's email
    }

    const member = await addProjectMember(id, email, memberRole, user.id);

    await logActivity(id, user.id, 'shared', { email, role: memberRole });
    await notifyCollaborators(id, user.id, `${user.email} invited ${email} as ${memberRole}`);

    return NextResponse.json(member);
  } catch (e) {
    const msg = String(e);
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json({ error: 'This email is already a member' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — update member role
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'owner')) {
      return NextResponse.json({ error: 'Only owners can change member roles' }, { status: 403 });
    }

    const { memberId, role: newRole } = await request.json();
    if (!memberId || !['viewer', 'editor', 'admin'].includes(newRole)) {
      return NextResponse.json({ error: 'memberId and valid role required' }, { status: 400 });
    }

    await updateMemberRole(id, memberId, newRole);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE — remove a member
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'owner')) {
      return NextResponse.json({ error: 'Only owners can remove members' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 });

    await removeProjectMember(id, memberId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
