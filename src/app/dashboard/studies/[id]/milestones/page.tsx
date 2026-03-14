"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { MilestoneKanbanBoard } from "@/components/ctms/milestones/milestone-kanban-board";
import { MilestoneTaskFormDialog } from "@/components/ctms/milestones/milestone-task-form-dialog";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { Button } from "@/components/ui/button";
import { useSites } from "@/hooks/use-sites";
import { useCreateMilestone, useDeleteMilestone, useMilestones, useUpdateMilestone } from "@/hooks/use-milestones";
import { getErrorMessage } from "@/lib/utils";
import type { MilestoneTask } from "@/types/milestone-task";
import type { MilestoneCreateInput } from "@/types/schemas";

export default function StudyMilestonesPage() {
  const params = useParams<{ id: string }>();
  const studyId = params.id;

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MilestoneTask | null>(null);

  const { data: milestones, isLoading, isError, error } = useMilestones(studyId);
  const { data: sites } = useSites(studyId);
  const createMilestone = useCreateMilestone(studyId);
  const updateMilestone = useUpdateMilestone(studyId);
  const deleteMilestone = useDeleteMilestone(studyId);

  async function onCreate(values: MilestoneCreateInput) {
    try {
      await createMilestone.mutateAsync({
        ...values,
      });
      toast.success("Milestone task created.");
      setCreateOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create milestone task."));
    }
  }

  async function onEdit(values: MilestoneCreateInput) {
    if (!editingTask) return;
    try {
      await updateMilestone.mutateAsync({
        milestoneId: editingTask.id,
        input: {
          name: values.name,
          description: values.description ?? null,
          planned_date: values.planned_date ?? null,
          actual_date: values.actual_date ?? null,
          status: values.status,
          site_id: values.site_id ?? null,
          assignee_user_id: values.assignee_user_id ?? null,
          board_order: values.board_order,
        },
      });
      toast.success("Milestone task updated.");
      setEditingTask(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update milestone task."));
    }
  }

  async function onComplete(task: MilestoneTask) {
    try {
      await updateMilestone.mutateAsync({
        milestoneId: task.id,
        input: {
          status: "completed",
          actual_date: new Date().toISOString().slice(0, 10),
        },
      });
      toast.success("Milestone marked complete.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to complete milestone task."));
    }
  }

  async function onDelete(task: MilestoneTask) {
    const confirmed = window.confirm(`Delete milestone task "${task.name}"?`);
    if (!confirmed) return;
    try {
      await deleteMilestone.mutateAsync(task.id);
      toast.success("Milestone task deleted.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete milestone task."));
    }
  }

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={studyId} />

      <div>
        <h2 className="text-xl font-semibold">Milestones</h2>
        <p className="text-sm text-muted-foreground">
          Trello-style milestone task board for assigning clinic/user ownership and driving completion.
        </p>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          Admin/study owners can create and assign tasks to a clinic or individual user. Assigned clinic members/users can
          mark tasks complete from their workspace.
        </p>
        <Button onClick={() => setCreateOpen(true)}>Add Milestone Task</Button>
      </section>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading milestones...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load milestones.")}</p> : null}

      {milestones && milestones.length > 0 ? (
        <MilestoneKanbanBoard
          tasks={milestones}
          onEdit={(task) => setEditingTask(task)}
          onComplete={onComplete}
          onDelete={onDelete}
          isUpdating={updateMilestone.isPending}
          isDeleting={deleteMilestone.isPending}
        />
      ) : (
        !isLoading && <p className="text-sm text-muted-foreground">No milestone tasks found.</p>
      )}

      <MilestoneTaskFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        studyId={studyId}
        sites={sites ?? []}
        isSubmitting={createMilestone.isPending}
        onSubmit={onCreate}
      />

      <MilestoneTaskFormDialog
        mode="edit"
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        studyId={studyId}
        sites={sites ?? []}
        task={editingTask}
        isSubmitting={updateMilestone.isPending}
        onSubmit={onEdit}
      />
    </div>
  );
}
