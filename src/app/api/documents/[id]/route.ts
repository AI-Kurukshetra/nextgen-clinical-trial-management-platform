import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canManageStudy, canViewStudy } from "@/lib/access-control";
import { canManageSite } from "@/lib/site-permissions";
import { documentUpdateSchema } from "@/types/schemas";
import type { Document } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const DOCUMENT_COLUMNS =
  "id, study_id, site_id, name, doc_type, version, status, file_url, file_size, file_mime, s3_key, uploaded_by, created_at, updated_at";

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase.from("documents").select(DOCUMENT_COLUMNS).eq("id", id).single();
  if (error || !data) return sendError("Document not found", 404);
  const role = auth.profile?.role;
  const hasViewAccess = await canViewStudy(supabase, data.study_id, auth.user.id, role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  return sendSuccess<Document>(data as Document);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = documentUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const { id } = await context.params;
  const payload = parsed.data;
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .eq("id", id)
    .single();

  if (existingError || !existing) return sendError("Document not found", 404);
  const role = auth.profile?.role;
  const hasManageAccess = existing.site_id
    ? await canManageSite(supabase, existing.site_id, auth.user.id, role)
    : await canManageStudy(supabase, existing.study_id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("documents")
    .update({
      site_id: payload.site_id,
      name: payload.name,
      doc_type: payload.doc_type,
      version: payload.version,
      status: payload.status,
      file_url: payload.file_url,
      file_size: payload.file_size,
      file_mime: payload.file_mime,
      s3_key: payload.s3_key,
    })
    .eq("id", id)
    .select(DOCUMENT_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to update document", 500);

  await insertAuditLog(supabase, {
    tableName: "documents",
    recordId: id,
    action: "UPDATE",
    oldData: existing as unknown as Record<string, unknown>,
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Document>(data as Document, 200, { message: "Document updated." });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .eq("id", id)
    .single();

  if (existingError || !existing) return sendError("Document not found", 404);
  const role = auth.profile?.role;
  const hasManageAccess = existing.site_id
    ? await canManageSite(supabase, existing.site_id, auth.user.id, role)
    : await canManageStudy(supabase, existing.study_id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return sendError(error.message, 500);

  await insertAuditLog(supabase, {
    tableName: "documents",
    recordId: id,
    action: "DELETE",
    oldData: existing as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<null>(null, 200, { message: "Document deleted." });
}
