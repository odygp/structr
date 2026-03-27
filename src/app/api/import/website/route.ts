import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { discoverPages, fetchCleanContent } from '@/lib/import/html-analyzer';
import { analyzePageWithAI } from '@/lib/import/ai-analyzer';

export const maxDuration = 120; // 2 minutes max

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await request.json();
    if (!url?.trim()) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const baseUrl = parsedUrl.origin + parsedUrl.pathname;
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    const projectName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1) + ' Import';

    // Step 1: Discover pages (fast — just sitemap + link extraction)
    const discoveredPages = await discoverPages(baseUrl);
    // Limit to 5 pages to stay within timeout
    const pagesToProcess = discoveredPages.slice(0, 5);

    if (pagesToProcess.length === 0) {
      return NextResponse.json({ error: 'Could not discover any pages' }, { status: 400 });
    }

    // Step 2: Fetch content for all pages in parallel (via Jina)
    const pageContents = await Promise.all(
      pagesToProcess.map(async (page) => {
        try {
          const content = await fetchCleanContent(page.url);
          return { ...page, content };
        } catch {
          return { ...page, content: '' };
        }
      })
    );

    // Filter out empty pages
    const validPages = pageContents.filter(p => p.content.length > 100);
    if (validPages.length === 0) {
      return NextResponse.json({
        error: 'Could not extract content from the website. It may be blocking scrapers.',
      }, { status: 400 });
    }

    // Step 3: Create project
    const { data: project, error: pErr } = await supabase
      .from('structr_projects')
      .insert({ user_id: user.id, name: projectName })
      .select()
      .single();

    if (pErr) throw pErr;

    // Step 4: Analyze pages with AI in parallel (batch of 3 max)
    let totalSections = 0;
    const pageResults: { name: string; sectionCount: number }[] = [];

    // Process in batches of 3 to avoid rate limits
    for (let batch = 0; batch < validPages.length; batch += 3) {
      const batchPages = validPages.slice(batch, batch + 3);

      const batchResults = await Promise.all(
        batchPages.map(async (page, batchIdx) => {
          try {
            const sections = await analyzePageWithAI(page.content, page.name);
            if (sections.length === 0) return null;

            const { data: dbPage, error: pgErr } = await supabase
              .from('structr_pages')
              .insert({
                project_id: project.id,
                name: page.name,
                sort_order: batch + batchIdx,
              })
              .select()
              .single();

            if (pgErr || !dbPage) return null;

            const sectionRows = sections.map((s, idx) => ({
              page_id: dbPage.id,
              category: s.category,
              variant_id: s.variantId,
              content: s.content,
              color_mode: s.colorMode || 'light',
              sort_order: idx,
            }));

            await supabase.from('structr_sections').insert(sectionRows);

            return { name: page.name, sectionCount: sections.length };
          } catch (e) {
            console.error(`Error processing ${page.name}:`, e);
            return null;
          }
        })
      );

      for (const result of batchResults) {
        if (result) {
          totalSections += result.sectionCount;
          pageResults.push(result);
        }
      }
    }

    if (totalSections === 0) {
      await supabase.from('structr_projects').delete().eq('id', project.id);
      return NextResponse.json({
        error: 'AI could not map any sections from this website.',
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
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Import error:', msg);
    return NextResponse.json({ error: `Import failed: ${msg}` }, { status: 500 });
  }
}
