import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const auth = await requireAuth();
  if (!auth) {
    redirect("/auth/sign-in");
  }

  const role = auth.profile?.role ?? "viewer";
  const supabase = await createClient();

  const { data: siteMembership } = await supabase
    .from("site_members")
    .select("id")
    .eq("user_id", auth.user.id)
    .limit(1)
    .maybeSingle();

  const hasSiteMembership = Boolean(siteMembership?.id);
  const { data: ownedStudy } = await supabase
    .from("studies")
    .select("id")
    .eq("owner_user_id", auth.user.id)
    .limit(1)
    .maybeSingle();
  const hasOwnedStudies = Boolean(ownedStudy?.id);
  const { data: portalLink } = await supabase
    .from("subject_portal_links")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  const hasPortalAccess = Boolean(portalLink?.id);

  if (role === "admin") {
    redirect("/dashboard/admin");
  }
  if (role === "study_manager") {
    redirect("/dashboard/study-manager");
  }
  if (role === "monitor") {
    redirect("/dashboard/monitor");
  }
  if (hasOwnedStudies) {
    redirect("/dashboard/study-manager");
  }
  if (role === "site_coordinator" || role === "viewer") {
    if (hasPortalAccess && !hasSiteMembership) {
      redirect("/portal");
    }
    redirect(hasSiteMembership ? "/dashboard/site-owner" : "/dashboard/field");
  }

  redirect("/dashboard/field");
}
