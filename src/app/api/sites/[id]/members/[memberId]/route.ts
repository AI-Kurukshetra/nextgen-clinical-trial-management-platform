import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { SITE_ROLE_DEFAULT_MASK } from "@/constants/permissions";
import { canManageSiteMembers, isGlobalStudyOperator } from "@/lib/site-permissions";
import { siteMemberUpdateSchema } from "@/types/schemas";

type RouteContext = { params: Promise<{ id: string; memberId: string }> };

const MEMBER_COLUMNS = "id, site_id, user_id, role, permission_mask, invited_by, created_at";

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id: siteId, memberId } = await context.params;
  const supabase = await createClient();

  const canManage = await canManageSiteMembers(supabase, siteId, auth.user.id, auth.profile?.role);
  if (!canManage) return sendError("Forbidden", 403);

  const parsed = siteMemberUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;

  const { data: existing, error: existingError } = await supabase
    .from("site_members")
    .select(MEMBER_COLUMNS)
    .eq("id", memberId)
    .eq("site_id", siteId)
    .single();
  if (existingError || !existing) return sendError("Site member not found", 404);

  const role = payload.role ?? existing.role;
  if (role === "owner" && !isGlobalStudyOperator(auth.profile?.role)) {
    return sendError("Only admin/study_manager can assign owner role", 403);
  }
  const permissionMask = payload.permission_mask ?? SITE_ROLE_DEFAULT_MASK[role];

  const { data, error } = await supabase
    .from("site_members")
    .update({ role, permission_mask: permissionMask })
    .eq("id", memberId)
    .eq("site_id", siteId)
    .select(MEMBER_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to update member", 500);
  return sendSuccess(data, 200, { message: "Site member updated." });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id: siteId, memberId } = await context.params;
  const supabase = await createClient();

  const canManage = await canManageSiteMembers(supabase, siteId, auth.user.id, auth.profile?.role);
  if (!canManage) return sendError("Forbidden", 403);

  const { data: member, error: memberError } = await supabase
    .from("site_members")
    .select("id, role")
    .eq("id", memberId)
    .eq("site_id", siteId)
    .single();

  if (memberError || !member) return sendError("Site member not found", 404);
  if (member.role === "owner") return sendError("Owner cannot be removed", 400);

  const { error } = await supabase.from("site_members").delete().eq("id", memberId).eq("site_id", siteId);
  if (error) return sendError(error.message, 500);

  return sendSuccess<null>(null, 200, { message: "Site member removed." });
}
