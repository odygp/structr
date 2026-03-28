import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET — get user preferences
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabase
      .from('structr_user_preferences')
      .select('preferences')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json(data?.preferences || {});
  } catch {
    return NextResponse.json({});
  }
}

// PUT — update user preferences (full replace)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const preferences = await request.json();

    const { error } = await supabase
      .from('structr_user_preferences')
      .upsert({
        user_id: user.id,
        preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return NextResponse.json(preferences);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
