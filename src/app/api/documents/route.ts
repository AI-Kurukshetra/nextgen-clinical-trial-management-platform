import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canManageStudy, canViewStudy } from "@/lib/access-control";
import { canManageSite } from "@/lib/site-permissions";
import { documentCreateSchema } from "@/types/schemas";
import type { Document } from "@/types/database";

const DOCUMENT_COLUMNS =
  "id, study_id, site_id, name, doc_type, version, status, file_url, file_size, file_mime, s3_key, uploaded_by, created_at, updated_at";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const studyId = request.nextUrl.searchParams.get("study_id");
  if (!studyId) return sendError("study_id query param is required", 400);

  const siteId = request.nextUrl.searchParams.get("site_id");

  const supabase = await createClient();
  const role = auth.profile?.role;
  const hasViewAccess = await canViewStudy(supabase, studyId, auth.user.id, role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  let query = supabase
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .eq("study_id", studyId)
    .order("created_at", { ascending: false });

  if (siteId) query = query.eq("site_id", siteId);

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);
  return sendSuccess<Document[]>((data ?? []) as Document[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = documentCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;
  const supabase = await createClient();
  const role = auth.profile?.role;
  const hasManageAccess = payload.site_id
    ? await canManageSite(supabase, payload.site_id, auth.user.id, role)
    : await canManageStudy(supabase, payload.study_id, auth.user.id, role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  // Supersede previous versions for same named document stream.
  await supabase
    .from("documents")
    .update({ status: "superseded" })
    .eq("study_id", payload.study_id)
    .eq("name", payload.name.trim())
    .eq("doc_type", payload.doc_type)
    .neq("status", "superseded");

  const { data, error } = await supabase
    .from("documents")
    .insert({
      study_id: payload.study_id,
      site_id: payload.site_id || null,
      name: payload.name.trim(),
      doc_type: payload.doc_type,
      version: payload.version || "1.0",
      status: payload.status || "draft",
      file_url: payload.file_url || null,
      file_size: payload.file_size ?? null,
      file_mime: payload.file_mime || null,
      s3_key: payload.s3_key || null,
      uploaded_by: auth.user.id,
    })
    .select(DOCUMENT_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to create document", 500);

  await insertAuditLog(supabase, {
    tableName: "documents",
    recordId: data.id,
    action: "INSERT",
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Document>(data as Document, 201, { message: "Document uploaded." });
}
