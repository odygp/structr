import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseOctopusFile } from '@/lib/import/octopus-parser';

export const maxDuration = 30;

// POST — upload Octopus.do file, create project, return page list
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectName = (formData.get('projectName') as string) || 'Octopus Import';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Read file content
    const buffer = await file.arrayBuffer();
    const isText = ['csv', 'xml', 'txt'].some(ext => file.name.toLowerCase().endsWith(`.${ext}`));
    const content = isText ? new TextDecoder().decode(buffer) : buffer;

    // Parse file
    const pages = parseOctopusFile(content, file.name);
    if (pages.length === 0) {
      return NextResponse.json({ error: 'No pages found in file' }, { status: 400 });
    }

    // Create project
    const { data: project, error: projErr } = await supabase
      .from('structr_projects')
      .insert({
        user_id: user.id,
        name: projectName,
        description: `Imported from Octopus.do (${file.name})`,
      })
      .select()
      .single();

    if (projErr) throw projErr;

    // Return project ID + full page list for background processing
    return NextResponse.json({
      projectId: project.id,
      pages: pages.map((p, i) => ({
        name: p.name,
        level: p.level,
        description: p.description,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        sortOrder: i,
      })),
    });
  } catch (e) {
    console.error('Octopus import error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
