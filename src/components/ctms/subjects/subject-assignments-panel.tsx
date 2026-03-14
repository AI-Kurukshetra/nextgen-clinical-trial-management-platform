"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useProfileSearch } from "@/hooks/use-site-members";
import {
  useCreateSubjectAssignment,
  useDeleteSubjectAssignment,
  useSubjectAssignments,
} from "@/hooks/use-subject-assignments";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnumDropdown } from "@/components/shared/enum-dropdown";
import type { Subject } from "@/types/database";

interface SubjectAssignmentsPanelProps {
  studyId: string;
  subjects: Subject[];
}

const ASSIGNMENT_ROLES = ["nurse", "doctor", "coordinator", "investigator", "viewer"] as const;

export function SubjectAssignmentsPanel({ studyId, subjects }: SubjectAssignmentsPanelProps) {
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [assignmentRole, setAssignmentRole] = useState<string>("nurse");
  const [notes, setNotes] = useState("");

  const { data: assignments } = useSubjectAssignments(studyId);
  const { data: candidates } = useProfileSearch(query);
  const createAssignment = useCreateSubjectAssignment(studyId);
  const deleteAssignment = useDeleteSubjectAssignment(studyId);

  const subjectOptions = useMemo(
    () =>
      subjects.map((subject) => ({
        value: subject.id,
        label: `${subject.subject_number} · ${subject.status.replaceAll("_", " ")}`,
      })),
    [subjects]
  );

  const roleOptions = useMemo(
    () => ASSIGNMENT_ROLES.map((role) => ({ value: role, label: role })),
    []
  );

  async function onAssign() {
    if (!subjectId || !assigneeUserId) {
      toast.error("Choose subject and assignee.");
      return;
    }

    try {
      await createAssignment.mutateAsync({
        subject_id: subjectId,
        assignee_user_id: assigneeUserId,
        assignment_role: assignmentRole,
        notes: notes || null,
      });
      toast.success("Subject assigned.");
      setQuery("");
      setAssigneeUserId("");
      setNotes("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to assign subject."));
    }
  }

  async function onRemove(id: string) {
    try {
      await deleteAssignment.mutateAsync(id);
      toast.success("Assignment removed.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove assignment."));
    }
  }

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="text-base font-semibold">Subject Responsibility Assignment</h3>
        <p className="text-sm text-muted-foreground">
          Assign each subject to a nurse/doctor/coordinator for operational ownership at the site.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 md:grid-cols-12">
        <div className="md:col-span-4 space-y-1">
          <Label>Subject</Label>
          <EnumDropdown
            value={subjectId}
            onChange={setSubjectId}
            options={subjectOptions}
            placeholder="Select subject"
            disabled={subjects.length === 0}
          />
        </div>

        <div className="md:col-span-3 space-y-1">
          <Label>Assignee search</Label>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search user..." />
          {query.length >= 2 ? (
            <div className="max-h-28 overflow-y-auto rounded-md border bg-background p-1 text-xs">
              {(candidates ?? []).map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className="block w-full rounded px-2 py-1 text-left hover:bg-muted"
                  onClick={() => {
                    setAssigneeUserId(candidate.id);
                    setQuery(candidate.email ?? candidate.full_name ?? candidate.id);
                  }}
                >
                  {candidate.full_name ?? "Unnamed"} · {candidate.email ?? "no-email"}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label>Role</Label>
          <EnumDropdown value={assignmentRole} onChange={setAssignmentRole} options={roleOptions} />
        </div>

        <div className="md:col-span-3 space-y-1">
          <Label>Notes</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" />
        </div>

        <div className="md:col-span-12 flex justify-end">
          <Button onClick={onAssign} loading={createAssignment.isPending} loadingText="Assigning...">
            Assign Subject
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {(assignments ?? []).map((assignment) => (
          <div
            key={assignment.id}
            className="flex flex-col gap-2 rounded-md border p-2 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                Subject: {assignment.subject?.subject_number ?? assignment.subject_id}
              </p>
              <p className="text-muted-foreground">
                Assignee:{" "}
                {assignment.assignee?.full_name ?? assignment.assignee?.email ?? assignment.assignee_user_id} · Role:{" "}
                {assignment.assignment_role}
              </p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => onRemove(assignment.id)} loading={deleteAssignment.isPending}>
              Remove
            </Button>
          </div>
        ))}

        {(assignments?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No assignments yet.</p>
        ) : null}
      </div>
    </section>
  );
}
