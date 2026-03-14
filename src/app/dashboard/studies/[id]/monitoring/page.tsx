"use client";

import { useParams } from "next/navigation";
import { MonitoringVisitsTable } from "@/components/ctms/monitoring/monitoring-visits-table";
import { ScheduleVisitForm } from "@/components/ctms/monitoring/schedule-visit-form";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { useMonitoringVisits } from "@/hooks/use-monitoring-visits";
import { useSites } from "@/hooks/use-sites";
import { getErrorMessage } from "@/lib/utils";

export default function StudyMonitoringPage() {
  const params = useParams<{ id: string }>();
  const studyId = params.id;

  const { data: visits, isLoading, isError, error } = useMonitoringVisits(studyId);
  const { data: sites } = useSites(studyId);

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={studyId} />

      <div>
        <h2 className="text-xl font-semibold">Site Monitoring (CRA)</h2>
        <p className="text-sm text-muted-foreground">
          Plan CRA oversight visits (SIV/IMV/COV), track execution, and close follow-up actions.
        </p>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Why this exists:</span> Monitoring validates protocol
          compliance, data integrity, and patient safety at each site.
        </p>
        <p className="mt-2">
          Typical flow: schedule visit → perform visit (status in progress/completed) → capture findings → track
          report due date and remediation.
        </p>
      </section>

      {(sites?.length ?? 0) > 0 ? (
        <ScheduleVisitForm studyId={studyId} sites={sites ?? []} />
      ) : (
        <p className="text-sm text-muted-foreground">Add a site before scheduling monitoring visits.</p>
      )}

      {isLoading ? <p className="text-sm text-muted-foreground">Loading visits...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load visits.")}</p> : null}

      {visits && visits.length > 0 ? (
        <MonitoringVisitsTable visits={visits} sites={sites ?? []} />
      ) : (
        !isLoading && <p className="text-sm text-muted-foreground">No monitoring visits scheduled yet.</p>
      )}
    </div>
  );
}
