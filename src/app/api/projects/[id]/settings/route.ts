import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET — get project settings
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase
      .from('structr_projects')
      .select('settings')
      .eq('id', id)
      .single();

    return NextResponse.json(data?.settings || {});
  } catch {
    return NextResponse.json({});
  }
}

// PATCH — update project settings (merge)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const updates = await request.json();

    // Get current settings
    const { data: project } = await supabase
      .from('structr_projects')
      .select('settings')
      .eq('id', id)
      .single();

    const currentSettings = project?.settings || {};
    const newSettings = { ...currentSettings, ...updates };

    const { error } = await supabase
      .from('structr_projects')
      .update({ settings: newSettings })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json(newSettings);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
