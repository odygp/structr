import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET — list user's reusable sections
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('structr_reusable_sections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST — save a section as reusable
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, category, variantId, content, colorMode, sourceProjectName } = await request.json();
    if (!category || !variantId) return NextResponse.json({ error: 'category and variantId required' }, { status: 400 });

    // Always create a new entry — users can save multiple versions of the same variant
    // with different content (e.g., Hero Centered for Tally vs Hero Centered for a restaurant)
    const displayName = sourceProjectName
      ? `${name || variantId} (${sourceProjectName})`
      : name || variantId.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const { data, error } = await supabase
      .from('structr_reusable_sections')
      .insert({
        user_id: user.id,
        name: displayName,
        category,
        variant_id: variantId,
        content: content || {},
        color_mode: colorMode || 'light',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE — remove a reusable section
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('structr_reusable_sections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
