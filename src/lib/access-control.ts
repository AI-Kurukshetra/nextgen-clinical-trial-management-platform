import type { SupabaseClient } from "@supabase/supabase-js";

type Role = string | null | undefined;

export function isGlobalStudyRole(role: Role): boolean {
  return role === "admin";
}

export async function getAccessibleStudyIds(
  supabase: SupabaseClient,
  userId: string,
  role: Role
): Promise<string[]> {
  if (isGlobalStudyRole(role)) {
    const { data } = await supabase.from("studies").select("id");
    return (data ?? []).map((row) => row.id);
  }

  const [{ data: ownedRows }, { data: siteRows }] = await Promise.all([
    supabase.from("studies").select("id").eq("owner_user_id", userId),
    supabase.from("site_members").select("sites!inner(study_id)").eq("user_id", userId),
  ]);

  const ids = new Set<string>();
  for (const row of ownedRows ?? []) ids.add(row.id);
  for (const row of siteRows ?? []) {
    const studyId = (row as { sites?: { study_id?: string } }).sites?.study_id;
    if (studyId) ids.add(studyId);
  }
  return Array.from(ids);
}

export async function canViewStudy(
  supabase: SupabaseClient,
  studyId: string,
  userId: string,
  role: Role
): Promise<boolean> {
  if (isGlobalStudyRole(role)) return true;

  const [{ data: owned }, { data: site }] = await Promise.all([
    supabase.from("studies").select("id").eq("id", studyId).eq("owner_user_id", userId).maybeSingle(),
    supabase
      .from("site_members")
      .select("id, sites!inner(study_id)")
      .eq("user_id", userId)
      .eq("sites.study_id", studyId)
      .maybeSingle(),
  ]);

  return Boolean(owned || site);
}

export async function canManageStudy(
  supabase: SupabaseClient,
  studyId: string,
  userId: string,
  role: Role
): Promise<boolean> {
  if (isGlobalStudyRole(role)) return true;

  const [{ data: owner }, { data: teamManager }] = await Promise.all([
    supabase.from("studies").select("id").eq("id", studyId).eq("owner_user_id", userId).maybeSingle(),
    supabase
      .from("study_team")
      .select("id")
      .eq("study_id", studyId)
      .eq("user_id", userId)
      .in("role", ["owner", "study_manager"])
      .maybeSingle(),
  ]);

  return Boolean(owner || teamManager);
}
