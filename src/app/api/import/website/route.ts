import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { discoverPages, fetchCleanContent } from '@/lib/import/html-analyzer';
import { analyzePageWithAI } from '@/lib/import/ai-analyzer';

export const maxDuration = 60; // Allow up to 60s for multi-page import

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await request.json();
    if (!url?.trim()) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const baseUrl = parsedUrl.origin + parsedUrl.pathname;
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    const projectName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1) + ' Import';

    // Step 1: Discover all pages
    const discoveredPages = await discoverPages(baseUrl);
    if (discoveredPages.length === 0) {
      return NextResponse.json({ error: 'Could not discover any pages on this website' }, { status: 400 });
    }

    // Step 2: Create project in Supabase
    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: projectName })
      .select()
      .single();

    if (pErr) throw pErr;

    // Step 3: Process each page (fetch content → AI analysis → save)
    let totalSections = 0;
    const pageResults: { name: string; sectionCount: number }[] = [];

    // Process pages sequentially to respect API rate limits
    for (let i = 0; i < discoveredPages.length; i++) {
      const page = discoveredPages[i];

      try {
        // Fetch clean content via Jina Reader
        const content = await fetchCleanContent(page.url);
        if (!content || content.length < 50) {
          console.log(`Skipping ${page.url}: too little content`);
          continue;
        }

        // AI analysis: convert content to wireframe sections
        const sections = await analyzePageWithAI(content, page.name);
        if (sections.length === 0) continue;

        // Create page in Supabase
        const { data: dbPage, error: pgErr } = await supabase
          .from('structr_pages')
          .insert({
            project_id: project.id,
            name: page.name,
            sort_order: i,
          })
          .select()
          .single();

        if (pgErr || !dbPage) {
          console.error(`Failed to create page ${page.name}:`, pgErr);
          continue;
        }

        // Create sections in Supabase
        const sectionRows = sections.map((s, idx) => ({
          page_id: dbPage.id,
          category: s.category,
          variant_id: s.variantId,
          content: s.content,
          color_mode: s.colorMode || 'light',
          sort_order: idx,
        }));

        const { error: secErr } = await supabase
          .from('structr_sections')
          .insert(sectionRows);

        if (secErr) {
          console.error(`Failed to create sections for ${page.name}:`, secErr);
          continue;
        }

        totalSections += sections.length;
        pageResults.push({ name: page.name, sectionCount: sections.length });
      } catch (e) {
        console.error(`Error processing page ${page.url}:`, e);
        // Continue with other pages even if one fails
      }
    }

    if (totalSections === 0) {
      // Clean up empty project
      await supabase.from('structr_projects').delete().eq('id', project.id);
      return NextResponse.json({
        error: 'Could not extract any sections from the website. The site may be blocking scrapers or using heavy client-side rendering.',
      }, { status: 400 });
    }

    return NextResponse.json({
      projectId: project.id,
      projectName,
      pageCount: pageResults.length,
      totalSections,
      pages: pageResults,
    });
  } catch (e) {
    console.error('Import error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
