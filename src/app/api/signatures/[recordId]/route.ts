import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { canViewStudy } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { signatureRecordQuerySchema } from "@/types/schemas";
import type { Signature } from "@/types/database";

type RouteContext = { params: Promise<{ recordId: string }> };

const SIGNATURE_COLUMNS = "id, table_name, record_id, signed_by, reason, meaning, ip_address, user_agent, signed_at";

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { recordId } = await context.params;
  const queryParse = signatureRecordQuerySchema.safeParse({
    table_name: request.nextUrl.searchParams.get("table_name"),
  });
  if (!queryParse.success) return sendError("Validation failed", 400, queryParse.error.flatten());
  const { table_name: tableName } = queryParse.data;

  const supabase = await createClient();

  let studyId = "";
  if (tableName === "documents") {
    const { data, error } = await supabase.from("documents").select("study_id").eq("id", recordId).single();
    if (error || !data) return sendError("Document not found", 404);
    studyId = data.study_id;
  } else if (tableName === "deviations") {
    const { data, error } = await supabase.from("deviations").select("study_id").eq("id", recordId).single();
    if (error || !data) return sendError("Deviation not found", 404);
    studyId = data.study_id;
  } else {
    const { data, error } = await supabase.from("monitoring_visits").select("study_id").eq("id", recordId).single();
    if (error || !data) return sendError("Monitoring visit not found", 404);
    studyId = data.study_id;
  }

  const hasViewAccess = await canViewStudy(supabase, studyId, auth.user.id, auth.profile?.role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("signatures")
    .select(SIGNATURE_COLUMNS)
    .eq("table_name", tableName)
    .eq("record_id", recordId)
    .order("signed_at", { ascending: false });
  if (error) return sendError(error.message, 500);

  return sendSuccess<Signature[]>((data ?? []) as Signature[]);
}
