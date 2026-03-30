import { createClient } from '@/lib/supabase/server';
import type { DbProject, DbProjectFull } from './types';

export async function getProjects(): Promise<DbProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('structr_projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProject(id: string): Promise<DbProjectFull | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('structr_projects')
    .select(`
      *,
      structr_pages (
        *,
        structr_sections (*)
      )
    `)
    .eq('id', id)
    .order('sort_order', { referencedTable: 'structr_pages', ascending: true })
    .order('sort_order', { referencedTable: 'structr_pages.structr_sections', ascending: true })
    .single();

  if (error) return null;
  return data as DbProjectFull;
}

export async function createProject(userId: string, name: string = 'Untitled Project'): Promise<DbProject> {
  const supabase = await createClient();

  // Create project
  const { data: project, error: pErr } = await supabase
    .from('structr_projects')
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (pErr) throw pErr;

  // Create default "Home" page
  const { error: pgErr } = await supabase
    .from('structr_pages')
    .insert({ project_id: project.id, name: 'Home', sort_order: 0 });

  if (pgErr) throw pgErr;

  return project;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('structr_projects').delete().eq('id', id);
  if (error) throw error;
}

export async function updateProject(id: string, data: Partial<Pick<DbProject, 'name' | 'thumbnail_url' | 'status' | 'is_favorite' | 'tags' | 'folder_id' | 'is_template'>>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('structr_projects').update(data).eq('id', id);
  if (error) throw error;
}

// Save full project data (pages + sections) — upsert approach
export async function saveProjectData(
  projectId: string,
  pages: { id?: string; name: string; sort_order: number; sections: {
    id?: string; category: string; variant_id: string; content: Record<string, unknown>;
    color_mode: string; sort_order: number; reusable_source_id?: string;
  }[] }[]
): Promise<void> {
  const supabase = await createClient();

  // Delete existing pages (cascades to sections)
  await supabase.from('structr_pages').delete().eq('project_id', projectId);

  // Insert new pages and sections
  for (const page of pages) {
    const { data: newPage, error: pgErr } = await supabase
      .from('structr_pages')
      .insert({
        project_id: projectId,
        name: page.name,
        sort_order: page.sort_order,
      })
      .select()
      .single();

    if (pgErr || !newPage) continue;

    if (page.sections.length > 0) {
      const sectionRows = page.sections.map((s, i) => ({
        page_id: newPage.id,
        category: s.category,
        variant_id: s.variant_id,
        content: s.content,
        color_mode: s.color_mode,
        sort_order: s.sort_order ?? i,
        reusable_source_id: s.reusable_source_id || null,
      }));

      await supabase.from('structr_sections').insert(sectionRows);
    }
  }

  // Touch updated_at
  await supabase.from('structr_projects').update({ updated_at: new Date().toISOString() }).eq('id', projectId);
}
