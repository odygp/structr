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

    const { name, category, variantId, content, colorMode } = await request.json();
    if (!category || !variantId) return NextResponse.json({ error: 'category and variantId required' }, { status: 400 });

    // Check if this variant already exists for this user — update instead of duplicate
    const { data: existing } = await supabase
      .from('structr_reusable_sections')
      .select('id')
      .eq('user_id', user.id)
      .eq('variant_id', variantId)
      .limit(1)
      .single();

    if (existing) {
      // Update existing entry with new content
      const { data, error } = await supabase
        .from('structr_reusable_sections')
        .update({ content: content || {}, color_mode: colorMode || 'light', name: name || existing.id })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    // Create new entry
    const { data, error } = await supabase
      .from('structr_reusable_sections')
      .insert({
        user_id: user.id,
        name: name || `${category} - ${variantId}`,
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
