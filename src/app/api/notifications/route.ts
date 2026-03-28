import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET — list user's notifications
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    let query = supabase
      .from('structr_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) query = query.eq('read', false);

    const { data, error } = await query;
    if (error) throw error;

    const unreadCount = (data || []).filter(n => !n.read).length;

    return NextResponse.json({ notifications: data || [], unreadCount });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PATCH — mark notifications as read
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { ids, markAllRead } = await request.json();

    if (markAllRead) {
      await supabase
        .from('structr_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    } else if (ids?.length) {
      await supabase
        .from('structr_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .in('id', ids);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
