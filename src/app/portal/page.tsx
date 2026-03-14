"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortalAssignments, useSubmitSubjectForm } from "@/hooks/use-subject-forms";
import { getErrorMessage } from "@/lib/utils";

export default function PortalPage() {
  const { data: assignments, isLoading, isError, error } = usePortalAssignments();
  const submitForm = useSubmitSubjectForm();
  const [answersById, setAnswersById] = useState<Record<string, string>>({});
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  async function onSubmit(assignmentId: string) {
    const raw = answersById[assignmentId] ?? "{}";
    let answers: Record<string, unknown> = {};
    try {
      answers = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      toast.error("Answers must be valid JSON.");
      return;
    }

    try {
      await submitForm.mutateAsync({
        assignment_id: assignmentId,
        answers,
        notes: notesById[assignmentId] || null,
      });
      toast.success("Entry submitted.");
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, "Failed to submit entry."));
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Patient Trial Portal</h1>
        <p className="text-sm text-muted-foreground">
          Submit your assigned daily/weekly trial forms (for example meal data and side-effect logs).
        </p>
      </header>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading assignments...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load assignments.")}</p> : null}

      {!isLoading && !isError && (assignments?.length ?? 0) === 0 ? (
        <section className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
          No forms assigned yet. Please contact your site coordinator.
        </section>
      ) : null}

      <div className="space-y-4">
        {(assignments ?? []).map((assignment) => (
          <section key={assignment.id} className="rounded-lg border p-4">
            <h2 className="font-semibold">{assignment.template?.name ?? "Assigned Form"}</h2>
            <p className="text-sm text-muted-foreground">
              Status: {assignment.status} · Recurrence: {assignment.recurrence}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Expected fields schema (for reference): {JSON.stringify(assignment.template?.schema ?? {})}
            </p>

            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <Label>Answers JSON</Label>
                <Input
                  value={answersById[assignment.id] ?? "{}"}
                  onChange={(event) =>
                    setAnswersById((prev) => ({ ...prev, [assignment.id]: event.target.value }))
                  }
                  placeholder='{"meal_quality":"good","side_effects":"none","appetite_score":8}'
                />
              </div>
              <div className="space-y-1">
                <Label>Notes (optional)</Label>
                <Input
                  value={notesById[assignment.id] ?? ""}
                  onChange={(event) =>
                    setNotesById((prev) => ({ ...prev, [assignment.id]: event.target.value }))
                  }
                  placeholder="Any additional comments"
                />
              </div>
              <Button onClick={() => onSubmit(assignment.id)} loading={submitForm.isPending}>
                Submit Entry
              </Button>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
