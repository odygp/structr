import { createClient } from '@/lib/supabase/server';

/** Log an activity event on a project. */
export async function logActivity(
  projectId: string,
  userId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('structr_project_activity').insert({
      project_id: projectId,
      user_id: userId,
      action,
      details: details || {},
    });
  } catch {
    // Activity logging should never block the main operation
    console.error('Failed to log activity:', action);
  }
}

/** Notify all collaborators on a project (excluding the actor). */
export async function notifyCollaborators(
  projectId: string,
  actorUserId: string,
  message: string,
  link?: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // Get project owner
    const { data: project } = await supabase
      .from('structr_projects')
      .select('user_id, name')
      .eq('id', projectId)
      .single();

    // Get all members with user_id set
    const { data: members } = await supabase
      .from('structr_project_members')
      .select('user_id')
      .eq('project_id', projectId)
      .not('user_id', 'is', null);

    // Collect unique user IDs (owner + members), exclude actor
    const userIds = new Set<string>();
    if (project?.user_id && project.user_id !== actorUserId) {
      userIds.add(project.user_id);
    }
    for (const m of members || []) {
      if (m.user_id && m.user_id !== actorUserId) {
        userIds.add(m.user_id);
      }
    }

    if (userIds.size === 0) return;

    // Create notifications
    const notifications = Array.from(userIds).map(uid => ({
      user_id: uid,
      type: 'project_update',
      title: project?.name || 'Project',
      message,
      link: link || `/builder?project=${projectId}`,
      read: false,
    }));

    await supabase.from('structr_notifications').insert(notifications);
  } catch {
    console.error('Failed to notify collaborators');
  }
}
