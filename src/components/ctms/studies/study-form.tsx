"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EnumDropdown } from "@/components/shared/enum-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateStudy, useUpdateStudy } from "@/hooks/use-studies";
import { getErrorMessage } from "@/lib/utils";
import {
  STUDY_PHASES,
  STUDY_STATUSES,
  studyCreateSchema,
  type StudyCreateInput,
} from "@/types/schemas";
import type { Study } from "@/types/database";

interface StudyFormProps {
  mode: "create" | "edit";
  initialStudy?: Study;
}

export function StudyForm({ mode, initialStudy }: StudyFormProps) {
  const router = useRouter();
  const createStudy = useCreateStudy();
  const updateStudy = useUpdateStudy(initialStudy?.id ?? "");

  const form = useForm<StudyCreateInput>({
    resolver: zodResolver(studyCreateSchema),
    defaultValues: {
      protocol_number: initialStudy?.protocol_number ?? null,
      title: initialStudy?.title ?? "",
      phase: (initialStudy?.phase as (typeof STUDY_PHASES)[number]) ?? "Phase II",
      status: (initialStudy?.status as (typeof STUDY_STATUSES)[number]) ?? "setup",
      therapeutic_area: initialStudy?.therapeutic_area ?? "",
      sponsor_name: initialStudy?.sponsor_name ?? "",
      indication: initialStudy?.indication ?? "",
      target_enrollment: initialStudy?.target_enrollment ?? undefined,
      planned_start_date: initialStudy?.planned_start_date ?? null,
      planned_end_date: initialStudy?.planned_end_date ?? null,
      actual_start_date: initialStudy?.actual_start_date ?? null,
    },
  });

  const { register, handleSubmit, formState, watch, setValue } = form;
  const phaseValue = watch("phase") ?? "Phase II";
  const statusValue = watch("status") ?? "setup";

  async function onSubmit(values: StudyCreateInput) {
    const payload: StudyCreateInput = {
      ...values,
      therapeutic_area: values.therapeutic_area || null,
      sponsor_name: values.sponsor_name || null,
      indication: values.indication || null,
      planned_start_date: values.planned_start_date || null,
      planned_end_date: values.planned_end_date || null,
      actual_start_date: values.actual_start_date || null,
      target_enrollment: values.target_enrollment ?? null,
    };

    try {
      if (mode === "create") {
        const study = await createStudy.mutateAsync(payload);
        toast.success("Study created.");
        router.push(`/dashboard/studies/${study.id}`);
        return;
      }

      const study = await updateStudy.mutateAsync(payload);
      toast.success("Study updated.");
      router.push(`/dashboard/studies/${study.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save study."));
    }
  }

  const isPending = createStudy.isPending || updateStudy.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input type="hidden" {...register("phase")} />
        <Input type="hidden" {...register("status")} />
        <div className="space-y-2">
          <Label htmlFor="protocol_number">Protocol Number</Label>
          <Input
            id="protocol_number"
            {...register("protocol_number")}
            disabled={isPending}
            placeholder={mode === "create" ? "Auto-generated (e.g. ST-2026-0001)" : undefined}
          />
          {mode === "create" ? (
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-generate. You can still provide a custom protocol number.
            </p>
          ) : null}
          {formState.errors.protocol_number ? (
            <p className="text-sm text-destructive">{formState.errors.protocol_number.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} disabled={isPending} />
          {formState.errors.title ? (
            <p className="text-sm text-destructive">{formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phase">Phase</Label>
          <EnumDropdown
            value={phaseValue}
            onChange={(value) => setValue("phase", value as (typeof STUDY_PHASES)[number], { shouldValidate: true })}
            options={STUDY_PHASES.map((phase) => ({ value: phase, label: phase }))}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <EnumDropdown
            value={statusValue}
            onChange={(value) =>
              setValue("status", value as (typeof STUDY_STATUSES)[number], { shouldValidate: true })
            }
            options={STUDY_STATUSES.map((status) => ({ value: status, label: status.replaceAll("_", " ") }))}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">Use setup until activation milestones are complete.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_enrollment">Target Enrollment</Label>
          <Input
            id="target_enrollment"
            type="number"
            {...register("target_enrollment", { valueAsNumber: true })}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sponsor_name">Sponsor</Label>
          <Input id="sponsor_name" {...register("sponsor_name")} disabled={isPending} />
        </div>
      </div>

      <Button type="submit" loading={isPending} loadingText="Saving...">
        {mode === "create" ? "Create Study" : "Save Changes"}
      </Button>
    </form>
  );
}
