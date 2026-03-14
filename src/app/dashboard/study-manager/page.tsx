"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { MetricCards } from "@/components/ctms/dashboard/metric-cards";
import { EnrollmentTable } from "@/components/ctms/dashboard/enrollment-table";
import { UpcomingVisitsList } from "@/components/ctms/dashboard/upcoming-visits-list";
import { DeviationsSummary } from "@/components/ctms/dashboard/deviations-summary";

export default function StudyManagerWorkspacePage() {
  const { data, isLoading, isError, error } = useDashboardMetrics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Study Manager Workspace</h1>
          <p className="text-muted-foreground">
            Owner-level dashboard across studies you own, with enrollment progress, milestone risk, and site execution quality.
          </p>
        </div>
        <Link href="/dashboard/studies" className={cn(buttonVariants({ variant: "outline" }))}>
          Open Studies
        </Link>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Prioritize studies with low enrollment velocity, overdue visits, and unresolved critical deviations.
      </section>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading manager metrics...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load workspace.")}</p> : null}

      {data && data.enrollmentRows.length === 0 ? (
        <section className="rounded-lg border bg-muted/20 p-5">
          <h2 className="text-base font-semibold">No Studies Found Yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You do not currently own any studies. Create your first study to initialize sites, subjects, and tracking modules.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/dashboard/studies/new" className={cn(buttonVariants({ variant: "default" }))}>
              Create First Study
            </Link>
            <Link href="/dashboard/studies" className={cn(buttonVariants({ variant: "outline" }))}>
              View Studies
            </Link>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            <li>1. Create study and protocol basics.</li>
            <li>2. Add sites and assign site admin/owner.</li>
            <li>3. Start subject enrollment and monitoring workflows.</li>
          </ul>
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
        </>
      ) : null}
    </div>
  );
}
