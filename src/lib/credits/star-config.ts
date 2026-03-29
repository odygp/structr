/** Star costs per AI endpoint */
export const STAR_COSTS: Record<string, number> = {
  '/api/ai/generate': 10,
  'ai/edit-section': 1,
  'import/website/page': 5,
  'import/wizard/page': 5,
  'import/octopus/page': 3,
  'ai/generate-from-wizard/page': 5,
  'ai/resolve-comments': 5,
};

/** Star costs per import job type (used by /api/import/process) */
export const STAR_COSTS_BY_JOB_TYPE: Record<string, number> = {
  website: 5,
  wizard: 5,
  octopus: 3,
};

/** Free tier starting balance */
export const INITIAL_FREE_STARS = 50;

/** Get star cost for an action. Falls back to 1 star for unknown endpoints. */
export function getStarCost(endpoint: string, jobType?: string): number {
  if (jobType && STAR_COSTS_BY_JOB_TYPE[jobType] !== undefined) {
    return STAR_COSTS_BY_JOB_TYPE[jobType];
  }
  return STAR_COSTS[endpoint] ?? 1;
}

/** Friendly labels for endpoints */
export const ENDPOINT_LABELS: Record<string, string> = {
  '/api/ai/generate': 'Generate',
  'ai/edit-section': 'Edit Section',
  'import/website/page': 'Website Import',
  'import/octopus/page': 'Octopus Import',
  'ai/generate-from-wizard/page': 'Wizard',
  'import/wizard/page': 'Wizard',
  'import/process': 'Import',
  'ai/resolve-comments': 'AI Resolve Comments',
};
