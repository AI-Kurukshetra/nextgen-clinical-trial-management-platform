import { PERMISSIONS } from "@/constants/permissions";
import type { Role } from "@/constants/roles";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type SiteMemberRow = Database["public"]["Tables"]["site_members"]["Row"];

export function isGlobalStudyOperator(role: Role | string | null | undefined): boolean {
  return role === "admin";
}

export function hasPermission(mask: number, permissionBit: number): boolean {
  return (mask & permissionBit) === permissionBit;
}

export function permissionLabels(mask: number): string[] {
  const labels: string[] = [];
  if (hasPermission(mask, PERMISSIONS.MANAGE_SITE)) labels.push("Manage Site");
  if (hasPermission(mask, PERMISSIONS.MANAGE_MEMBERS)) labels.push("Manage Members");
  if (hasPermission(mask, PERMISSIONS.SUBJECT_CREATE)) labels.push("Create Subjects");
  if (hasPermission(mask, PERMISSIONS.SUBJECT_UPDATE)) labels.push("Update Subjects");
  if (hasPermission(mask, PERMISSIONS.SUBJECT_ASSIGN)) labels.push("Assign Subjects");
  if (hasPermission(mask, PERMISSIONS.MONITORING_MANAGE)) labels.push("Manage Monitoring");
  if (hasPermission(mask, PERMISSIONS.DOCUMENT_MANAGE)) labels.push("Manage Documents");
  if (hasPermission(mask, PERMISSIONS.DEVIATION_MANAGE)) labels.push("Manage Deviations");
  return labels;
}

export async function getSiteMember(
  supabase: SupabaseClient,
  siteId: string,
  userId: string
): Promise<SiteMemberRow | null> {
  const { data, error } = await supabase
    .from("site_members")
    .select("id, site_id, user_id, role, permission_mask, invited_by, created_at")
    .eq("site_id", siteId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  return (data as SiteMemberRow | null) ?? null;
}

export async function canViewSite(
  supabase: SupabaseClient,
  siteId: string,
  userId: string,
  role: Role | string | null | undefined
): Promise<boolean> {
  if (isGlobalStudyOperator(role)) return true;
  const membership = await getSiteMember(supabase, siteId, userId);
  return Boolean(membership);
}

export async function canManageSite(
  supabase: SupabaseClient,
  siteId: string,
  userId: string,
  role: Role | string | null | undefined
): Promise<boolean> {
  if (isGlobalStudyOperator(role)) return true;
  const membership = await getSiteMember(supabase, siteId, userId);
  if (!membership) return false;
  return membership.role === "owner" || hasPermission(membership.permission_mask, PERMISSIONS.MANAGE_SITE);
}

export async function canManageSiteMembers(
  supabase: SupabaseClient,
  siteId: string,
  userId: string,
  role: Role | string | null | undefined
): Promise<boolean> {
  if (isGlobalStudyOperator(role)) return true;
  const membership = await getSiteMember(supabase, siteId, userId);
  if (!membership) return false;
  return membership.role === "owner" || hasPermission(membership.permission_mask, PERMISSIONS.MANAGE_MEMBERS);
}

export async function canCreateSubjectAtSite(
  supabase: SupabaseClient,
  siteId: string,
  userId: string,
  role: Role | string | null | undefined
): Promise<boolean> {
  if (isGlobalStudyOperator(role)) return true;
  const membership = await getSiteMember(supabase, siteId, userId);
  if (!membership) return false;
  return hasPermission(membership.permission_mask, PERMISSIONS.SUBJECT_CREATE);
}

export async function canUpdateSubjectAtSite(
  supabase: SupabaseClient,
  siteId: string,
  userId: string,
  role: Role | string | null | undefined
): Promise<boolean> {
  if (isGlobalStudyOperator(role)) return true;
  const membership = await getSiteMember(supabase, siteId, userId);
  if (!membership) return false;
  return hasPermission(membership.permission_mask, PERMISSIONS.SUBJECT_UPDATE);
}

export async function canAssignSubjectAtSite(
  supabase: SupabaseClient,
  siteId: string,
  userId: string,
  role: Role | string | null | undefined
): Promise<boolean> {
  if (isGlobalStudyOperator(role)) return true;
  const membership = await getSiteMember(supabase, siteId, userId);
  if (!membership) return false;
  return hasPermission(membership.permission_mask, PERMISSIONS.SUBJECT_ASSIGN);
}
