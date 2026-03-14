"use client";

import { useParams } from "next/navigation";
import { DeviationSummaryCards } from "@/components/ctms/deviations/deviation-summary-cards";
import { DeviationsTable } from "@/components/ctms/deviations/deviations-table";
import { LogDeviationForm } from "@/components/ctms/deviations/log-deviation-form";
import { ResolveDeviationForm } from "@/components/ctms/deviations/resolve-deviation-form";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { useDeviations } from "@/hooks/use-deviations";
import { useSites } from "@/hooks/use-sites";
import { useSubjects } from "@/hooks/use-subjects";
import { getErrorMessage } from "@/lib/utils";

export default function StudyDeviationsPage() {
  const params = useParams<{ id: string }>();
  const studyId = params.id;

  const { data: deviations, isLoading, isError, error } = useDeviations(studyId);
  const { data: sites } = useSites(studyId);
  const { data: subjects } = useSubjects(studyId);

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={studyId} />

      <div>
        <h2 className="text-xl font-semibold">Deviations</h2>
        <p className="text-sm text-muted-foreground">
          Track protocol/GCP deviations, triage severity, and ensure corrective actions are documented.
        </p>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        A deviation is any departure from protocol, GCP, or process expectations. Use this module to log the event,
        assign severity, investigate root cause, and close with corrective action.
      </section>

      <DeviationSummaryCards deviations={deviations ?? []} />

      {(sites?.length ?? 0) > 0 ? (
        <LogDeviationForm studyId={studyId} sites={sites ?? []} subjects={subjects ?? []} />
      ) : (
        <p className="text-sm text-muted-foreground">Add a site before logging deviations.</p>
      )}

      {isLoading ? <p className="text-sm text-muted-foreground">Loading deviations...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load deviations.")}</p> : null}

      {deviations && deviations.length > 0 ? (
        <>
          <DeviationsTable studyId={studyId} deviations={deviations} sites={sites ?? []} subjects={subjects ?? []} />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resolve / Close</h3>
            {deviations.slice(0, 3).map((deviation) => (
              <ResolveDeviationForm key={deviation.id} studyId={studyId} deviation={deviation} />
            ))}
          </div>
        </>
      ) : (
        !isLoading && <p className="text-sm text-muted-foreground">No deviations logged yet.</p>
      )}
    </div>
  );
}
