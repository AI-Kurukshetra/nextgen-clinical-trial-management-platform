import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/constants/roles";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function getCurrentUserWithProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const profile = await getProfile(user.id);
  return { user, profile };
}

export async function requireAuth() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user) return null;
  return { user, profile };
}

export async function requireRole(allowedRoles: Role[]) {
  const data = await requireAuth();
  if (!data) return null;
  const role = (data.profile?.role ?? "viewer") as Role;
  if (!allowedRoles.includes(role)) return null;
  return data;
}
