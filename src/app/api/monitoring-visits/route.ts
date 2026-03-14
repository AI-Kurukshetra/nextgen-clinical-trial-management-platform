import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canViewStudy, getAccessibleStudyIds } from "@/lib/access-control";
import { canManageSite } from "@/lib/site-permissions";
import { monitoringVisitCreateSchema } from "@/types/schemas";
import type { MonitoringVisit } from "@/types/database";

const VISIT_COLUMNS =
  "id, study_id, site_id, monitor_id, visit_type, status, planned_date, actual_date, subjects_reviewed, findings_summary, report_due_date, created_at, updated_at";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const studyId = request.nextUrl.searchParams.get("study_id");
  const mine = request.nextUrl.searchParams.get("mine") === "true";

  if (!studyId && !mine) return sendError("study_id query param is required unless mine=true", 400);

  const supabase = await createClient();
  const role = auth.profile?.role;
  let query = supabase.from("monitoring_visits").select(VISIT_COLUMNS).order("planned_date", { ascending: true });

  if (studyId) {
    const hasViewAccess = await canViewStudy(supabase, studyId, auth.user.id, role);
    if (!hasViewAccess) return sendError("Forbidden", 403);
    query = query.eq("study_id", studyId);
  } else if (!mine) {
    const accessibleStudyIds = await getAccessibleStudyIds(supabase, auth.user.id, role);
    if (accessibleStudyIds.length === 0) return sendSuccess<MonitoringVisit[]>([]);
    query = query.in("study_id", accessibleStudyIds);
  }

  if (mine) query = query.eq("monitor_id", auth.user.id);

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);

  return sendSuccess<MonitoringVisit[]>((data ?? []) as MonitoringVisit[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = monitoringVisitCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;
  const supabase = await createClient();
  const role = auth.profile?.role;
  const hasManageAccess = await canManageSite(supabase, payload.site_id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("monitoring_visits")
    .insert({
      study_id: payload.study_id,
      site_id: payload.site_id,
      monitor_id: payload.monitor_id ?? auth.user.id,
      visit_type: payload.visit_type,
      status: "scheduled",
      planned_date: payload.planned_date,
      report_due_date: payload.report_due_date || null,
      findings_summary: payload.findings_summary || null,
      subjects_reviewed: payload.subjects_reviewed ?? 0,
    })
    .select(VISIT_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to schedule monitoring visit", 500);

  await insertAuditLog(supabase, {
    tableName: "monitoring_visits",
    recordId: data.id,
    action: "INSERT",
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<MonitoringVisit>(data as MonitoringVisit, 201, { message: "Monitoring visit scheduled." });
}
