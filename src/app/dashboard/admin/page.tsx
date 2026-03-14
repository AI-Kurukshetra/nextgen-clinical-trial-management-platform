"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { MetricCards } from "@/components/ctms/dashboard/metric-cards";
import { EnrollmentTable } from "@/components/ctms/dashboard/enrollment-table";
import { UpcomingVisitsList } from "@/components/ctms/dashboard/upcoming-visits-list";
import { DeviationsSummary } from "@/components/ctms/dashboard/deviations-summary";
import { RecentActivityFeed } from "@/components/ctms/dashboard/recent-activity-feed";

export default function AdminWorkspacePage() {
  const { data, isLoading, isError, error } = useDashboardMetrics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Workspace</h1>
          <p className="text-muted-foreground">
            Portfolio-wide view for operations, quality risks, and recent system activity.
          </p>
        </div>
        <Link href="/dashboard/studies/new" className={cn(buttonVariants({ variant: "default" }))}>
          Create Study
        </Link>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        You can monitor all studies, all sites, and cross-study operational bottlenecks from this workspace.
      </section>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading dashboard metrics...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load dashboard.")}</p> : null}

      {data && data.enrollmentRows.length === 0 ? (
        <section className="rounded-lg border bg-muted/20 p-5">
          <h2 className="text-base font-semibold">No Tenant Studies Onboarded</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The platform is ready but no study data exists yet. Create a seed study or invite users to create and manage their own tenant studies.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/dashboard/studies/new" className={cn(buttonVariants({ variant: "default" }))}>
              Create Seed Study
            </Link>
            <Link href="/admin/users" className={cn(buttonVariants({ variant: "outline" }))}>
              Review Users
            </Link>
          </div>
        </section>
      ) : null}

      {data && data.enrollmentRows.length > 0 ? (
        <>
          <MetricCards
            activeStudies={data.activeStudies}
            totalSites={data.totalSites}
            totalEnrolled={data.totalEnrolled}
            openDeviations={data.openDeviations}
          />

          <EnrollmentTable rows={data.enrollmentRows} />

          <div className="grid gap-4 lg:grid-cols-2">
            <UpcomingVisitsList visits={data.upcomingVisits} />
            <DeviationsSummary
              minor={data.deviationBreakdown.minor}
              major={data.deviationBreakdown.major}
              critical={data.deviationBreakdown.critical}
            />
          </div>

          <RecentActivityFeed items={data.recentActivity} />
        </>
      ) : null}
    </div>
  );
}
