"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateDeviation } from "@/hooks/use-deviations";
import { getErrorMessage } from "@/lib/utils";
import { DEVIATION_STATUSES, deviationUpdateSchema, type DeviationUpdateInput } from "@/types/schemas";
import type { Deviation } from "@/types/database";

interface ResolveDeviationFormProps {
  studyId: string;
  deviation: Deviation;
}

export function ResolveDeviationForm({ studyId, deviation }: ResolveDeviationFormProps) {
  const updateDeviation = useUpdateDeviation(studyId, deviation.id);

  const form = useForm<DeviationUpdateInput>({
    resolver: zodResolver(deviationUpdateSchema),
    defaultValues: {
      status: deviation.status as DeviationUpdateInput["status"],
      resolved_date: deviation.resolved_date,
      root_cause: deviation.root_cause,
      corrective_action: deviation.corrective_action,
    },
  });

  const { register, handleSubmit } = form;

  async function onSubmit(values: DeviationUpdateInput) {
    try {
      await updateDeviation.mutateAsync(values);
      toast.success("Deviation updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update deviation."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2 rounded-lg border p-3 md:grid-cols-12">
      <div className="md:col-span-3 space-y-1">
        <Label>Status</Label>
        <select {...register("status")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
          {DEVIATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
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
      <div className="md:col-span-12">
        <Button type="submit" variant="outline" loading={updateDeviation.isPending} loadingText="Saving...">
          Save Resolution
        </Button>
      </div>
    </form>
  );
}
