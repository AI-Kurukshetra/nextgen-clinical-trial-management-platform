import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { canManageStudy, canViewStudy } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { subjectFormAssignmentCreateSchema } from "@/types/schemas";
import type { SubjectFormAssignment } from "@/types/database";

const ASSIGNMENT_COLUMNS =
  "id, template_id, study_id, site_id, subject_id, recurrence, due_at, status, assigned_by, created_at";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const studyId = request.nextUrl.searchParams.get("study_id");
  const siteId = request.nextUrl.searchParams.get("site_id");
  const subjectId = request.nextUrl.searchParams.get("subject_id");
  if (!studyId) return sendError("study_id query param is required", 400);

  const supabase = await createClient();
  const hasViewAccess = await canViewStudy(supabase, studyId, auth.user.id, auth.profile?.role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  let query = supabase
    .from("subject_form_assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("study_id", studyId)
    .order("created_at", { ascending: false });
  if (siteId) query = query.eq("site_id", siteId);
  if (subjectId) query = query.eq("subject_id", subjectId);

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);
  return sendSuccess<SubjectFormAssignment[]>((data ?? []) as SubjectFormAssignment[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = subjectFormAssignmentCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());
  const payload = parsed.data;

  const supabase = await createClient();
  const hasManageAccess = await canManageStudy(supabase, payload.study_id, auth.user.id, auth.profile?.role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, study_id, site_id")
    .eq("id", payload.subject_id)
    .single();
  if (subjectError || !subject) return sendError("Subject not found", 404);
  if (subject.study_id !== payload.study_id || subject.site_id !== payload.site_id) {
    return sendError("Subject/study/site mismatch", 400);
  }

  const { data, error } = await supabase
    .from("subject_form_assignments")
    .insert({
      template_id: payload.template_id,
      study_id: payload.study_id,
      site_id: payload.site_id,
      subject_id: payload.subject_id,
      recurrence: payload.recurrence,
      due_at: payload.due_at ?? null,
      status: "assigned",
      assigned_by: auth.user.id,
    })
    .select(ASSIGNMENT_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to assign form", 500);
  return sendSuccess<SubjectFormAssignment>(data as SubjectFormAssignment, 201, {
    message: "Form assigned to subject.",
  });
}
