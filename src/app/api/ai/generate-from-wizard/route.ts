import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type WizardData } from '@/lib/templates';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wizardData: WizardData = await request.json();
    if (!wizardData.description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    // Save custom category request if "other" was selected
    if (wizardData.category === 'other' && wizardData.customCategory) {
      supabase.from('structr_component_requests').insert({
        suggested_category: wizardData.customCategory,
        suggested_variant_name: 'Custom Category Request',
        description: `User requested category "${wizardData.customCategory}" for: ${wizardData.description}`,
        source_url: null,
        source_page_name: null,
        extracted_content: { wizardData },
        preview_html: null,
        status: 'pending',
      }).then(undefined, console.error);
    }

    // Create project immediately (no AI call yet)
    const projectName = wizardData.businessName || wizardData.description.slice(0, 40);

    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: projectName })
      .select()
      .single();

    if (pErr) throw pErr;

    // Create the first page (Home) with an empty placeholder
    const { data: firstPage } = await supabase
      .from('structr_pages')
      .insert({ project_id: project.id, name: wizardData.pages[0] || 'Home', sort_order: 0 })
      .select()
      .single();

    if (firstPage) {
      // Add a loading placeholder section
      await supabase.from('structr_sections').insert({
        page_id: firstPage.id,
        category: 'hero',
        variant_id: 'hero-centered',
        content: {
          title: 'Generating your wireframe...',
          subtitle: 'AI is creating customized content for your project. This page will update shortly.',
        },
        color_mode: 'light',
        sort_order: 0,
      });
    }

    // Return immediately — pages will be generated in background via the per-page endpoint
    return NextResponse.json({
      projectId: project.id,
      projectName,
      pages: wizardData.pages.map((name, i) => ({
        name,
        sortOrder: i,
      })),
      wizardData, // Pass back so frontend can use it for per-page generation
    });
  } catch (e) {
    console.error('Wizard setup error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
