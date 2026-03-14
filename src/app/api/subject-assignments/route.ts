import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canAssignSubjectAtSite, isGlobalStudyOperator } from "@/lib/site-permissions";
import { subjectAssignmentCreateSchema } from "@/types/schemas";
import type { SubjectAssignment } from "@/types/database";

const ASSIGN_COLUMNS = "id, subject_id, assignee_user_id, assigned_by, assignment_role, notes, created_at, updated_at";

async function enrichAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: SubjectAssignment[]
) {
  if (rows.length === 0) return [];
  const subjectIds = [...new Set(rows.map((row) => row.subject_id))];
  const userIds = [...new Set(rows.map((row) => row.assignee_user_id))];

  const [{ data: subjects }, { data: profiles }] = await Promise.all([
    supabase.from("subjects").select("id, subject_number, site_id").in("id", subjectIds),
    supabase.from("profiles").select("id, email, full_name").in("id", userIds),
  ]);

  const subjectById = new Map((subjects ?? []).map((subject) => [subject.id, subject]));
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return rows.map((row) => ({
    ...row,
    subject: subjectById.get(row.subject_id) ?? null,
    assignee: profileById.get(row.assignee_user_id) ?? null,
  }));
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const studyId = request.nextUrl.searchParams.get("study_id");
  const siteId = request.nextUrl.searchParams.get("site_id");

  if (!studyId) return sendError("study_id query param is required", 400);

  const supabase = await createClient();
  let subjectsQuery = supabase.from("subjects").select("id, site_id").eq("study_id", studyId);

  if (siteId) subjectsQuery = subjectsQuery.eq("site_id", siteId);

  const { data: subjectRows, error: subjectsError } = await subjectsQuery;
  if (subjectsError) return sendError(subjectsError.message, 500);

  let filteredSubjectIds = (subjectRows ?? []).map((row) => row.id);

  if (!isGlobalStudyOperator(auth.profile?.role)) {
    const { data: memberships } = await supabase
      .from("site_members")
      .select("site_id")
      .eq("user_id", auth.user.id);
    const siteIds = new Set((memberships ?? []).map((item) => item.site_id));
    filteredSubjectIds = (subjectRows ?? [])
      .filter((row) => siteIds.has(row.site_id))
      .map((row) => row.id);
  }

  if (filteredSubjectIds.length === 0) return sendSuccess<SubjectAssignment[]>([]);

  const { data, error } = await supabase
    .from("subject_assignments")
    .select(ASSIGN_COLUMNS)
    .in("subject_id", filteredSubjectIds)
    .order("created_at", { ascending: false });

  if (error) return sendError(error.message, 500);
  const enriched = await enrichAssignments(supabase, (data ?? []) as SubjectAssignment[]);
  return sendSuccess(enriched);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = subjectAssignmentCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;
  const supabase = await createClient();

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, site_id")
    .eq("id", payload.subject_id)
    .single();

  if (subjectError || !subject) return sendError("Subject not found", 404);

  const canAssign = await canAssignSubjectAtSite(supabase, subject.site_id, auth.user.id, auth.profile?.role);
  if (!canAssign) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("subject_assignments")
    .upsert(
      {
        subject_id: payload.subject_id,
        assignee_user_id: payload.assignee_user_id,
        assigned_by: auth.user.id,
        assignment_role: payload.assignment_role,
        notes: payload.notes ?? null,
      },
      { onConflict: "subject_id,assignee_user_id" }
    )
    .select(ASSIGN_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to assign subject", 500);

  await insertAuditLog(supabase, {
    tableName: "subject_assignments",
    recordId: data.id,
    action: "INSERT",
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  const enriched = await enrichAssignments(supabase, [data as SubjectAssignment]);
  return sendSuccess(enriched[0], 201, { message: "Subject assigned." });
}
