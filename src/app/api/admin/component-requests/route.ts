import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['odysseas@holy.gd', 'odysseasgp@gmail.com'];

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) return null;
  return { supabase, user };
}

// GET — list all component requests
export async function GET(request: Request) {
  const auth = await checkAdmin();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  const { data, error } = await auth.supabase
    .from('structr_component_requests')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json(data || []);
}

// PATCH — update status (approve/reject)
export async function PATCH(request: Request) {
  const auth = await checkAdmin();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status, admin_notes } = await request.json();
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

  const { error } = await auth.supabase
    .from('structr_component_requests')
    .update({ status, admin_notes, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json({ success: true });
}
