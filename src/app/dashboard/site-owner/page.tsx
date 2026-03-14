"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { MetricCards } from "@/components/ctms/dashboard/metric-cards";
import { MyMilestoneTasksPanel } from "@/components/ctms/milestones/my-milestone-tasks-panel";

export default function SiteOwnerWorkspacePage() {
  const { data, isLoading, isError, error } = useDashboardMetrics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Site Team Workspace</h1>
          <p className="text-muted-foreground">
            Role-based operational dashboard for site admins, nurses, and investigators.
          </p>
        </div>
        <Link href="/dashboard/studies" className={cn(buttonVariants({ variant: "outline" }))}>
          Open Site Studies
        </Link>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        This dashboard is tenant-scoped by your site memberships only. You can manage subjects and assignments for your permitted sites.
      </section>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading site metrics...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load workspace.")}</p> : null}

      {data && data.totalSites === 0 ? (
        <section className="rounded-lg border bg-muted/20 p-5">
          <h2 className="text-base font-semibold">No Site Assignments Found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You are not currently assigned as site admin/member on any site. Ask study owner to add you to site team or create your own study.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/dashboard/studies" className={cn(buttonVariants({ variant: "outline" }))}>
              Browse Accessible Studies
            </Link>
            <Link href="/dashboard/studies/new" className={cn(buttonVariants({ variant: "default" }))}>
              Create Study
            </Link>
          </div>
        </section>
      ) : null}

      {data && data.totalSites > 0 ? (
        <>
          <MyMilestoneTasksPanel />
          <MetricCards
            activeStudies={data.activeStudies}
            totalSites={data.totalSites}
            totalEnrolled={data.totalEnrolled}
          />
        </>
      ) : null}
    </div>
  );
}
