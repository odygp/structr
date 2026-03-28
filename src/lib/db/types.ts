// Database row types for Structr tables in Lumen

export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  thumbnail_url: string | null;
  status: 'draft' | 'published' | 'archived';
  is_favorite: boolean;
  tags: string[];
  folder_id: string | null;
  is_template: boolean;
  settings: Record<string, unknown>;
  slug: string | null;
  published_at: string | null;
  published_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProjectMember {
  id: string;
  project_id: string;
  user_id: string | null;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
}

export interface DbProjectActivity {
  id: string;
  project_id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface DbProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  label: string | null;
  snapshot: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer' | null;

export interface DbPage {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface DbSection {
  id: string;
  page_id: string;
  category: string;
  variant_id: string;
  content: Record<string, unknown>;
  color_mode: string;
  sort_order: number;
  created_at: string;
}

// Full project with nested pages and sections
export interface DbProjectFull extends DbProject {
  structr_pages: (DbPage & { structr_sections: DbSection[] })[];
}
