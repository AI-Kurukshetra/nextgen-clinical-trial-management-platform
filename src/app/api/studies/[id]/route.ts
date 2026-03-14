import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canManageStudy, canViewStudy } from "@/lib/access-control";
import { studyUpdateSchema } from "@/types/schemas";
import type { Study } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const STUDY_COLUMNS = "id, protocol_number, title, phase, status, therapeutic_area, sponsor_name, indication, target_enrollment, planned_start_date, planned_end_date, actual_start_date, created_by, owner_user_id, created_at, updated_at";

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();
  const role = auth.profile?.role;

  const hasViewAccess = await canViewStudy(supabase, id, auth.user.id, role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("studies")
    .select(STUDY_COLUMNS)
    .eq("id", id)
    .single();

  if (error || !data) return sendError("Study not found", 404);
  return sendSuccess<Study>(data as Study);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = studyUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const { id } = await context.params;
  const supabase = await createClient();
  const role = auth.profile?.role;

  const hasManageAccess = await canManageStudy(supabase, id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data: existing, error: existingError } = await supabase
    .from("studies")
    .select(STUDY_COLUMNS)
    .eq("id", id)
    .single();
  if (existingError || !existing) return sendError("Study not found", 404);

  const payload = parsed.data;
  const nextProtocolNumber =
    payload.protocol_number === undefined ? undefined : payload.protocol_number?.trim() || undefined;
  const { data, error } = await supabase
    .from("studies")
    .update({
      protocol_number: nextProtocolNumber,
      title: payload.title?.trim(),
      phase: payload.phase,
      status: payload.status,
      therapeutic_area: payload.therapeutic_area ?? null,
      sponsor_name: payload.sponsor_name ?? null,
      indication: payload.indication ?? null,
      target_enrollment: payload.target_enrollment ?? null,
      planned_start_date: payload.planned_start_date ?? null,
      planned_end_date: payload.planned_end_date ?? null,
      actual_start_date: payload.actual_start_date ?? null,
    })
    .eq("id", id)
    .select(STUDY_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to update study", 500);

  await insertAuditLog(supabase, {
    tableName: "studies",
    recordId: id,
    action: "UPDATE",
    oldData: existing as unknown as Record<string, unknown>,
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Study>(data as Study, 200, { message: "Study updated." });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();
  const role = auth.profile?.role;

  const hasManageAccess = await canManageStudy(supabase, id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data: existing, error: existingError } = await supabase
    .from("studies")
    .select(STUDY_COLUMNS)
    .eq("id", id)
    .single();
  if (existingError || !existing) return sendError("Study not found", 404);

  const { error } = await supabase.from("studies").delete().eq("id", id);
  if (error) return sendError(error.message, 500);

  await insertAuditLog(supabase, {
    tableName: "studies",
    recordId: id,
    action: "DELETE",
    oldData: existing as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<null>(null, 200, { message: "Study deleted." });
}
