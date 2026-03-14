"use client";

import { CompleteVisitForm } from "@/components/ctms/monitoring/complete-visit-form";
import { MonitoringVisitsTable } from "@/components/ctms/monitoring/monitoring-visits-table";
import { useMyMonitoringVisits } from "@/hooks/use-monitoring-visits";
import { useSites } from "@/hooks/use-sites";
import { getErrorMessage } from "@/lib/utils";

export default function MonitoringQueuePage() {
  const { data: visits, isLoading, isError, error } = useMyMonitoringVisits();

  const firstStudyId = visits?.[0]?.study_id ?? "";
  const { data: sites } = useSites(firstStudyId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My CRA Visits</h1>
        <p className="text-muted-foreground">
          Personal CRA queue for assigned monitoring visits. Update status and visit completion details here.
        </p>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">CRA purpose:</span> verify site compliance, source data quality,
          and protocol adherence.
        </p>
        <p className="mt-2">
          Use this queue daily to identify overdue or upcoming visits. A visit is overdue when planned date is in the
          past but status remains scheduled.
        </p>
      </section>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading my visits...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load queue.")}</p> : null}

      {visits && visits.length > 0 ? (
        <>
          <MonitoringVisitsTable visits={visits} sites={sites ?? []} />
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Quick Update</h2>
            {visits.slice(0, 3).map((visit) => (
              <CompleteVisitForm key={visit.id} studyId={visit.study_id} visit={visit} />
            ))}
          </div>
        </>
      ) : (
        !isLoading && <p className="text-sm text-muted-foreground">No assigned visits found.</p>
      )}
    </div>
  );
}
