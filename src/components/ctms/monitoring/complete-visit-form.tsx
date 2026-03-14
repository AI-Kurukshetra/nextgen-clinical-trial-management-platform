"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateMonitoringVisit } from "@/hooks/use-monitoring-visits";
import { getErrorMessage } from "@/lib/utils";
import type { MonitoringVisit } from "@/types/database";
import {
  MONITORING_VISIT_STATUSES,
  monitoringVisitUpdateSchema,
  type MonitoringVisitUpdateInput,
} from "@/types/schemas";

interface CompleteVisitFormProps {
  studyId: string;
  visit: MonitoringVisit;
}

export function CompleteVisitForm({ studyId, visit }: CompleteVisitFormProps) {
  const updateVisit = useUpdateMonitoringVisit(studyId, visit.id);
  const safeStatus =
    MONITORING_VISIT_STATUSES.find((status) => status === visit.status) ?? "scheduled";

  const form = useForm<MonitoringVisitUpdateInput>({
    resolver: zodResolver(monitoringVisitUpdateSchema),
    defaultValues: {
      status: safeStatus,
      actual_date: visit.actual_date,
      report_due_date: visit.report_due_date,
      subjects_reviewed: visit.subjects_reviewed,
      findings_summary: visit.findings_summary,
    },
  });

  const { register, handleSubmit } = form;

  async function onSubmit(values: MonitoringVisitUpdateInput) {
    try {
      await updateVisit.mutateAsync(values);
      toast.success("Visit updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update visit."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2 rounded-lg border p-3 md:grid-cols-12">
      <div className="md:col-span-2 space-y-1">
        <Label>Status</Label>
        <select
          {...register("status")}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          <option value={safeStatus}>{safeStatus.replaceAll("_", " ")}</option>
          {MONITORING_VISIT_STATUSES.filter((status) => status !== safeStatus).map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2 space-y-1">
        <Label>Actual Date</Label>
        <Input type="date" {...register("actual_date")} />
      </div>
      <div className="md:col-span-2 space-y-1">
        <Label>Report Due</Label>
        <Input type="date" {...register("report_due_date")} />
      </div>
      <div className="md:col-span-2 space-y-1">
        <Label>Subjects Reviewed</Label>
        <Input type="number" {...register("subjects_reviewed", { valueAsNumber: true })} />
      </div>
      <div className="md:col-span-4 space-y-1">
        <Label>Findings Summary</Label>
        <Input {...register("findings_summary")} />
      </div>
      <div className="md:col-span-12">
        <Button type="submit" variant="outline" loading={updateVisit.isPending} loadingText="Saving...">
          Save Visit Update
        </Button>
      </div>
    </form>
  );
}
