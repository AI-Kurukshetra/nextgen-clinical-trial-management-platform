import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDownloadSignedUrl } from "@/lib/s3";
import { sendError, sendSuccess } from "@/lib/utils/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("id, s3_key")
    .eq("id", id)
    .single();

  if (error || !data) return sendError("Document not found", 404);
  if (!data.s3_key) return sendError("Document has no storage key", 400);

  const downloadUrl = await getDownloadSignedUrl(data.s3_key);
  return sendSuccess({ downloadUrl });
}
