// Database row types for Structr tables in Lumen

export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

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
