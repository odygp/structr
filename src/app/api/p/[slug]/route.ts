import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET — public endpoint, returns published snapshot
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Find project by slug
    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .select('id, name, slug, published_version_id, status')
      .eq('slug', slug)
      .single();

    if (pErr || !project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!project.published_version_id || project.status !== 'published') {
      return NextResponse.json({ error: 'This project is not published' }, { status: 404 });
    }

    // Get the published version snapshot
    const { data: version, error: vErr } = await supabase
      .from('structr_project_versions')
      .select('snapshot, version_number, created_at')
      .eq('id', project.published_version_id)
      .single();

    if (vErr || !version) {
      return NextResponse.json({ error: 'Published version not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        project_id: project.id,
        name: project.name,
        slug: project.slug,
        version: version.version_number,
        published_at: version.created_at,
        ...version.snapshot,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
