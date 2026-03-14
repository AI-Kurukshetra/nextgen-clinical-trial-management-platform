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

  let studyId = "";
  let existingRecord: Record<string, unknown> | null = null;

  if (payload.table_name === "documents") {
    const { data, error } = await supabase
      .from("documents")
      .select("id, study_id, status")
      .eq("id", payload.record_id)
      .single();
    if (error || !data) return sendError("Document not found", 404);
    studyId = data.study_id;
    existingRecord = data as unknown as Record<string, unknown>;
  } else if (payload.table_name === "deviations") {
    const { data, error } = await supabase
      .from("deviations")
      .select("id, study_id, status, resolved_date")
      .eq("id", payload.record_id)
      .single();
    if (error || !data) return sendError("Deviation not found", 404);
    studyId = data.study_id;
    existingRecord = data as unknown as Record<string, unknown>;
  } else {
    const { data, error } = await supabase
      .from("monitoring_visits")
      .select("id, study_id, status")
      .eq("id", payload.record_id)
      .single();
    if (error || !data) return sendError("Monitoring visit not found", 404);
    studyId = data.study_id;
    existingRecord = data as unknown as Record<string, unknown>;
  }

  const hasManageAccess = await canManageStudy(supabase, studyId, auth.user.id, auth.profile?.role);
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

  if (payload.table_name === "documents" && payload.meaning.toLowerCase() === "approved") {
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
      oldData: existingRecord,
      newData: updatedDocument as unknown as Record<string, unknown>,
      performedBy: auth.user.id,
    });
  }

  if (payload.table_name === "deviations" && payload.meaning.toLowerCase() === "closed") {
    const { data: updatedDeviation, error: updateError } = await supabase
      .from("deviations")
      .update({ status: "closed", resolved_date: new Date().toISOString().slice(0, 10) })
      .eq("id", payload.record_id)
      .select("id, study_id, status, resolved_date")
      .single();
    if (updateError || !updatedDeviation) return sendError(updateError?.message ?? "Failed to close deviation", 500);
    await insertAuditLog(supabase, {
      tableName: "deviations",
      recordId: payload.record_id,
      action: "UPDATE",
      oldData: existingRecord,
      newData: updatedDeviation as unknown as Record<string, unknown>,
      performedBy: auth.user.id,
    });
  }

  if (payload.table_name === "monitoring_visits" && payload.meaning.toLowerCase() === "reviewed") {
    const { data: updatedVisit, error: updateError } = await supabase
      .from("monitoring_visits")
      .update({ status: "completed" })
      .eq("id", payload.record_id)
      .select("id, study_id, status")
      .single();
    if (updateError || !updatedVisit) return sendError(updateError?.message ?? "Failed to update visit", 500);
    await insertAuditLog(supabase, {
      tableName: "monitoring_visits",
      recordId: payload.record_id,
      action: "UPDATE",
      oldData: existingRecord,
      newData: updatedVisit as unknown as Record<string, unknown>,
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
