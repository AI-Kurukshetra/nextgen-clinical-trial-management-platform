"use client";

import { Button } from "@/components/ui/button";
import { MilestoneStatusBadge } from "@/components/ctms/milestones/milestone-status-badge";
import { MilestoneVarianceBadge } from "@/components/ctms/milestones/milestone-variance-badge";
import type { MilestoneTask } from "@/types/milestone-task";

interface MilestoneTaskCardProps {
  task: MilestoneTask;
  onEdit: (task: MilestoneTask) => void;
  onComplete: (task: MilestoneTask) => void;
  onDelete: (task: MilestoneTask) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function MilestoneTaskCard({
  task,
  onEdit,
  onComplete,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: MilestoneTaskCardProps) {
  return (
    <article className="space-y-3 rounded-md border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold leading-snug">{task.name}</h4>
          {task.description ? <p className="text-xs text-muted-foreground">{task.description}</p> : null}
        </div>
        <MilestoneStatusBadge status={task.status} />
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Clinic: {task.site ? `${task.site.site_number} · ${task.site.name}` : "Not assigned"}</p>
        <p>Assignee: {task.assignee ? task.assignee.full_name ?? task.assignee.email ?? task.assignee.id : "Not assigned"}</p>
        <p>Planned: {task.planned_date ?? "-"}</p>
        <p>Actual: {task.actual_date ?? "-"}</p>
        <MilestoneVarianceBadge plannedDate={task.planned_date} actualDate={task.actual_date} />
      </div>

      <div className="flex flex-wrap gap-2">
        {task.permissions.can_edit ? (
          <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
            Edit
          </Button>
        ) : null}

        {task.permissions.can_complete && task.status !== "completed" ? (
          <Button size="sm" onClick={() => onComplete(task)} loading={isUpdating}>
            Mark Complete
          </Button>
        ) : null}

        {task.permissions.can_delete ? (
          <Button size="sm" variant="destructive" onClick={() => onDelete(task)} loading={isDeleting}>
            Delete
          </Button>
        ) : null}
      </div>
    </article>
  );
}

