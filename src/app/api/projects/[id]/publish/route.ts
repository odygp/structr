import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProject } from '@/lib/db/projects';
import { getProjectRole, hasPermission } from '@/lib/db/members';
import { logActivity, notifyCollaborators } from '@/lib/db/activity';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

// POST — publish the project (creates a version snapshot)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'admin')) {
      return NextResponse.json({ error: 'Only owners and admins can publish' }, { status: 403 });
    }

    // Fetch full project data
    const project = await getProject(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Optional custom slug from request body
    const body = await request.json().catch(() => ({}));
    let slug = body.slug || project.slug;

    // Generate slug if not set
    if (!slug) {
      slug = slugify(project.name || 'project');
      // Ensure unique — append random suffix on collision
      const { data: existing } = await supabase
        .from('structr_projects')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .limit(1);
      if (existing && existing.length > 0) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }

    // Get next version number
    const { data: lastVersion } = await supabase
      .from('structr_project_versions')
      .select('version_number')
      .eq('project_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const versionNumber = (lastVersion?.version_number || 0) + 1;

    // Create snapshot (full project data as JSON)
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

    // Insert version
    const { data: version, error: vErr } = await supabase
      .from('structr_project_versions')
      .insert({
        project_id: id,
        version_number: versionNumber,
        label: body.label || `v${versionNumber}`,
        snapshot,
        created_by: user.id,
      })
      .select()
      .single();

    if (vErr) throw vErr;

    // Update project
    const { error: pErr } = await supabase
      .from('structr_projects')
      .update({
        status: 'published',
        slug,
        published_at: new Date().toISOString(),
        published_version_id: version.id,
      })
      .eq('id', id);

    if (pErr) throw pErr;

    await logActivity(id, user.id, 'published', { version: versionNumber, slug });
    await notifyCollaborators(id, user.id, `Project published as v${versionNumber}`);

    return NextResponse.json({
      slug,
      version_number: versionNumber,
      version_id: version.id,
      url: `/p/${slug}`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE — unpublish the project
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'admin')) {
      return NextResponse.json({ error: 'Only owners and admins can unpublish' }, { status: 403 });
    }

    const { error } = await supabase
      .from('structr_projects')
      .update({
        status: 'draft',
        published_at: null,
        published_version_id: null,
      })
      .eq('id', id);

    if (error) throw error;

    await logActivity(id, user.id, 'unpublished');

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
