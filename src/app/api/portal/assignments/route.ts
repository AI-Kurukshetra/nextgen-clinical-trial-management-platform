import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";

const ASSIGNMENT_COLUMNS =
  "id, template_id, study_id, site_id, subject_id, recurrence, due_at, status, assigned_by, created_at";
const TEMPLATE_COLUMNS =
  "id, study_id, site_id, name, description, schema, is_active, created_by, created_at, updated_at";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const supabase = await createClient();
  const { data: link, error: linkError } = await supabase
    .from("subject_portal_links")
    .select("subject_id")
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (linkError) return sendError(linkError.message, 500);
  if (!link) return sendSuccess([]);

  const { data: assignments, error: assignmentError } = await supabase
    .from("subject_form_assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("subject_id", link.subject_id)
    .in("status", ["assigned", "overdue", "submitted"])
    .order("created_at", { ascending: false });
  if (assignmentError) return sendError(assignmentError.message, 500);

  const templateIds = (assignments ?? []).map((item) => item.template_id);
  const { data: templates } = templateIds.length
    ? await supabase
        .from("subject_form_templates")
        .select(TEMPLATE_COLUMNS)
        .in("id", templateIds)
    : { data: [] };

  const templateById = new Map((templates ?? []).map((template) => [template.id, template]));
  const enriched = (assignments ?? []).map((assignment) => ({
    ...assignment,
    template: templateById.get(assignment.template_id) ?? null,
  }));

  return sendSuccess(enriched);
}
