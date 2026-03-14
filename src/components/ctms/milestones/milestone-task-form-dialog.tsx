"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useProfileSearch } from "@/hooks/use-site-members";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnumDropdown } from "@/components/shared/enum-dropdown";
import { MILESTONE_STATUSES, milestoneCreateSchema, type MilestoneCreateInput } from "@/types/schemas";
import type { MilestoneTask } from "@/types/milestone-task";
import type { Site } from "@/types/database";

interface MilestoneTaskFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studyId: string;
  sites: Site[];
  task?: MilestoneTask | null;
  isSubmitting?: boolean;
  onSubmit: (payload: MilestoneCreateInput) => Promise<void>;
}

export function MilestoneTaskFormDialog({
  mode,
  open,
  onOpenChange,
  studyId,
  sites,
  task,
  isSubmitting = false,
  onSubmit,
}: MilestoneTaskFormDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: candidates } = useProfileSearch(searchQuery);

  const siteOptions = useMemo(
    () => [
      { value: "", label: "No clinic assignment" },
      ...sites.map((site) => ({
        value: site.id,
        label: `${site.site_number} · ${site.name}`,
      })),
    ],
    [sites]
  );

  const statusOptions = useMemo(
    () =>
      MILESTONE_STATUSES.map((status) => ({
        value: status,
        label: status.replaceAll("_", " "),
      })),
    []
  );

  const form = useForm<MilestoneCreateInput>({
    resolver: zodResolver(milestoneCreateSchema),
    defaultValues: {
      study_id: studyId,
      name: "",
      description: null,
      planned_date: null,
      actual_date: null,
      status: "pending",
      site_id: null,
      assignee_user_id: null,
      board_order: 0,
    },
  });
  const currentDescription = useWatch({ control: form.control, name: "description" });
  const currentStatus = useWatch({ control: form.control, name: "status" });
  const currentSiteId = useWatch({ control: form.control, name: "site_id" });
  const currentAssigneeUserId = useWatch({ control: form.control, name: "assignee_user_id" });

  function handleDialogChange(nextOpen: boolean) {
    if (!nextOpen) setSearchQuery("");
    onOpenChange(nextOpen);
  }

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && task) {
      form.reset({
        study_id: studyId,
        name: task.name,
        description: task.description,
        planned_date: task.planned_date,
        actual_date: task.actual_date,
        status: task.status as (typeof MILESTONE_STATUSES)[number],
        site_id: task.site_id,
        assignee_user_id: task.assignee_user_id,
        board_order: task.board_order,
      });
      return;
    }

    form.reset({
      study_id: studyId,
      name: "",
      description: null,
      planned_date: null,
      actual_date: null,
      status: "pending",
      site_id: null,
      assignee_user_id: null,
      board_order: 0,
    });
  }, [form, mode, open, studyId, task]);

  async function handleSubmit(values: MilestoneCreateInput) {
    await onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      planned_date: values.planned_date || null,
      actual_date: values.actual_date || null,
      site_id: values.site_id || null,
      assignee_user_id: values.assignee_user_id || null,
      board_order: Number.isFinite(values.board_order) ? values.board_order : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Milestone Task" : "Edit Milestone Task"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new milestone task and assign it to a clinic and/or a user."
              : "Update task details, assignment, and board status."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input type="hidden" {...form.register("study_id")} />

          <div className="space-y-1">
            <Label>Task title</Label>
            <Input placeholder="e.g. Site 021 activation packet approved" {...form.register("name")} />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Add context, checklist, or dependencies."
              value={currentDescription ?? ""}
              onChange={(event) => form.setValue("description", event.target.value || null)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Status</Label>
              <EnumDropdown
                value={currentStatus ?? "pending"}
                onChange={(value) =>
                  form.setValue("status", value as (typeof MILESTONE_STATUSES)[number], {
                    shouldValidate: true,
                  })
                }
                options={statusOptions}
              />
            </div>
            <div className="space-y-1">
              <Label>Planned date</Label>
              <Input type="date" {...form.register("planned_date")} />
            </div>
            <div className="space-y-1">
              <Label>Actual date</Label>
              <Input type="date" {...form.register("actual_date")} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Assign clinic</Label>
              <EnumDropdown
                value={currentSiteId ?? ""}
                onChange={(value) => form.setValue("site_id", value || null)}
                options={siteOptions}
              />
            </div>
            <div className="space-y-1">
              <Label>Board order</Label>
              <Input type="number" min={0} {...form.register("board_order", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Assign user</Label>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search user by name/email..."
            />
            {searchQuery.trim().length >= 2 ? (
              <div className="max-h-32 overflow-y-auto rounded-md border bg-background p-1 text-xs">
                {(candidates ?? []).map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className="block w-full rounded px-2 py-1 text-left hover:bg-muted"
                    onClick={() => {
                      form.setValue("assignee_user_id", candidate.id, { shouldValidate: true });
                      setSearchQuery(candidate.full_name ?? candidate.email ?? candidate.id);
                    }}
                  >
                    {candidate.full_name ?? "Unnamed"} · {candidate.email ?? "no-email"}
                  </button>
                ))}
                {(candidates?.length ?? 0) === 0 ? <p className="px-2 py-1 text-muted-foreground">No users found.</p> : null}
              </div>
            ) : null}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Selected:{" "}
                {currentAssigneeUserId
                  ? task?.assignee_user_id === currentAssigneeUserId
                    ? task?.assignee?.full_name ?? task?.assignee?.email ?? currentAssigneeUserId
                    : currentAssigneeUserId
                  : "None"}
              </span>
              {currentAssigneeUserId ? (
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    form.setValue("assignee_user_id", null);
                    setSearchQuery("");
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} loadingText={mode === "create" ? "Creating..." : "Saving..."}>
              {mode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
