import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProject } from '@/lib/db/projects';
import { trackUsage, MODELS } from '@/lib/ai/track-usage';
import { logActivity } from '@/lib/db/activity';
import { calculateResolveCost } from '@/lib/credits/star-config';
import { hasEnoughStars, debitStars } from '@/lib/db/credits';

export const maxDuration = 30;

interface PlanAction {
  type: 'edit_content' | 'reorder' | 'add_section' | 'remove_section' | 'add_page';
  pageIndex: number;
  sectionIndex?: number;
  description: string;
  changes?: Record<string, unknown>;
  category?: string;
  variantId?: string;
  content?: Record<string, unknown>;
  afterIndex?: number;
  fromIndex?: number;
  toIndex?: number;
  resolvesComments: string[];
}

// POST /api/ai/apply-plan — Execute the approved plan
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, plan, mode, _usage } = await request.json() as {
      projectId: string;
      plan: PlanAction[];
      mode: 'current' | 'new_version';
      _usage?: { inputTokens: number; outputTokens: number };
    };

    if (!projectId || !plan?.length) {
      return NextResponse.json({ error: 'projectId and plan required' }, { status: 400 });
    }

    // Calculate and check star cost
    const starCost = calculateResolveCost(plan);
    if (starCost > 0) {
      const starCheck = await hasEnoughStars(user.id, starCost);
      if (!starCheck.ok) {
        return NextResponse.json({ error: 'Insufficient stars', balance: starCheck.balance, required: starCost }, { status: 402 });
      }
    }

    // Fetch full project
    const project = await getProject(projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Create a snapshot BEFORE applying (for safety / "before" version)
    const { data: lastVersion } = await supabase
      .from('structr_project_versions')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (lastVersion?.version_number || 0) + 1;

    const snapshotData = {
      name: project.name,
      pages: project.structr_pages.map(p => ({
        name: p.name,
        sort_order: p.sort_order,
        sections: (p.structr_sections || []).map(s => ({
          category: s.category,
          variant_id: s.variant_id,
          content: s.content,
          color_mode: s.color_mode,
          sort_order: s.sort_order,
        })),
      })),
    };

    // Save "before" snapshot
    await supabase.from('structr_project_versions').insert({
      project_id: projectId,
      version_number: nextVersion,
      label: mode === 'new_version' ? `Before AI feedback — v${nextVersion}` : `Safety snapshot — v${nextVersion}`,
      snapshot: snapshotData,
      created_by: user.id,
    });

    // Apply each action
    const allCommentIds: string[] = [];
    let actionsApplied = 0;

    for (const action of plan) {
      const page = project.structr_pages[action.pageIndex];
      if (!page) continue;

      const sections = page.structr_sections || [];

      try {
        if (action.type === 'edit_content' && action.sectionIndex !== undefined && action.changes) {
          const section = sections[action.sectionIndex];
          if (section) {
            const updatedContent = { ...section.content, ...action.changes };
            await supabase
              .from('structr_sections')
              .update({ content: updatedContent })
              .eq('id', section.id);
            actionsApplied++;
          }
        }

        else if (action.type === 'add_section' && action.category && action.variantId) {
          const insertAfter = action.afterIndex ?? sections.length - 1;
          // Shift sort_orders of sections after the insertion point
          for (let i = sections.length - 1; i > insertAfter; i--) {
            await supabase
              .from('structr_sections')
              .update({ sort_order: i + 1 })
              .eq('id', sections[i].id);
          }
          // Insert new section
          await supabase.from('structr_sections').insert({
            page_id: page.id,
            category: action.category,
            variant_id: action.variantId,
            content: action.content || {},
            color_mode: 'light',
            sort_order: insertAfter + 1,
          });
          actionsApplied++;
        }

        else if (action.type === 'remove_section' && action.sectionIndex !== undefined) {
          const section = sections[action.sectionIndex];
          if (section) {
            await supabase.from('structr_sections').delete().eq('id', section.id);
            actionsApplied++;
          }
        }

        else if (action.type === 'reorder' && action.fromIndex !== undefined && action.toIndex !== undefined) {
          // Swap sort_orders
          const fromSection = sections[action.fromIndex];
          const toSection = sections[action.toIndex];
          if (fromSection && toSection) {
            await supabase.from('structr_sections').update({ sort_order: action.toIndex }).eq('id', fromSection.id);
            await supabase.from('structr_sections').update({ sort_order: action.fromIndex }).eq('id', toSection.id);
            actionsApplied++;
          }
        }

        // Collect comment IDs to resolve
        if (action.resolvesComments) {
          allCommentIds.push(...action.resolvesComments);
        }
      } catch (e) {
        console.error(`Failed to apply action: ${action.type}`, e);
      }
    }

    // Mark comments as resolved
    if (allCommentIds.length > 0) {
      await supabase
        .from('structr_comments')
        .update({ resolved: true })
        .in('id', allCommentIds);
    }

    // If new_version mode, create an "after" snapshot
    if (mode === 'new_version') {
      const updatedProject = await getProject(projectId);
      if (updatedProject) {
        const afterSnapshot = {
          name: updatedProject.name,
          pages: updatedProject.structr_pages.map(p => ({
            name: p.name,
            sort_order: p.sort_order,
            sections: (p.structr_sections || []).map(s => ({
              category: s.category,
              variant_id: s.variant_id,
              content: s.content,
              color_mode: s.color_mode,
              sort_order: s.sort_order,
            })),
          })),
        };

        await supabase.from('structr_project_versions').insert({
          project_id: projectId,
          version_number: nextVersion + 1,
          label: `AI feedback applied — v${nextVersion + 1}`,
          snapshot: afterSnapshot,
          created_by: user.id,
        });
      }
    }

    // Track AI usage (debit stars)
    // Track AI usage (for analytics) — stars deducted separately
    await trackUsage({
      userId: user.id,
      projectId,
      endpoint: 'ai/resolve-comments',
      model: MODELS.generate,
      inputTokens: _usage?.inputTokens || 0,
      outputTokens: _usage?.outputTokens || 0,
    });

    // Debit dynamic star cost based on action types
    if (starCost > 0) {
      await debitStars(user.id, starCost, `AI resolve: ${actionsApplied} changes (${starCost} stars)`);
    }

    await logActivity(projectId, user.id, 'ai_resolved_comments', {
      actionsApplied,
      commentsResolved: allCommentIds.length,
      mode,
    });

    return NextResponse.json({
      success: true,
      actionsApplied,
      commentsResolved: allCommentIds.length,
      mode,
      version: mode === 'new_version' ? nextVersion + 1 : undefined,
    });
  } catch (e) {
    console.error('Apply plan error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
