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
    const parseOnly = formData.get('parseOnly') === 'true';
    const selectedPagesRaw = formData.get('selectedPages') as string | null;
    let selectedPages: string[] | null = null;
    try { if (selectedPagesRaw) selectedPages = JSON.parse(selectedPagesRaw); } catch {}

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

    const pageList = pages.map((p, i) => ({
      name: p.name,
      level: p.level,
      description: p.description,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      blocks: p.blocks,
      sortOrder: i,
    }));

    // Parse-only mode: just return the page list without creating a project
    if (parseOnly) {
      return NextResponse.json({ pages: pageList });
    }

    // Create project
    const { data: project, error: projErr } = await supabase
      .from('structr_projects')
      .insert({
        user_id: user.id,
        name: projectName,
      })
      .select()
      .single();

    if (projErr) throw new Error(projErr.message || JSON.stringify(projErr));

    // Insert selected pages into the import queue
    const pagesToImport = selectedPages
      ? pageList.filter(p => selectedPages.includes(p.name))
      : pageList;

    const queueRows = pagesToImport.map((p, i) => ({
      project_id: project.id,
      user_id: user.id,
      job_type: 'octopus',
      page_name: p.name,
      sort_order: i,
      status: 'pending',
      payload: {
        description: p.description,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        blocks: p.blocks,
      },
    }));

    await supabase.from('structr_import_queue').insert(queueRows);

    // Trigger processing immediately (fire-and-forget)
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://structr.holy.black';
    fetch(`${baseUrl}/api/import/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    }).catch(() => {});

    return NextResponse.json({
      projectId: project.id,
      pageCount: queueRows.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : (typeof e === 'object' ? JSON.stringify(e) : String(e));
    console.error('OCTOPUS_IMPORT_ERROR_START');
    console.error(msg);
    console.error('OCTOPUS_IMPORT_ERROR_END');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
