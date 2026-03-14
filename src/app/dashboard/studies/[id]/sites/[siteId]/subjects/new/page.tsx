"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EnrollSubjectForm } from "@/components/ctms/subjects/enroll-subject-form";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { buttonVariants } from "@/components/ui/button";
import { useSite } from "@/hooks/use-sites";
import { cn, getErrorMessage } from "@/lib/utils";

export default function EnrollSubjectPage() {
  const params = useParams<{ id: string; siteId: string }>();
  const { data: site, isLoading, isError, error } = useSite(params.siteId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading site...</p>;
  }

  if (isError || !site) {
    return <p className="text-sm text-destructive">{getErrorMessage(error, "Site not found.")}</p>;
  }

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={params.id} />
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Enroll Subject</h2>
        <p className="text-sm text-muted-foreground">
          Site: {site.site_number} · {site.name}
        </p>
      </div>
      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Use protocol eligibility criteria before enrolling. Subject number should be unique within the study.
      </section>

      <EnrollSubjectForm studyId={params.id} siteId={params.siteId} />

      <Link
        href={`/dashboard/studies/${params.id}/subjects`}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Back to Subjects
      </Link>
    </div>
  );
}
