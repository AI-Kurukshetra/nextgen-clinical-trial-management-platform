import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { SITE_ROLE_DEFAULT_MASK } from "@/constants/permissions";
import { canManageSiteMembers, canViewSite, isGlobalStudyOperator } from "@/lib/site-permissions";
import { siteMemberCreateSchema } from "@/types/schemas";
import type { SiteMember } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const MEMBER_COLUMNS = "id, site_id, user_id, role, permission_mask, invited_by, created_at";

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id: siteId } = await context.params;
  const supabase = await createClient();

  const canView = await canViewSite(supabase, siteId, auth.user.id, auth.profile?.role);
  if (!canView) return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("site_members")
    .select(MEMBER_COLUMNS)
    .eq("site_id", siteId)
    .order("created_at", { ascending: true });

  if (error) return sendError(error.message, 500);

  const userIds = (data ?? []).map((item) => item.user_id);
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .in("id", userIds)
    : { data: [] as Array<{ id: string; email: string | null; full_name: string | null; role: string }> };

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const rows = (data ?? []).map((member) => ({
    ...(member as SiteMember),
    profile: profileById.get(member.user_id) ?? null,
  }));

  return sendSuccess(rows);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id: siteId } = await context.params;
  const supabase = await createClient();

  const canManage = await canManageSiteMembers(supabase, siteId, auth.user.id, auth.profile?.role);
  if (!canManage) return sendError("Forbidden", 403);

  const parsed = siteMemberCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;
  if (payload.role === "owner" && !isGlobalStudyOperator(auth.profile?.role)) {
    return sendError("Only admin/study_manager can assign owner role", 403);
  }
  const mask = payload.permission_mask ?? SITE_ROLE_DEFAULT_MASK[payload.role];

  const { data, error } = await supabase
    .from("site_members")
    .upsert(
      {
        site_id: siteId,
        user_id: payload.user_id,
        role: payload.role,
        permission_mask: mask,
        invited_by: auth.user.id,
      },
      { onConflict: "site_id,user_id" }
    )
    .select(MEMBER_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to add member", 500);
  return sendSuccess(data, 201, { message: "Site member added." });
}
