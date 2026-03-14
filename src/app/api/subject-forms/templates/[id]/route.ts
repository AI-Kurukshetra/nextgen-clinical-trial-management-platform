import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { canManageStudy, canViewStudy } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { subjectFormTemplateUpdateSchema } from "@/types/schemas";
import type { SubjectFormTemplate } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const TEMPLATE_COLUMNS =
  "id, study_id, site_id, name, description, schema, is_active, created_by, created_at, updated_at";

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  const { id } = await context.params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subject_form_templates")
    .select(TEMPLATE_COLUMNS)
    .eq("id", id)
    .single();
  if (error || !data) return sendError("Template not found", 404);

  const hasAccess = await canViewStudy(supabase, data.study_id, auth.user.id, auth.profile?.role);
  if (!hasAccess) return sendError("Forbidden", 403);
  return sendSuccess<SubjectFormTemplate>(data as SubjectFormTemplate);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  const parsed = subjectFormTemplateUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const { id } = await context.params;
  const payload = parsed.data;
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("subject_form_templates")
    .select(TEMPLATE_COLUMNS)
    .eq("id", id)
    .single();
  if (existingError || !existing) return sendError("Template not found", 404);

  const hasManageAccess = await canManageStudy(supabase, existing.study_id, auth.user.id, auth.profile?.role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("subject_form_templates")
    .update({
      site_id: payload.site_id === undefined ? undefined : payload.site_id,
      name: payload.name,
      description: payload.description === undefined ? undefined : payload.description,
      schema: payload.schema,
      is_active: payload.is_active,
    })
    .eq("id", id)
    .select(TEMPLATE_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to update template", 500);
  return sendSuccess<SubjectFormTemplate>(data as SubjectFormTemplate, 200, {
    message: "Form template updated.",
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("subject_form_templates")
    .select(TEMPLATE_COLUMNS)
    .eq("id", id)
    .single();
  if (existingError || !existing) return sendError("Template not found", 404);

  const hasManageAccess = await canManageStudy(supabase, existing.study_id, auth.user.id, auth.profile?.role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { error } = await supabase.from("subject_form_templates").delete().eq("id", id);
  if (error) return sendError(error.message, 500);
  return sendSuccess<null>(null, 200, { message: "Template deleted." });
}
