import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { canViewStudy } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import type { Signature } from "@/types/database";

type RouteContext = { params: Promise<{ recordId: string }> };

const SIGNATURE_COLUMNS = "id, table_name, record_id, signed_by, reason, meaning, ip_address, user_agent, signed_at";

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { recordId } = await context.params;
  const tableName = request.nextUrl.searchParams.get("table_name");
  if (tableName !== "documents") return sendError("Only document signatures are supported", 400);

  const supabase = await createClient();

  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("study_id")
    .eq("id", recordId)
    .single();
  if (docError || !document) return sendError("Document not found", 404);

  const hasViewAccess = await canViewStudy(supabase, document.study_id, auth.user.id, auth.profile?.role);
  if (!hasViewAccess) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("signatures")
    .select(SIGNATURE_COLUMNS)
    .eq("table_name", "documents")
    .eq("record_id", recordId)
    .order("signed_at", { ascending: false });
  if (error) return sendError(error.message, 500);

  return sendSuccess<Signature[]>((data ?? []) as Signature[]);
}
