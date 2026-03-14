"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { UpcomingVisitsList } from "@/components/ctms/dashboard/upcoming-visits-list";
import { DeviationsSummary } from "@/components/ctms/dashboard/deviations-summary";

export default function MonitorWorkspacePage() {
  const { data, isLoading, isError, error } = useDashboardMetrics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Monitor Workspace</h1>
          <p className="text-muted-foreground">Prioritize assigned CRA visits, findings follow-up, and report due dates.</p>
        </div>
        <Link href="/dashboard/monitoring" className={cn(buttonVariants({ variant: "default" }))}>
          Open My CRA Visits
        </Link>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        CRA focus: complete due visits, resolve critical findings, and keep monitoring reports on schedule.
      </section>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading monitor metrics...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load workspace.")}</p> : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <UpcomingVisitsList visits={data.upcomingVisits} />
          <DeviationsSummary
            minor={data.deviationBreakdown.minor}
            major={data.deviationBreakdown.major}
            critical={data.deviationBreakdown.critical}
          />
        </div>
      ) : null}
    </div>
  );
}
