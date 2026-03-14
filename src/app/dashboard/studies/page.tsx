"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { StudiesTable } from "@/components/ctms/studies/studies-table";
import { StudiesListSkeleton } from "@/components/ctms/studies/studies-list-skeleton";
import { useStudies } from "@/hooks/use-studies";
import { cn, getErrorMessage } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export default function StudiesPage() {
  const { data: studies, isLoading, isError, error } = useStudies();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Studies</h1>
          <p className="text-muted-foreground">
            Manage study setup, lifecycle status, and CTMS milestones.
          </p>
        </div>
        <Link
          href="/dashboard/studies/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          New Study
        </Link>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm">
        <h2 className="mb-2 font-semibold">Quick CTMS Guide</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Protocol</span>: the clinical plan (objectives, endpoints,
            safety rules, and amendments).
          </li>
          <li>
            <span className="font-medium text-foreground">Site</span>: a hospital/clinic where patients are recruited
            and treated.
          </li>
          <li>
            Suggested flow: create study → define protocol/design → add sites → enroll subjects → track visits and
            deviations.
          </li>
        </ul>
      </section>

      {isLoading && <StudiesListSkeleton />}
      {isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(error, "Failed to load studies.")}
        </p>
      )}
      {!isLoading && !isError && (studies?.length ?? 0) === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No studies yet"
          description="Create your first study to initialize sites, enrollment, and monitoring workflows."
        />
      )}
      {studies && studies.length > 0 ? <StudiesTable studies={studies} /> : null}
    </div>
  );
}
