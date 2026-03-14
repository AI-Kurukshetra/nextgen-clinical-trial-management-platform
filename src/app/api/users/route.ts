import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/utils/api";
import { ROLES } from "@/constants/roles";
import type { UserListItem, PaginatedResponse } from "@/types/api";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export async function GET(request: NextRequest) {
  const auth = await requireRole([ROLES.ADMIN]);
  if (!auth) {
    return sendError("Forbidden", 403);
  }

  const url = new URL(request.url);
  const pageParam = url.searchParams.get("page");
  const limitParam = url.searchParams.get("limit");

  const page = Math.max(Number(pageParam) || DEFAULT_PAGE, 1);
  const limit = Math.max(Number(limitParam) || DEFAULT_LIMIT, 1);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return sendError(error.message, 500);
  }

  const users = (data ?? []) as UserListItem[];
  const total = count ?? users.length;
  const totalPages = total === 0 ? 1 : Math.max(Math.ceil(total / limit), 1);

  const paginated: PaginatedResponse<UserListItem> = {
    success: true,
    data: users,
    metadata: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
  };

  // sendSuccess would double-wrap data; we already shaped it as ApiSuccess
  return new Response(JSON.stringify(paginated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

