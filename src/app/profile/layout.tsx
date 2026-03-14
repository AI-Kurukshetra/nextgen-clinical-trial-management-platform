import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await requireAuth();
  if (!data) redirect("/auth/sign-in");

  return (
    <DashboardShell user={data.user} profile={data.profile}>
      {children}
    </DashboardShell>
  );
}
