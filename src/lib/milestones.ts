import { createClient } from "@/lib/supabase/server";
import type { Milestone } from "@/types/database";
import type { MilestoneTask } from "@/types/milestone-task";

export const MILESTONE_COLUMNS =
  "id, study_id, name, description, planned_date, actual_date, status, site_id, assignee_user_id, created_by, board_order, created_at, updated_at";

type MilestoneContext = {
  userId: string;
  role: string | null | undefined;
};

type StudySummary = {
  id: string;
  title: string;
  protocol_number: string;
};

type SiteSummary = {
  id: string;
  study_id: string;
  name: string;
  site_number: string;
};

type AssigneeSummary = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
};

export async function enrichMilestones(
  supabase: Awaited<ReturnType<typeof createClient>>,
  milestones: Milestone[],
  context: MilestoneContext
): Promise<MilestoneTask[]> {
  if (milestones.length === 0) return [];

  const studyIds = [...new Set(milestones.map((milestone) => milestone.study_id))];
  const siteIds = [...new Set(milestones.map((milestone) => milestone.site_id).filter(Boolean) as string[])];
  const assigneeIds = [
    ...new Set(milestones.map((milestone) => milestone.assignee_user_id).filter(Boolean) as string[]),
  ];

  const [studiesResult, sitesResult, assigneesResult, managedStudiesResult, managedTeamsResult, membershipsResult] =
    await Promise.all([
      supabase.from("studies").select("id, title, protocol_number").in("id", studyIds),
      siteIds.length
        ? supabase.from("sites").select("id, study_id, name, site_number").in("id", siteIds)
        : Promise.resolve({ data: [] as SiteSummary[] }),
      assigneeIds.length
        ? supabase.from("profiles").select("id, email, full_name, role").in("id", assigneeIds)
        : Promise.resolve({ data: [] as AssigneeSummary[] }),
      context.role === "admin"
        ? Promise.resolve({ data: studyIds.map((id) => ({ id })) })
        : supabase.from("studies").select("id").in("id", studyIds).eq("owner_user_id", context.userId),
      context.role === "admin"
        ? Promise.resolve({ data: [] as Array<{ study_id: string }> })
        : supabase
            .from("study_team")
            .select("study_id")
            .in("study_id", studyIds)
            .eq("user_id", context.userId)
            .in("role", ["owner", "study_manager"]),
      siteIds.length
        ? supabase.from("site_members").select("site_id").eq("user_id", context.userId).in("site_id", siteIds)
        : Promise.resolve({ data: [] as Array<{ site_id: string }> }),
    ]);

  const studiesById = new Map(
    ((studiesResult.data ?? []) as StudySummary[]).map((study) => [study.id, study] as const)
  );
  const sitesById = new Map(((sitesResult.data ?? []) as SiteSummary[]).map((site) => [site.id, site] as const));
  const assigneesById = new Map(
    ((assigneesResult.data ?? []) as AssigneeSummary[]).map((assignee) => [assignee.id, assignee] as const)
  );

  const managedStudyIds = new Set<string>([
    ...((managedStudiesResult.data ?? []) as Array<{ id: string }>).map((row) => row.id),
    ...((managedTeamsResult.data ?? []) as Array<{ study_id: string }>).map((row) => row.study_id),
  ]);
  const memberSiteIds = new Set<string>(((membershipsResult.data ?? []) as Array<{ site_id: string }>).map((m) => m.site_id));

  return milestones.map((milestone) => {
    const canEdit = managedStudyIds.has(milestone.study_id);
    const canComplete =
      canEdit ||
      milestone.assignee_user_id === context.userId ||
      (milestone.site_id ? memberSiteIds.has(milestone.site_id) : false);

    return {
      ...milestone,
      site: milestone.site_id ? sitesById.get(milestone.site_id) ?? null : null,
      assignee: milestone.assignee_user_id ? assigneesById.get(milestone.assignee_user_id) ?? null : null,
      study: studiesById.get(milestone.study_id) ?? null,
      permissions: {
        can_edit: canEdit,
        can_complete: canComplete,
        can_delete: canEdit,
      },
    };
  });
}
