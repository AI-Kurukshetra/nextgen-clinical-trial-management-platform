import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canManageStudy, canViewStudy } from "@/lib/access-control";
import { canViewSite } from "@/lib/site-permissions";
import { milestoneUpdateSchema } from "@/types/schemas";
import { enrichMilestones, MILESTONE_COLUMNS } from "@/lib/milestones";
import type { Milestone } from "@/types/database";
import type { MilestoneTask } from "@/types/milestone-task";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();
  const role = auth.profile?.role;

  const { data, error } = await supabase.from("milestones").select(MILESTONE_COLUMNS).eq("id", id).single();
  if (error || !data) return sendError("Milestone not found", 404);
  const hasViewAccess = await canViewStudy(supabase, data.study_id, auth.user.id, role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  const enriched = await enrichMilestones(supabase, [data as Milestone], {
    userId: auth.user.id,
    role,
  });
  const milestone = enriched[0];
  if (!milestone) return sendError("Milestone not found", 404);
  return sendSuccess<MilestoneTask>(milestone);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = milestoneUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const { id } = await context.params;
  const payload = parsed.data;
  const supabase = await createClient();
  const role = auth.profile?.role;

  const { data: existing, error: existingError } = await supabase
    .from("milestones")
    .select(MILESTONE_COLUMNS)
    .eq("id", id)
    .single();

  if (existingError || !existing) return sendError("Milestone not found", 404);

  const hasViewAccess = await canViewStudy(supabase, existing.study_id, auth.user.id, role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  const hasManageAccess = await canManageStudy(supabase, existing.study_id, auth.user.id, role);
  const hasSiteAccess = existing.site_id
    ? await canViewSite(supabase, existing.site_id, auth.user.id, role)
    : false;
  const canComplete = hasManageAccess || existing.assignee_user_id === auth.user.id || hasSiteAccess;

  if (!canComplete) return sendError("Forbidden", 403);

  const isLimitedAssignee = !hasManageAccess;
  if (isLimitedAssignee) {
    const hasRestrictedFields =
      payload.name !== undefined ||
      payload.description !== undefined ||
      payload.planned_date !== undefined ||
      payload.site_id !== undefined ||
      payload.assignee_user_id !== undefined ||
      payload.board_order !== undefined;

    if (hasRestrictedFields) {
      return sendError("Assignees can only update completion fields", 403);
    }
    if (payload.status && !["completed", "missed"].includes(payload.status)) {
      return sendError("Assignees can only mark completed or missed", 403);
    }
  }

  if (hasManageAccess && payload.site_id) {
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, study_id")
      .eq("id", payload.site_id)
      .single();
    if (siteError || !site) return sendError("Assigned clinic not found", 404);
    if (site.study_id !== existing.study_id) return sendError("Assigned clinic must belong to this study", 400);
  }

  if (hasManageAccess && payload.assignee_user_id) {
    const { data: assignee, error: assigneeError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", payload.assignee_user_id)
      .single();
    if (assigneeError || !assignee) return sendError("Assignee user not found", 404);
  }

  if (hasManageAccess) {
    const nextSiteId = payload.site_id !== undefined ? payload.site_id : existing.site_id;
    const nextAssigneeId = payload.assignee_user_id !== undefined ? payload.assignee_user_id : existing.assignee_user_id;
    if (nextSiteId && nextAssigneeId) {
      const { data: membership, error: membershipError } = await supabase
        .from("site_members")
        .select("id")
        .eq("site_id", nextSiteId)
        .eq("user_id", nextAssigneeId)
        .maybeSingle();
      if (membershipError) return sendError(membershipError.message, 500);
      if (!membership) return sendError("Assigned user must be a member of the selected clinic", 400);
    }
  }

  const updates: Partial<Milestone> = {};
  if (hasManageAccess) {
    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.description !== undefined) updates.description = payload.description || null;
    if (payload.planned_date !== undefined) updates.planned_date = payload.planned_date || null;
    if (payload.actual_date !== undefined) updates.actual_date = payload.actual_date || null;
    if (payload.status !== undefined) updates.status = payload.status;
    if (payload.site_id !== undefined) updates.site_id = payload.site_id || null;
    if (payload.assignee_user_id !== undefined) updates.assignee_user_id = payload.assignee_user_id || null;
    if (payload.board_order !== undefined) updates.board_order = payload.board_order;

    if (payload.status && payload.status !== existing.status && payload.board_order === undefined) {
      const { data: last } = await supabase
        .from("milestones")
        .select("board_order")
        .eq("study_id", existing.study_id)
        .eq("status", payload.status)
        .order("board_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      updates.board_order = (last?.board_order ?? -1) + 1;
    }
  } else {
    updates.status = payload.status ?? "completed";
    updates.actual_date = payload.actual_date ?? new Date().toISOString().slice(0, 10);
  }

  if (Object.keys(updates).length === 0) {
    return sendError("No milestone fields provided to update", 400);
  }

  const { data, error } = await supabase
    .from("milestones")
    .update(updates)
    .eq("id", id)
    .select(MILESTONE_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to update milestone", 500);

  await insertAuditLog(supabase, {
    tableName: "milestones",
    recordId: id,
    action: "UPDATE",
    oldData: existing as unknown as Record<string, unknown>,
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  const enriched = await enrichMilestones(supabase, [data as Milestone], {
    userId: auth.user.id,
    role,
  });
  const updated = enriched[0];
  if (!updated) return sendError("Failed to resolve updated milestone task", 500);
  return sendSuccess<MilestoneTask>(updated, 200, { message: "Milestone task updated." });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();
  const role = auth.profile?.role;

  const { data: existing, error: existingError } = await supabase
    .from("milestones")
    .select(MILESTONE_COLUMNS)
    .eq("id", id)
    .single();

  if (existingError || !existing) return sendError("Milestone not found", 404);

  const hasManageAccess = await canManageStudy(supabase, existing.study_id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) return sendError(error.message, 500);

  await insertAuditLog(supabase, {
    tableName: "milestones",
    recordId: id,
    action: "DELETE",
    oldData: existing as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<null>(null, 200, { message: "Milestone task deleted." });
}
