import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createProject } from '@/lib/db/projects';
import { getSharedProjectIds, acceptPendingInvites } from '@/lib/db/members';
import { logActivity } from '@/lib/db/activity';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Auto-accept pending invites
    if (user.email) await acceptPendingInvites(user.id, user.email);

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab'); // all, favorites, drafts, archived, shared
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'updated_at';

    // Handle "shared" tab separately
    if (tab === 'shared') {
      const sharedIds = await getSharedProjectIds(user.id, user.email || '');
      if (sharedIds.length === 0) return NextResponse.json([]);

      let query = supabase
        .from('structr_projects')
        .select('id, name, thumbnail_url, status, is_favorite, tags, slug, published_at, created_at, updated_at, user_id')
        .in('id', sharedIds);

      if (search?.trim()) query = query.ilike('name', `%${search.trim()}%`);
      if (sort === 'name') query = query.order('name', { ascending: true });
      else if (sort === 'created_at') query = query.order('created_at', { ascending: false });
      else query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json(data || []);
    }

    // Own projects
    let query = supabase
      .from('structr_projects')
      .select('id, name, thumbnail_url, status, is_favorite, tags, slug, published_at, created_at, updated_at')
      .eq('user_id', user.id);

    if (tab === 'favorites') query = query.eq('is_favorite', true);
    else if (tab === 'drafts') query = query.eq('status', 'draft');
    else if (tab === 'archived') query = query.eq('status', 'archived');
    else query = query.neq('status', 'archived');

    if (search?.trim()) query = query.ilike('name', `%${search.trim()}%`);

    if (sort === 'name') query = query.order('name', { ascending: true });
    else if (sort === 'created_at') query = query.order('created_at', { ascending: false });
    else query = query.order('updated_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const project = await createProject(user.id, body.name || 'Untitled Project');

    await logActivity(project.id, user.id, 'created', { name: project.name });

    return NextResponse.json(project);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
