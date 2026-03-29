import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProject } from '@/lib/db/projects';
import { getProjectRole, hasPermission } from '@/lib/db/members';
import { logActivity } from '@/lib/db/activity';

// GET /api/projects/[id]/versions — list all versions
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'viewer')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: versions, error } = await supabase
      .from('structr_project_versions')
      .select('id, version_number, label, created_by, created_at')
      .eq('project_id', id)
      .order('version_number', { ascending: false });

    if (error) throw error;

    // Get the project's current published_version_id
    const { data: project } = await supabase
      .from('structr_projects')
      .select('published_version_id')
      .eq('id', id)
      .single();

    return NextResponse.json({
      versions: versions || [],
      current_version_id: project?.published_version_id || null,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/projects/[id]/versions — create a manual snapshot
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'editor')) {
      return NextResponse.json({ error: 'Only editors+ can create snapshots' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));

    // Fetch full project with pages+sections
    const project = await getProject(id);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Get next version number
    const { data: lastVersion } = await supabase
      .from('structr_project_versions')
      .select('version_number')
      .eq('project_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const versionNumber = (lastVersion?.version_number || 0) + 1;

    const snapshot = {
      name: project.name,
      pages: project.structr_pages.map(p => ({
        name: p.name,
        sort_order: p.sort_order,
        sections: (p.structr_sections || []).map(s => ({
          category: s.category,
          variant_id: s.variant_id,
          content: s.content,
          color_mode: s.color_mode,
          sort_order: s.sort_order,
        })),
      })),
    };

    const { data: version, error } = await supabase
      .from('structr_project_versions')
      .insert({
        project_id: id,
        version_number: versionNumber,
        label: body.label || `Snapshot v${versionNumber}`,
        snapshot,
        created_by: user.id,
      })
      .select('id, version_number, label, created_at')
      .single();

    if (error) throw error;

    await logActivity(id, user.id, 'snapshot_created', { version: versionNumber });

    return NextResponse.json(version);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
