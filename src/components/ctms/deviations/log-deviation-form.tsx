"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDeviation } from "@/hooks/use-deviations";
import { getErrorMessage } from "@/lib/utils";
import {
  DEVIATION_CATEGORIES,
  DEVIATION_SEVERITIES,
  DEVIATION_STATUSES,
  deviationCreateSchema,
  type DeviationCreateInput,
} from "@/types/schemas";
import type { Site, Subject } from "@/types/database";

interface LogDeviationFormProps {
  studyId: string;
  sites: Site[];
  subjects: Subject[];
}

export function LogDeviationForm({ studyId, sites, subjects }: LogDeviationFormProps) {
  const createDeviation = useCreateDeviation(studyId);

  const form = useForm<DeviationCreateInput>({
    resolver: zodResolver(deviationCreateSchema),
    defaultValues: {
      study_id: studyId,
      site_id: sites[0]?.id ?? "",
      subject_id: null,
      deviation_number: "",
      category: "protocol",
      description: "",
      severity: "minor",
      status: "open",
      reported_date: new Date().toISOString().slice(0, 10),
      resolved_date: null,
      root_cause: null,
      corrective_action: null,
    },
  });

  const { register, handleSubmit, formState } = form;

  async function onSubmit(values: DeviationCreateInput) {
    try {
      await createDeviation.mutateAsync({
        ...values,
        subject_id: values.subject_id || null,
        reported_date: values.reported_date || null,
        resolved_date: values.resolved_date || null,
        root_cause: values.root_cause || null,
        corrective_action: values.corrective_action || null,
      });

      toast.success("Deviation logged.");
      form.reset({
        study_id: studyId,
        site_id: sites[0]?.id ?? "",
        subject_id: null,
        deviation_number: "",
        category: "protocol",
        description: "",
        severity: "minor",
        status: "open",
        reported_date: new Date().toISOString().slice(0, 10),
        resolved_date: null,
        root_cause: null,
        corrective_action: null,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to log deviation."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 rounded-lg border p-4 md:grid-cols-12">
      <Input type="hidden" {...register("study_id")} />

      <div className="md:col-span-2 space-y-1">
        <Label>Deviation #</Label>
        <Input placeholder="DEV-..." {...register("deviation_number")} />
        {formState.errors.deviation_number ? (
          <p className="text-xs text-destructive">{formState.errors.deviation_number.message}</p>
        ) : null}
      </div>

      <div className="md:col-span-2 space-y-1">
        <Label>Site</Label>
        <select {...register("site_id")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.site_number} · {site.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 space-y-1">
        <Label>Subject</Label>
        <select {...register("subject_id")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
          <option value="">Not subject-specific</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subject_number}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 space-y-1">
        <Label>Category</Label>
        <select {...register("category")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
          {DEVIATION_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 space-y-1">
        <Label>Severity</Label>
        <select {...register("severity")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
          {DEVIATION_SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2 space-y-1">
        <Label>Status</Label>
        <select {...register("status")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
          {DEVIATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-10 space-y-1">
        <Label>Description</Label>
        <Input placeholder="Describe what happened" {...register("description")} />
      </div>

      <div className="md:col-span-2 flex items-end">
        <Button type="submit" loading={createDeviation.isPending} loadingText="Saving..." className="w-full">
          Log
        </Button>
      </div>

      <div className="md:col-span-3 space-y-1">
        <Label>Reported Date</Label>
        <Input type="date" {...register("reported_date")} />
      </div>

      <div className="md:col-span-3 space-y-1">
        <Label>Resolved Date</Label>
        <Input type="date" {...register("resolved_date")} />
      </div>

      <div className="md:col-span-3 space-y-1">
        <Label>Root Cause</Label>
        <Input {...register("root_cause")} />
      </div>

      <div className="md:col-span-3 space-y-1">
        <Label>Corrective Action</Label>
        <Input {...register("corrective_action")} />
      </div>
    </form>
  );
}
