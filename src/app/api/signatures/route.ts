import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { insertAuditLog } from "@/lib/audit";
import { canManageStudy } from "@/lib/access-control";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { signatureCreateSchema } from "@/types/schemas";
import type { Signature } from "@/types/database";

const SIGNATURE_COLUMNS = "id, table_name, record_id, signed_by, reason, meaning, ip_address, user_agent, signed_at";

function getRequestIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

async function verifyPassword(email: string, password: string): Promise<boolean> {
  const { url, key } = getSupabaseEnv();
  const verifierClient = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await verifierClient.auth.signInWithPassword({ email, password });
  await verifierClient.auth.signOut();
  return !error;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  if (!auth.user.email) return sendError("Authenticated user email not available", 400);

  const parsed = signatureCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;
  const credentialsValid = await verifyPassword(auth.user.email, payload.password);
  if (!credentialsValid) return sendError("Invalid credentials", 401);

  const supabase = await createClient();

  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("id, study_id, status")
    .eq("id", payload.record_id)
    .single();
  if (docError || !document) return sendError("Document not found", 404);

  const hasManageAccess = await canManageStudy(supabase, document.study_id, auth.user.id, auth.profile?.role);
  if (!hasManageAccess) return sendError("Forbidden", 403);

  const ipAddress = getRequestIp(request);
  const userAgent = request.headers.get("user-agent");

  const { data: signature, error: signatureError } = await supabase
    .from("signatures")
    .insert({
      table_name: payload.table_name,
      record_id: payload.record_id,
      signed_by: auth.user.id,
      reason: payload.reason,
      meaning: payload.meaning,
      ip_address: ipAddress,
      user_agent: userAgent,
    })
    .select(SIGNATURE_COLUMNS)
    .single();

  if (signatureError || !signature) {
    return sendError(signatureError?.message ?? "Failed to create signature", 500);
  }

  if (payload.meaning.toLowerCase() === "approved") {
    const { data: updatedDocument, error: updateError } = await supabase
      .from("documents")
      .update({ status: "approved" })
      .eq("id", payload.record_id)
      .select("id, study_id, status")
      .single();
    if (updateError || !updatedDocument) return sendError(updateError?.message ?? "Failed to approve document", 500);
    await insertAuditLog(supabase, {
      tableName: "documents",
      recordId: payload.record_id,
      action: "UPDATE",
      oldData: document as unknown as Record<string, unknown>,
      newData: updatedDocument as unknown as Record<string, unknown>,
      performedBy: auth.user.id,
    });
  }

  await insertAuditLog(supabase, {
    tableName: "signatures",
    recordId: signature.id,
    action: "INSERT",
    newData: signature as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Signature>(signature as Signature, 201, { message: "Record signed successfully." });
}
