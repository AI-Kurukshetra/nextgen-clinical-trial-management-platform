"use client";

import { useStudies } from "@/hooks/use-studies";
import { StudiesTable } from "@/components/ctms/studies/studies-table";
import { getErrorMessage } from "@/lib/utils";

export default function DashboardTablePage() {
  const { data: studies, isLoading, isError, error } = useStudies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Studies Table</h1>
        <p className="text-muted-foreground">
          Unified tabular view of all accessible studies.
        </p>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading studies...</p>}
      {isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(error, "Failed to load studies.")}
        </p>
      )}
      {studies && !isLoading && !isError && <StudiesTable studies={studies} />}
    </div>
  );
}
