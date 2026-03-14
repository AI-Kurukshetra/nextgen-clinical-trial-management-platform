import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canViewStudy } from "@/lib/access-control";
import { canManageSite } from "@/lib/site-permissions";
import { monitoringVisitUpdateSchema } from "@/types/schemas";
import type { MonitoringVisit } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const VISIT_COLUMNS =
  "id, study_id, site_id, monitor_id, visit_type, status, planned_date, actual_date, subjects_reviewed, findings_summary, report_due_date, created_at, updated_at";

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("monitoring_visits")
    .select(VISIT_COLUMNS)
    .eq("id", id)
    .single();

  if (error || !data) return sendError("Monitoring visit not found", 404);
  const role = auth.profile?.role;
  const hasViewAccess = await canViewStudy(supabase, data.study_id, auth.user.id, role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  return sendSuccess<MonitoringVisit>(data as MonitoringVisit);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = monitoringVisitUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const { id } = await context.params;
  const payload = parsed.data;
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("monitoring_visits")
    .select(VISIT_COLUMNS)
    .eq("id", id)
    .single();

  if (existingError || !existing) return sendError("Monitoring visit not found", 404);
  const role = auth.profile?.role;
  const hasManageAccess = await canManageSite(supabase, existing.site_id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("monitoring_visits")
    .update({
      site_id: payload.site_id,
      monitor_id: payload.monitor_id,
      visit_type: payload.visit_type,
      status: payload.status,
      planned_date: payload.planned_date,
      actual_date: payload.actual_date,
      report_due_date: payload.report_due_date,
      findings_summary: payload.findings_summary,
      subjects_reviewed: payload.subjects_reviewed,
    })
    .eq("id", id)
    .select(VISIT_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to update monitoring visit", 500);

  await insertAuditLog(supabase, {
    tableName: "monitoring_visits",
    recordId: id,
    action: "UPDATE",
    oldData: existing as unknown as Record<string, unknown>,
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<MonitoringVisit>(data as MonitoringVisit, 200, { message: "Monitoring visit updated." });
}
