import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectRole, hasPermission } from '@/lib/db/members';
import { logActivity } from '@/lib/db/activity';

type Params = { params: Promise<{ id: string; versionId: string }> };

// GET /api/projects/[id]/versions/[versionId] — get full snapshot
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id, versionId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'viewer')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: version, error } = await supabase
      .from('structr_project_versions')
      .select('*')
      .eq('id', versionId)
      .eq('project_id', id)
      .single();

    if (error || !version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/projects/[id]/versions/[versionId] — restore from snapshot
export async function POST(request: Request, { params }: Params) {
  try {
    const { id, versionId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = await getProjectRole(id, user.id);
    if (!hasPermission(role, 'editor')) {
      return NextResponse.json({ error: 'Only editors+ can restore versions' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.action !== 'restore') {
      return NextResponse.json({ error: 'Invalid action — use { action: "restore" }' }, { status: 400 });
    }

    // Fetch the version snapshot
    const { data: version, error: vErr } = await supabase
      .from('structr_project_versions')
      .select('*')
      .eq('id', versionId)
      .eq('project_id', id)
      .single();

    if (vErr || !version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    const snapshot = version.snapshot as { name: string; pages: Array<{ name: string; sort_order: number; sections: Array<{ category: string; variant_id: string; content: unknown; color_mode: string; sort_order: number }> }> };

    // Delete all existing pages (cascades to sections)
    const { data: existingPages } = await supabase
      .from('structr_pages')
      .select('id')
      .eq('project_id', id);

    if (existingPages) {
      for (const p of existingPages) {
        await supabase.from('structr_sections').delete().eq('page_id', p.id);
      }
      await supabase.from('structr_pages').delete().eq('project_id', id);
    }

    // Recreate pages and sections from snapshot
    for (const page of snapshot.pages) {
      const { data: newPage, error: pgErr } = await supabase
        .from('structr_pages')
        .insert({
          project_id: id,
          name: page.name,
          sort_order: page.sort_order,
        })
        .select('id')
        .single();

      if (pgErr || !newPage) continue;

      if (page.sections && page.sections.length > 0) {
        const sectionRows = page.sections.map(s => ({
          page_id: newPage.id,
          category: s.category,
          variant_id: s.variant_id,
          content: s.content,
          color_mode: s.color_mode || 'light',
          sort_order: s.sort_order,
        }));

        await supabase.from('structr_sections').insert(sectionRows);
      }
    }

    // Create a new version recording the restore
    const { data: lastVersion } = await supabase
      .from('structr_project_versions')
      .select('version_number')
      .eq('project_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const newVersionNumber = (lastVersion?.version_number || 0) + 1;

    await supabase.from('structr_project_versions').insert({
      project_id: id,
      version_number: newVersionNumber,
      label: `Restored from v${version.version_number}`,
      snapshot,
      created_by: user.id,
    });

    await logActivity(id, user.id, 'version_restored', {
      from_version: version.version_number,
      new_version: newVersionNumber,
    });

    return NextResponse.json({
      success: true,
      restored_from: version.version_number,
      new_version: newVersionNumber,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
