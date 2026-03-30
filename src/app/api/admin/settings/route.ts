import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { STRUCTURE_PROMPT, COPY_PROMPT, SYSTEM_PROMPT } from '@/lib/ai/system-prompt';

const ADMIN_EMAILS = ['odysseas@holy.gd', 'odysseasgp@gmail.com'];

// Default values for each known key
const DEFAULTS: Record<string, string> = {
  system_prompt: SYSTEM_PROMPT,
  structure_prompt: STRUCTURE_PROMPT,
  copy_prompt: COPY_PROMPT,
};

// GET /api/admin/settings?key=structure_prompt
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key') || 'structure_prompt';

    const { data } = await supabase
      .from('structr_admin_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (!data) {
      // Seed with default on first read if we have a default
      const defaultValue = DEFAULTS[key];
      if (defaultValue) {
        await supabase.from('structr_admin_settings').insert({
          key,
          value: defaultValue,
          updated_by: user.id,
        });
        return NextResponse.json({
          key,
          value: defaultValue,
          updated_at: new Date().toISOString(),
          is_default: true,
        });
      }
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    return NextResponse.json({
      key: data.key,
      value: data.value,
      updated_at: data.updated_at,
      is_default: false,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PUT /api/admin/settings — Update a setting
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value } = await request.json();
    if (!key || typeof value !== 'string') {
      return NextResponse.json({ error: 'key and value required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('structr_admin_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      });

    if (error) throw error;

    // Clear the in-memory cache so next AI call uses updated prompt
    const { clearPromptCache } = await import('@/lib/ai/system-prompt');
    clearPromptCache();

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
