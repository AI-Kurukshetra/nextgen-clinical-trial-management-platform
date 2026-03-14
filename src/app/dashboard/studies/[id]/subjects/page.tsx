"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { SubjectsListSkeleton } from "@/components/ctms/subjects/subjects-list-skeleton";
import { EnrollmentProgressBar } from "@/components/ctms/subjects/enrollment-progress-bar";
import { SubjectAssignmentsPanel } from "@/components/ctms/subjects/subject-assignments-panel";
import { EnrollmentSummaryCards } from "@/components/ctms/subjects/enrollment-summary-cards";
import { SubjectsTable } from "@/components/ctms/subjects/subjects-table";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { buttonVariants } from "@/components/ui/button";
import { useSites } from "@/hooks/use-sites";
import { useStudy } from "@/hooks/use-studies";
import { useSubjects } from "@/hooks/use-subjects";
import { cn, getErrorMessage } from "@/lib/utils";

export default function StudySubjectsPage() {
  const params = useParams<{ id: string }>();
  const studyId = params.id;

  const { data: study } = useStudy(studyId);
  const { data: subjects, isLoading, isError, error } = useSubjects(studyId);
  const { data: sites } = useSites(studyId);

  const enrolledCount = (subjects ?? []).filter((s) =>
    ["enrolled", "active", "completed"].includes(s.status)
  ).length;

  const firstSiteId = sites?.[0]?.id;

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={studyId} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Subjects</h2>
          <p className="text-sm text-muted-foreground">
            Cross-site enrollment tracker. Use this to monitor subject lifecycle from screening to completion.
          </p>
        </div>
        {firstSiteId ? (
          <Link
            href={`/dashboard/studies/${studyId}/sites/${firstSiteId}/subjects/new`}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Enroll Subject
          </Link>
        ) : null}
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm">
        <h3 className="mb-2 font-semibold">How Enrollment Flow Works</h3>
        <p className="text-muted-foreground">
          A subject is screened at a site, then enrolled if eligible. Statuses track progress through treatment and
          follow-up. This view combines all sites so admins can monitor overall enrollment health.
        </p>
      </section>

      <EnrollmentSummaryCards subjects={subjects ?? []} />
      <EnrollmentProgressBar enrolledCount={enrolledCount} targetEnrollment={study?.target_enrollment ?? null} />

      {isLoading ? <SubjectsListSkeleton /> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load subjects.")}</p> : null}

      {!isLoading && !isError && (subjects?.length ?? 0) === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No subjects yet"
          description={
            firstSiteId
              ? "Start enrollment by adding your first subject."
              : "Add at least one site first, then enroll subjects."
          }
          action={
            firstSiteId ? (
              <Link
                href={`/dashboard/studies/${studyId}/sites/${firstSiteId}/subjects/new`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Enroll First Subject
              </Link>
            ) : (
              <Link href={`/dashboard/studies/${studyId}/sites`} className={cn(buttonVariants({ variant: "outline" }))}>
                Go to Sites
              </Link>
            )
          }
        />
      ) : null}

      {subjects && subjects.length > 0 ? <SubjectsTable subjects={subjects} sites={sites ?? []} /> : null}

      {subjects && subjects.length > 0 ? <SubjectAssignmentsPanel studyId={studyId} subjects={subjects} /> : null}
    </div>
  );
}
