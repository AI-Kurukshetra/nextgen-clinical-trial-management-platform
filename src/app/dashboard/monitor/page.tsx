"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { MetricCards } from "@/components/ctms/dashboard/metric-cards";
import { EnrollmentTable } from "@/components/ctms/dashboard/enrollment-table";

export default function MonitorWorkspacePage() {
  const { data, isLoading, isError, error } = useDashboardMetrics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Monitor Workspace</h1>
          <p className="text-muted-foreground">Study-level enrollment and milestone progress for assigned studies.</p>
        </div>
        <Link href="/dashboard/studies" className={cn(buttonVariants({ variant: "default" }))}>
          Open Studies
        </Link>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Review site enrollment progress and study milestone status across your assigned portfolio.
      </section>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading monitor metrics...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load workspace.")}</p> : null}

      {data && data.enrollmentRows.length > 0 ? (
        <>
          <MetricCards
            activeStudies={data.activeStudies}
            totalSites={data.totalSites}
            totalEnrolled={data.totalEnrolled}
          />
          <EnrollmentTable rows={data.enrollmentRows} />
        </>
      ) : null}
    </div>
  );
}
