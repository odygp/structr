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

    // Fetch first page section categories for thumbnails
    const projects = data || [];
    if (projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      // Get first page per project with sections
      const { data: pages } = await supabase
        .from('structr_pages')
        .select('project_id, id')
        .in('project_id', projectIds)
        .eq('sort_order', 0);

      if (pages && pages.length > 0) {
        const pageIds = pages.map(p => p.id);
        const { data: sections } = await supabase
          .from('structr_sections')
          .select('page_id, category')
          .in('page_id', pageIds)
          .order('sort_order', { ascending: true });

        // Map page_id → project_id
        const pageToProject = new Map(pages.map(p => [p.id, p.project_id]));
        const projectSections = new Map<string, { category: string }[]>();

        for (const s of sections || []) {
          const pid = pageToProject.get(s.page_id);
          if (!pid) continue;
          if (!projectSections.has(pid)) projectSections.set(pid, []);
          projectSections.get(pid)!.push({ category: s.category });
        }

        for (const p of projects) {
          (p as Record<string, unknown>).first_page_sections = projectSections.get(p.id) || [];
        }
      }
    }

    return NextResponse.json(projects);
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
