import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canCreateSubjectAtSite, isGlobalStudyOperator } from "@/lib/site-permissions";
import { subjectCreateSchema } from "@/types/schemas";
import type { Subject } from "@/types/database";

const SUBJECT_COLUMNS =
  "id, study_id, site_id, subject_number, initials, status, screen_date, enrollment_date, completion_date, withdrawal_reason, screen_failure_reason, created_at, updated_at";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const studyId = request.nextUrl.searchParams.get("study_id");
  const siteId = request.nextUrl.searchParams.get("site_id");

  if (!studyId) return sendError("study_id query param is required", 400);

  const supabase = await createClient();
  const role = auth.profile?.role;
  let query = supabase
    .from("subjects")
    .select(SUBJECT_COLUMNS)
    .eq("study_id", studyId)
    .order("created_at", { ascending: false });

  if (siteId) {
    query = query.eq("site_id", siteId);
  } else if (!isGlobalStudyOperator(role)) {
    const { data: membership } = await supabase
      .from("site_members")
      .select("site_id")
      .eq("user_id", auth.user.id);
    const siteIds = (membership ?? []).map((item) => item.site_id);
    if (siteIds.length === 0) return sendSuccess<Subject[]>([]);
    query = query.in("site_id", siteIds);
  }

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);

  return sendSuccess<Subject[]>((data ?? []) as Subject[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = subjectCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;
  const supabase = await createClient();
  const role = auth.profile?.role;
  const canCreate = await canCreateSubjectAtSite(supabase, payload.site_id, auth.user.id, role);
  if (!canCreate) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      study_id: payload.study_id,
      site_id: payload.site_id,
      subject_number: payload.subject_number.trim(),
      initials: payload.initials || null,
      status: payload.status || "screened",
      screen_date: payload.screen_date || null,
      enrollment_date: payload.enrollment_date || null,
      completion_date: payload.completion_date || null,
      withdrawal_reason: payload.withdrawal_reason || null,
      screen_failure_reason: payload.screen_failure_reason || null,
    })
    .select(SUBJECT_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to create subject", 500);

  await insertAuditLog(supabase, {
    tableName: "subjects",
    recordId: data.id,
    action: "INSERT",
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Subject>(data as Subject, 201, { message: "Subject enrolled." });
}
