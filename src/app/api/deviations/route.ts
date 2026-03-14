import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canViewStudy } from "@/lib/access-control";
import { canManageSite } from "@/lib/site-permissions";
import { deviationCreateSchema } from "@/types/schemas";
import type { Deviation } from "@/types/database";

const DEVIATION_COLUMNS =
  "id, study_id, site_id, subject_id, deviation_number, category, description, severity, status, reported_date, resolved_date, root_cause, corrective_action, created_by, created_at, updated_at";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const studyId = request.nextUrl.searchParams.get("study_id");
  if (!studyId) return sendError("study_id query param is required", 400);

  const supabase = await createClient();
  const role = auth.profile?.role;
  const hasViewAccess = await canViewStudy(supabase, studyId, auth.user.id, role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("deviations")
    .select(DEVIATION_COLUMNS)
    .eq("study_id", studyId)
    .order("reported_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return sendError(error.message, 500);
  return sendSuccess<Deviation[]>((data ?? []) as Deviation[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = deviationCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;
  const supabase = await createClient();
  const role = auth.profile?.role;
  const hasManageAccess = await canManageSite(supabase, payload.site_id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("deviations")
    .insert({
      study_id: payload.study_id,
      site_id: payload.site_id,
      subject_id: payload.subject_id || null,
      deviation_number: payload.deviation_number.trim(),
      category: payload.category,
      description: payload.description.trim(),
      severity: payload.severity ?? "minor",
      status: payload.status ?? "open",
      reported_date: payload.reported_date || new Date().toISOString().slice(0, 10),
      resolved_date: payload.resolved_date || null,
      root_cause: payload.root_cause || null,
      corrective_action: payload.corrective_action || null,
      created_by: auth.user.id,
    })
    .select(DEVIATION_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to create deviation", 500);

  await insertAuditLog(supabase, {
    tableName: "deviations",
    recordId: data.id,
    action: "INSERT",
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Deviation>(data as Deviation, 201, { message: "Deviation logged." });
}
