"use client";

import { useMemo } from "react";
import { MilestoneTaskCard } from "@/components/ctms/milestones/milestone-task-card";
import type { MilestoneTask } from "@/types/milestone-task";
import { MILESTONE_STATUSES } from "@/types/schemas";

interface MilestoneKanbanBoardProps {
  tasks: MilestoneTask[];
  onEdit: (task: MilestoneTask) => void;
  onComplete: (task: MilestoneTask) => void;
  onDelete: (task: MilestoneTask) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const STATUS_LABELS: Record<(typeof MILESTONE_STATUSES)[number], string> = {
  pending: "To Do",
  at_risk: "At Risk",
  completed: "Done",
  missed: "Missed",
};

export function MilestoneKanbanBoard({
  tasks,
  onEdit,
  onComplete,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: MilestoneKanbanBoardProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, MilestoneTask[]>();
    for (const status of MILESTONE_STATUSES) map.set(status, []);
    for (const task of tasks) {
      const bucket = map.get(task.status) ?? [];
      bucket.push(task);
      map.set(task.status, bucket);
    }
    for (const status of MILESTONE_STATUSES) {
      const rows = map.get(status) ?? [];
      rows.sort((a, b) => a.board_order - b.board_order || a.created_at.localeCompare(b.created_at));
      map.set(status, rows);
    }
    return map;
  }, [tasks]);

  return (
    <section className="grid gap-4 xl:grid-cols-4">
      {MILESTONE_STATUSES.map((status) => {
        const columnTasks = grouped.get(status) ?? [];

        return (
          <div key={status} className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {columnTasks.length}
              </span>
            </header>

            <div className="space-y-2">
              {columnTasks.map((task) => (
                <MilestoneTaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onComplete={onComplete}
                  onDelete={onDelete}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                />
              ))}
              {columnTasks.length === 0 ? (
                <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">No tasks in this lane.</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}

