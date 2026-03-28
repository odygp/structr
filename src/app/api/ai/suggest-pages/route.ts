import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from '@/lib/ai/track-usage';

export const maxDuration = 15;

// POST /api/ai/suggest-pages — Suggest page names based on a prompt (cheap Haiku call)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt } = await request.json();
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: MODELS.generateFromName, // Haiku — cheap and fast
      max_tokens: 256,
      system: 'You suggest website page names. Return ONLY a JSON array of 4-8 page name strings. Common pages: Home, About, Services, Pricing, Contact, Blog, FAQ, Team, Portfolio, Products, Features, Testimonials, Careers, Privacy Policy. Choose pages that fit the described website. Example: ["Home", "About", "Services", "Pricing", "Contact"]',
      messages: [{ role: 'user', content: `Suggest pages for: ${prompt.trim()}` }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    let pages: string[] = [];
    try {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) pages = JSON.parse(match[0]);
    } catch {
      pages = ['Home', 'About', 'Services', 'Contact'];
    }

    return NextResponse.json({ pages });
  } catch (e) {
    console.error('Suggest pages error:', e);
    return NextResponse.json({ pages: ['Home', 'About', 'Services', 'Contact'] });
  }
}
