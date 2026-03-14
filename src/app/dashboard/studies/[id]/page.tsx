"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { StudyStatusBadge } from "@/components/ctms/studies/study-status-badge";
import { useStudy } from "@/hooks/use-studies";
import { cn, getErrorMessage } from "@/lib/utils";

export default function StudyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: study, isLoading, isError, error } = useStudy(id);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading study...</p>;
  }

  if (isError || !study) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Study not found.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{study.protocol_number}</p>
          <h1 className="text-2xl font-semibold">{study.title}</h1>
          <div className="flex items-center gap-3">
            <StudyStatusBadge status={study.status} />
            <span className="text-sm text-muted-foreground">{study.phase}</span>
          </div>
        </div>
        <Link
          href={`/dashboard/studies/${study.id}/edit`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Edit Study
        </Link>
      </div>

      <StudyDetailTabs studyId={study.id} />

      <section className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Therapeutic Area</p>
          <p>{study.therapeutic_area ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sponsor</p>
          <p>{study.sponsor_name ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Indication</p>
          <p>{study.indication ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Target Enrollment</p>
          <p>{study.target_enrollment ?? "-"}</p>
        </div>
      </section>
    </div>
  );
}
