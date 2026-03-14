"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { SitesListSkeleton } from "@/components/ctms/sites/sites-list-skeleton";
import { SitesTable } from "@/components/ctms/sites/sites-table";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { buttonVariants } from "@/components/ui/button";
import { useSites } from "@/hooks/use-sites";
import { cn, getErrorMessage } from "@/lib/utils";

export default function StudySitesPage() {
  const params = useParams<{ id: string }>();
  const studyId = params.id;
  const { data: sites, isLoading, isError, error } = useSites(studyId);

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={studyId} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sites</h2>
          <p className="text-sm text-muted-foreground">Manage participating sites for this study.</p>
        </div>
        <Link
          href={`/dashboard/studies/${studyId}/sites/new`}
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Plus className="mr-1 h-4 w-4" />
          New Site
        </Link>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm">
        <h3 className="mb-2 font-semibold">Site Lifecycle Help</h3>
        <p className="text-muted-foreground">
          Sites move through: <span className="font-medium text-foreground">identified</span> →{" "}
          <span className="font-medium text-foreground">selected</span> →{" "}
          <span className="font-medium text-foreground">initiated</span> →{" "}
          <span className="font-medium text-foreground">active</span> →{" "}
          <span className="font-medium text-foreground">closed</span>. Use this page to manage operational execution
          by location.
        </p>
      </section>

      {isLoading ? <SitesListSkeleton /> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load sites.")}</p> : null}

      {!isLoading && !isError && (sites?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Plus}
          title="No sites yet"
          description="Add the first site to start enrollment and monitoring workflows."
          action={
            <Link
              href={`/dashboard/studies/${studyId}/sites/new`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Create Site
            </Link>
          }
        />
      ) : null}

      {sites && sites.length > 0 ? <SitesTable studyId={studyId} sites={sites} /> : null}
    </div>
  );
}
