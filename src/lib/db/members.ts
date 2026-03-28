import { createClient } from '@/lib/supabase/server';
import type { DbProjectMember, ProjectRole } from './types';

/** Check what role a user has on a project. Returns null if no access. */
export async function getProjectRole(projectId: string, userId: string): Promise<ProjectRole> {
  const supabase = await createClient();

  // Check ownership first
  const { data: project } = await supabase
    .from('structr_projects')
    .select('user_id')
    .eq('id', projectId)
    .single();

  if (project?.user_id === userId) return 'owner';

  // Check membership
  const { data: member } = await supabase
    .from('structr_project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();

  return (member?.role as ProjectRole) || null;
}

/** List all members of a project (excludes owner — owner is implicit). */
export async function getProjectMembers(projectId: string): Promise<DbProjectMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('structr_project_members')
    .select('*')
    .eq('project_id', projectId)
    .order('invited_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/** Add a member to a project by email. Looks up user in auth if possible. */
export async function addProjectMember(
  projectId: string,
  email: string,
  role: 'viewer' | 'editor' | 'admin',
  invitedBy: string
): Promise<DbProjectMember> {
  const supabase = await createClient();

  // Try to find user by email (using the admin-accessible view)
  // Since we can't query auth.users directly with anon key, we'll store email
  // and the user will be linked when they access the project
  const { data, error } = await supabase
    .from('structr_project_members')
    .insert({
      project_id: projectId,
      email: email.toLowerCase().trim(),
      role,
      invited_by: invitedBy,
      user_id: null, // Will be set when the user first accesses the project
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Remove a member from a project. */
export async function removeProjectMember(projectId: string, memberId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('structr_project_members')
    .delete()
    .eq('id', memberId)
    .eq('project_id', projectId);
  if (error) throw error;
}

/** Update a member's role. */
export async function updateMemberRole(
  projectId: string,
  memberId: string,
  role: 'viewer' | 'editor' | 'admin'
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('structr_project_members')
    .update({ role })
    .eq('id', memberId)
    .eq('project_id', projectId);
  if (error) throw error;
}

/** Auto-accept pending invites for a user (called on project access). */
export async function acceptPendingInvites(userId: string, email: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('structr_project_members')
    .update({ user_id: userId, accepted_at: new Date().toISOString() })
    .eq('email', email.toLowerCase().trim())
    .is('user_id', null);
}

/** Get project IDs where a user is a member (for "Shared with me"). */
export async function getSharedProjectIds(userId: string, email: string): Promise<string[]> {
  const supabase = await createClient();

  // Match by user_id or email (for pending invites)
  const { data } = await supabase
    .from('structr_project_members')
    .select('project_id')
    .or(`user_id.eq.${userId},email.eq.${email.toLowerCase().trim()}`);

  return (data || []).map(d => d.project_id);
}

/** Check if role has sufficient permission. */
export function hasPermission(role: ProjectRole, required: 'viewer' | 'editor' | 'admin' | 'owner'): boolean {
  const levels: Record<string, number> = { viewer: 1, editor: 2, admin: 3, owner: 4 };
  if (!role) return false;
  return levels[role] >= levels[required];
}
