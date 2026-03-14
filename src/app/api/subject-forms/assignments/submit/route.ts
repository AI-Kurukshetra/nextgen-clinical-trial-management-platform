import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { subjectFormSubmitSchema } from "@/types/schemas";
import type { SubjectFormSubmission } from "@/types/database";

const SUBMISSION_COLUMNS =
  "id, assignment_id, template_id, study_id, site_id, subject_id, submitted_by, answers, notes, submitted_at";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = subjectFormSubmitSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());
  const payload = parsed.data;

  const supabase = await createClient();
  const { data: assignment, error: assignmentError } = await supabase
    .from("subject_form_assignments")
    .select("id, template_id, study_id, site_id, subject_id, status")
    .eq("id", payload.assignment_id)
    .single();
  if (assignmentError || !assignment) return sendError("Assignment not found", 404);
  if (assignment.status === "cancelled") return sendError("Assignment is cancelled", 400);

  const { data: portalLink } = await supabase
    .from("subject_portal_links")
    .select("id")
    .eq("subject_id", assignment.subject_id)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();

  const { data: siteMembership } = await supabase
    .from("site_members")
    .select("id")
    .eq("site_id", assignment.site_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!portalLink && !siteMembership && auth.profile?.role !== "admin") {
    return sendError("Forbidden", 403);
  }

  const { data, error } = await supabase
    .from("subject_form_submissions")
    .insert({
      assignment_id: assignment.id,
      template_id: assignment.template_id,
      study_id: assignment.study_id,
      site_id: assignment.site_id,
      subject_id: assignment.subject_id,
      submitted_by: auth.user.id,
      answers: payload.answers,
      notes: payload.notes ?? null,
    })
    .select(SUBMISSION_COLUMNS)
    .single();
  if (error || !data) return sendError(error?.message ?? "Failed to submit form", 500);

  await supabase
    .from("subject_form_assignments")
    .update({ status: "submitted" })
    .eq("id", assignment.id)
    .neq("status", "cancelled");

  return sendSuccess<SubjectFormSubmission>(data as SubjectFormSubmission, 201, {
    message: "Form submitted.",
  });
}
