"use client";

import Link from "next/link";
import { ClipboardList, ShieldCheck, UserRoundPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useStudies } from "@/hooks/use-studies";
import { MyMilestoneTasksPanel } from "@/components/ctms/milestones/my-milestone-tasks-panel";
import { cn, getErrorMessage } from "@/lib/utils";

export default function FieldWorkspacePage() {
  const { data: studies, isLoading, isError, error } = useStudies();
  const accessibleStudies = studies ?? [];
  const hasStudies = accessibleStudies.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Field Workspace</h1>
        <p className="text-muted-foreground">
          Role-aware workspace for users without active site operations. Start your own study or join an existing one.
        </p>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading workspace scope...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load workspace.")}</p> : null}

      <MyMilestoneTasksPanel
        title="My Assigned Milestone Tasks"
        description="Even without full study ownership, you can execute and complete tasks assigned to you or your clinic."
      />

      {!isLoading && !isError ? (
        <>
          {hasStudies ? (
            <section className="rounded-lg border bg-muted/20 p-4">
              <h2 className="text-base font-semibold">You Have Study Access</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {accessibleStudies.length} accessible {accessibleStudies.length === 1 ? "study" : "studies"} found.
                Continue to studies to work on your assigned scope.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/dashboard/studies" className={cn(buttonVariants({ variant: "default" }))}>
                  Open My Studies
                </Link>
                <Link href="/dashboard/site-owner" className={cn(buttonVariants({ variant: "outline" }))}>
                  Open Site Team Workspace
                </Link>
              </div>
            </section>
          ) : (
            <section className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <ClipboardList className="h-4 w-4" />
                  Start New Study
                </div>
                <p className="text-sm text-muted-foreground">
                  Anyone can create a study in SaaS mode. You become study owner and can add sites + teams.
                </p>
                <Link href="/dashboard/studies/new" className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-3")}>
                  Create Study
                </Link>
              </article>

              <article className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <UserRoundPlus className="h-4 w-4" />
                  Join Existing Study
                </div>
                <p className="text-sm text-muted-foreground">
                  Ask a study owner or site admin to assign you to their site team for operational access.
                </p>
                <Link href="/profile" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}>
                  Share My Profile
                </Link>
              </article>

              <article className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  Access Checklist
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>1. Confirm your account email in profile.</li>
                  <li>2. Get added to site team by owner/admin.</li>
                  <li>3. Refresh and open Site Team Workspace.</li>
                </ul>
              </article>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
