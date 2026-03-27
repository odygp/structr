import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Public preview endpoint — no auth required
// Only returns project name, page names, and section data (no user info)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Use service-level query (RLS bypassed for public preview)
    // For now, any project with a valid ID can be previewed
    // TODO: Add a `public` flag to projects table for opt-in sharing
    const { data, error } = await supabase
      .from('structr_projects')
      .select(`
        name,
        structr_pages (
          name,
          sort_order,
          structr_sections (
            category,
            variant_id,
            content,
            color_mode,
            sort_order
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
