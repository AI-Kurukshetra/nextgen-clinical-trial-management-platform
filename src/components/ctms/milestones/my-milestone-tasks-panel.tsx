"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MilestoneStatusBadge } from "@/components/ctms/milestones/milestone-status-badge";
import { useMyMilestones, useUpdateMilestone } from "@/hooks/use-milestones";
import { getErrorMessage } from "@/lib/utils";
import type { MilestoneTask } from "@/types/milestone-task";

interface MyMilestoneTasksPanelProps {
  title?: string;
  description?: string;
}

function MilestoneTaskRow({
  task,
  onComplete,
  isPending,
}: {
  task: MilestoneTask;
  onComplete: (task: MilestoneTask) => void;
  isPending: boolean;
}) {
  return (
    <article className="rounded-md border bg-background p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="font-medium">{task.name}</p>
          <p className="text-xs text-muted-foreground">
            Study: {task.study?.protocol_number ?? "N/A"} · {task.study?.title ?? "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground">
            Clinic: {task.site ? `${task.site.site_number} · ${task.site.name}` : "Not assigned"} · Planned:{" "}
            {task.planned_date ?? "-"}
          </p>
        </div>
        <MilestoneStatusBadge status={task.status} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Link href={`/dashboard/studies/${task.study_id}/milestones`} className="text-xs underline text-muted-foreground">
          Open board
        </Link>
        {task.permissions.can_complete && task.status !== "completed" ? (
          <Button size="sm" onClick={() => onComplete(task)} loading={isPending}>
            Mark Complete
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function MyMilestoneTasksPanel({
  title = "My Milestone Tasks",
  description = "Tasks assigned directly to you or your clinic.",
}: MyMilestoneTasksPanelProps) {
  const { data, isLoading, isError, error } = useMyMilestones();
  const updateMilestone = useUpdateMilestone();

  async function handleComplete(task: MilestoneTask) {
    try {
      await updateMilestone.mutateAsync({
        milestoneId: task.id,
        input: { status: "completed", actual_date: new Date().toISOString().slice(0, 10) },
      });
      toast.success("Milestone marked complete.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to complete milestone task."));
    }
  }

  const tasks = data ?? [];

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading assigned milestone tasks...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load milestone tasks.")}</p> : null}

      <div className="space-y-2">
        {tasks.map((task) => (
          <MilestoneTaskRow
            key={task.id}
            task={task}
            onComplete={handleComplete}
            isPending={updateMilestone.isPending}
          />
        ))}
        {!isLoading && tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assigned milestone tasks.</p>
        ) : null}
      </div>
    </section>
  );
}

