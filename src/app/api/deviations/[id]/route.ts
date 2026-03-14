import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canViewStudy } from "@/lib/access-control";
import { canManageSite } from "@/lib/site-permissions";
import { deviationUpdateSchema } from "@/types/schemas";
import type { Deviation } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const DEVIATION_COLUMNS =
  "id, study_id, site_id, subject_id, deviation_number, category, description, severity, status, reported_date, resolved_date, root_cause, corrective_action, created_by, created_at, updated_at";

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase.from("deviations").select(DEVIATION_COLUMNS).eq("id", id).single();
  if (error || !data) return sendError("Deviation not found", 404);
  const role = auth.profile?.role;
  const hasViewAccess = await canViewStudy(supabase, data.study_id, auth.user.id, role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  return sendSuccess<Deviation>(data as Deviation);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = deviationUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const { id } = await context.params;
  const payload = parsed.data;
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("deviations")
    .select(DEVIATION_COLUMNS)
    .eq("id", id)
    .single();

  if (existingError || !existing) return sendError("Deviation not found", 404);
  const role = auth.profile?.role;
  const hasManageAccess = await canManageSite(supabase, existing.site_id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("deviations")
    .update({
      site_id: payload.site_id,
      subject_id: payload.subject_id,
      category: payload.category,
      description: payload.description,
      severity: payload.severity,
      status: payload.status,
      reported_date: payload.reported_date,
      resolved_date: payload.resolved_date,
      root_cause: payload.root_cause,
      corrective_action: payload.corrective_action,
    })
    .eq("id", id)
    .select(DEVIATION_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to update deviation", 500);

  await insertAuditLog(supabase, {
    tableName: "deviations",
    recordId: id,
    action: "UPDATE",
    oldData: existing as unknown as Record<string, unknown>,
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Deviation>(data as Deviation, 200, { message: "Deviation updated." });
}
