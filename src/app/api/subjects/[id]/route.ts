import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canUpdateSubjectAtSite, isGlobalStudyOperator } from "@/lib/site-permissions";
import { subjectUpdateSchema } from "@/types/schemas";
import type { Subject } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const SUBJECT_COLUMNS =
  "id, study_id, site_id, subject_number, initials, status, screen_date, enrollment_date, completion_date, withdrawal_reason, screen_failure_reason, created_at, updated_at";

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();
  const role = auth.profile?.role;

  const { data, error } = await supabase
    .from("subjects")
    .select(SUBJECT_COLUMNS)
    .eq("id", id)
    .single();

  if (error || !data) return sendError("Subject not found", 404);
  if (!isGlobalStudyOperator(role)) {
    const { data: membership } = await supabase
      .from("site_members")
      .select("id")
      .eq("site_id", data.site_id)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (!membership) return sendError("Forbidden", 403);
  }
  return sendSuccess<Subject>(data as Subject);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = subjectUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const { id } = await context.params;
  const payload = parsed.data;
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("subjects")
    .select(SUBJECT_COLUMNS)
    .eq("id", id)
    .single();

  if (existingError || !existing) return sendError("Subject not found", 404);

  const role = auth.profile?.role;
  const targetSiteId = payload.site_id ?? existing.site_id;
  const canUpdate = await canUpdateSubjectAtSite(supabase, targetSiteId, auth.user.id, role);
  if (!canUpdate) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("subjects")
    .update({
      site_id: payload.site_id,
      subject_number: payload.subject_number?.trim(),
      initials: payload.initials ?? null,
      status: payload.status,
      screen_date: payload.screen_date ?? null,
      enrollment_date: payload.enrollment_date ?? null,
      completion_date: payload.completion_date ?? null,
      withdrawal_reason: payload.withdrawal_reason ?? null,
      screen_failure_reason: payload.screen_failure_reason ?? null,
    })
    .eq("id", id)
    .select(SUBJECT_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to update subject", 500);

  await insertAuditLog(supabase, {
    tableName: "subjects",
    recordId: id,
    action: "UPDATE",
    oldData: existing as unknown as Record<string, unknown>,
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Subject>(data as Subject, 200, { message: "Subject updated." });
}
