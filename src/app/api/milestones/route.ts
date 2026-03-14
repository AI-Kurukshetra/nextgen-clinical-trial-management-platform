import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canManageStudy, canViewStudy } from "@/lib/access-control";
import { milestoneCreateSchema } from "@/types/schemas";
import { enrichMilestones, MILESTONE_COLUMNS } from "@/lib/milestones";
import type { Milestone } from "@/types/database";
import type { MilestoneTask } from "@/types/milestone-task";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const studyId = request.nextUrl.searchParams.get("study_id");
  const mine = request.nextUrl.searchParams.get("mine") === "true";
  if (!studyId && !mine) return sendError("study_id query param is required unless mine=true", 400);

  const supabase = await createClient();
  const role = auth.profile?.role;

  if (studyId) {
    const hasViewAccess = await canViewStudy(supabase, studyId, auth.user.id, role);
    if (!hasViewAccess) return sendError("Forbidden", 403);
  }

  let rows: Milestone[] = [];

  if (mine) {
    const [directResult, membershipResult] = await Promise.all([
      studyId
        ? supabase
            .from("milestones")
            .select(MILESTONE_COLUMNS)
            .eq("assignee_user_id", auth.user.id)
            .eq("study_id", studyId)
            .order("updated_at", { ascending: false })
        : supabase
            .from("milestones")
            .select(MILESTONE_COLUMNS)
            .eq("assignee_user_id", auth.user.id)
            .order("updated_at", { ascending: false }),
      supabase.from("site_members").select("site_id").eq("user_id", auth.user.id),
    ]);
    if (directResult.error) return sendError(directResult.error.message, 500);
    if (membershipResult.error) return sendError(membershipResult.error.message, 500);

    const siteIds = (membershipResult.data ?? []).map((membership) => membership.site_id);
    const siteResult = siteIds.length
      ? studyId
        ? await supabase
            .from("milestones")
            .select(MILESTONE_COLUMNS)
            .in("site_id", siteIds)
            .eq("study_id", studyId)
            .order("updated_at", { ascending: false })
        : await supabase
            .from("milestones")
            .select(MILESTONE_COLUMNS)
            .in("site_id", siteIds)
            .order("updated_at", { ascending: false })
      : null;
    if (siteResult?.error) return sendError(siteResult.error.message, 500);

    const byId = new Map<string, Milestone>();
    for (const row of (directResult.data ?? []) as Milestone[]) byId.set(row.id, row);
    for (const row of ((siteResult?.data ?? []) as Milestone[])) byId.set(row.id, row);
    rows = Array.from(byId.values());
  } else {
    const { data, error } = await supabase
      .from("milestones")
      .select(MILESTONE_COLUMNS)
      .eq("study_id", studyId as string)
      .order("board_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return sendError(error.message, 500);
    rows = (data ?? []) as Milestone[];
  }

  const enriched = await enrichMilestones(supabase, rows, {
    userId: auth.user.id,
    role,
  });

  return sendSuccess<MilestoneTask[]>(enriched);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = milestoneCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;
  const supabase = await createClient();
  const role = auth.profile?.role;
  const hasManageAccess = await canManageStudy(supabase, payload.study_id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  if (payload.site_id) {
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, study_id")
      .eq("id", payload.site_id)
      .single();
    if (siteError || !site) return sendError("Assigned clinic not found", 404);
    if (site.study_id !== payload.study_id) return sendError("Assigned clinic must belong to the same study", 400);
  }

  if (payload.assignee_user_id) {
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", payload.assignee_user_id)
      .single();
    if (userError || !user) return sendError("Assignee user not found", 404);
  }

  if (payload.site_id && payload.assignee_user_id) {
    const { data: membership, error: membershipError } = await supabase
      .from("site_members")
      .select("id")
      .eq("site_id", payload.site_id)
      .eq("user_id", payload.assignee_user_id)
      .maybeSingle();
    if (membershipError) return sendError(membershipError.message, 500);
    if (!membership) return sendError("Assigned user must be a member of the selected clinic", 400);
  }

  const status = payload.status ?? "pending";
  const resolvedBoardOrder =
    payload.board_order ??
    ((
      await supabase
        .from("milestones")
        .select("board_order")
        .eq("study_id", payload.study_id)
        .eq("status", status)
        .order("board_order", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).data?.board_order ?? -1) +
      1;

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      study_id: payload.study_id,
      name: payload.name,
      description: payload.description || null,
      planned_date: payload.planned_date || null,
      actual_date: payload.actual_date || null,
      status,
      site_id: payload.site_id || null,
      assignee_user_id: payload.assignee_user_id || null,
      board_order: resolvedBoardOrder,
      created_by: auth.user.id,
    })
    .select(MILESTONE_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to create milestone", 500);

  await insertAuditLog(supabase, {
    tableName: "milestones",
    recordId: data.id,
    action: "INSERT",
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  const enriched = await enrichMilestones(supabase, [data as Milestone], {
    userId: auth.user.id,
    role,
  });
  const created = enriched[0];
  if (!created) return sendError("Failed to resolve created milestone task", 500);
  return sendSuccess<MilestoneTask>(created, 201, { message: "Milestone task created." });
}
