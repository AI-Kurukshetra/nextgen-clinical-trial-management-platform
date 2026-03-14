import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return sendSuccess([]);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) return sendError(error.message, 500);
  return sendSuccess(data ?? []);
}
