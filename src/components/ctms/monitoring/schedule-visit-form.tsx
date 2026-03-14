"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScheduleMonitoringVisit } from "@/hooks/use-monitoring-visits";
import { getErrorMessage } from "@/lib/utils";
import { MONITORING_VISIT_TYPES, monitoringVisitCreateSchema, type MonitoringVisitCreateInput } from "@/types/schemas";
import type { Site } from "@/types/database";

interface ScheduleVisitFormProps {
  studyId: string;
  sites: Site[];
}

export function ScheduleVisitForm({ studyId, sites }: ScheduleVisitFormProps) {
  const scheduleVisit = useScheduleMonitoringVisit(studyId);

  const form = useForm<MonitoringVisitCreateInput>({
    resolver: zodResolver(monitoringVisitCreateSchema),
    defaultValues: {
      study_id: studyId,
      site_id: sites[0]?.id ?? "",
      monitor_id: null,
      visit_type: "IMV",
      planned_date: "",
      report_due_date: null,
      findings_summary: null,
      subjects_reviewed: 0,
    },
  });

  const { register, handleSubmit, formState } = form;

  async function onSubmit(values: MonitoringVisitCreateInput) {
    try {
      await scheduleVisit.mutateAsync({
        ...values,
        report_due_date: values.report_due_date || null,
        findings_summary: values.findings_summary || null,
        subjects_reviewed: values.subjects_reviewed ?? 0,
      });

      toast.success("Visit scheduled.");
      form.reset({
        study_id: studyId,
        site_id: sites[0]?.id ?? "",
        monitor_id: null,
        visit_type: "IMV",
        planned_date: "",
        report_due_date: null,
        findings_summary: null,
        subjects_reviewed: 0,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to schedule visit."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 rounded-lg border p-4 md:grid-cols-12">
      <Input type="hidden" {...register("study_id")} />

      <div className="md:col-span-3 space-y-1">
        <Label htmlFor="site_id">Site</Label>
        <select
          id="site_id"
          {...register("site_id")}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.site_number} · {site.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 space-y-1">
        <Label htmlFor="visit_type">Type</Label>
        <select
          id="visit_type"
          {...register("visit_type")}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          {MONITORING_VISIT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 space-y-1">
        <Label htmlFor="planned_date">Planned Date</Label>
        <Input id="planned_date" type="date" {...register("planned_date")} />
        {formState.errors.planned_date ? (
          <p className="text-xs text-destructive">{formState.errors.planned_date.message}</p>
        ) : null}
      </div>

      <div className="md:col-span-2 space-y-1">
        <Label htmlFor="report_due_date">Report Due</Label>
        <Input id="report_due_date" type="date" {...register("report_due_date")} />
      </div>

      <div className="md:col-span-1 space-y-1">
        <Label htmlFor="subjects_reviewed">Subjects</Label>
        <Input id="subjects_reviewed" type="number" {...register("subjects_reviewed", { valueAsNumber: true })} />
      </div>

      <div className="md:col-span-2 flex items-end">
        <Button type="submit" loading={scheduleVisit.isPending} loadingText="Scheduling..." className="w-full">
          Schedule
        </Button>
      </div>

      <div className="md:col-span-12 space-y-1">
        <Label htmlFor="findings_summary">Planned focus (optional)</Label>
        <Input id="findings_summary" {...register("findings_summary")} placeholder="e.g. Source data verification" />
      </div>
    </form>
  );
}
