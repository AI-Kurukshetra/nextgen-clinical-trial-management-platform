import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { canAssignSubjectAtSite } from "@/lib/site-permissions";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: assignment, error: assignmentError } = await supabase
    .from("subject_assignments")
    .select("id, subject_id")
    .eq("id", id)
    .single();

  if (assignmentError || !assignment) return sendError("Assignment not found", 404);

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, site_id")
    .eq("id", assignment.subject_id)
    .single();

  if (!subject) return sendError("Subject not found", 404);

  const canAssign = await canAssignSubjectAtSite(supabase, subject.site_id, auth.user.id, auth.profile?.role);
  if (!canAssign) return sendError("Forbidden", 403);

  const { error } = await supabase.from("subject_assignments").delete().eq("id", id);
  if (error) return sendError(error.message, 500);

  return sendSuccess<null>(null, 200, { message: "Assignment removed." });
}
