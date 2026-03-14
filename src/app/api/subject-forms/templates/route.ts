import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { canManageStudy, canViewStudy } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { subjectFormTemplateCreateSchema } from "@/types/schemas";
import type { SubjectFormTemplate } from "@/types/database";

const TEMPLATE_COLUMNS =
  "id, study_id, site_id, name, description, schema, is_active, created_by, created_at, updated_at";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const studyId = request.nextUrl.searchParams.get("study_id");
  const siteId = request.nextUrl.searchParams.get("site_id");
  if (!studyId) return sendError("study_id query param is required", 400);

  const supabase = await createClient();
  const hasAccess = await canViewStudy(supabase, studyId, auth.user.id, auth.profile?.role);
  if (!hasAccess) return sendError("Forbidden", 403);

  let query = supabase
    .from("subject_form_templates")
    .select(TEMPLATE_COLUMNS)
    .eq("study_id", studyId)
    .order("created_at", { ascending: false });
  if (siteId) query = query.eq("site_id", siteId);

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);
  return sendSuccess<SubjectFormTemplate[]>((data ?? []) as SubjectFormTemplate[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = subjectFormTemplateCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());
  const payload = parsed.data;

  const supabase = await createClient();
  const hasManageAccess = await canManageStudy(supabase, payload.study_id, auth.user.id, auth.profile?.role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("subject_form_templates")
    .insert({
      study_id: payload.study_id,
      site_id: payload.site_id ?? null,
      name: payload.name,
      description: payload.description ?? null,
      schema: payload.schema,
      is_active: payload.is_active ?? true,
      created_by: auth.user.id,
    })
    .select(TEMPLATE_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to create template", 500);
  return sendSuccess<SubjectFormTemplate>(data as SubjectFormTemplate, 201, {
    message: "Form template created.",
  });
}
