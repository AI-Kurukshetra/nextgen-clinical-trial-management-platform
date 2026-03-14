"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EnumDropdown } from "@/components/shared/enum-dropdown";
import { FormSection } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      cro_partner: initialStudy?.cro_partner ?? "",
      regulatory_reference: initialStudy?.regulatory_reference ?? "",
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
  const indicationValue = watch("indication") ?? "";

  const isPending = createStudy.isPending || updateStudy.isPending;

  async function onSubmit(values: StudyCreateInput) {
    const payload: StudyCreateInput = {
      ...values,
      therapeutic_area: values.therapeutic_area || null,
      sponsor_name: values.sponsor_name || null,
      cro_partner: values.cro_partner || null,
      regulatory_reference: values.regulatory_reference || null,
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

  const hasErrors = Object.keys(formState.errors).length > 0 && formState.isSubmitted;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input type="hidden" {...register("phase")} />
      <Input type="hidden" {...register("status")} />

      {hasErrors && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="mt-1 list-disc pl-4 space-y-0.5">
            {Object.values(formState.errors).map((err, i) => (
              <li key={i}>{err?.message as string}</li>
            ))}
          </ul>
        </div>
      )}

      <FormSection label="Protocol Information">
        <div className="space-y-2">
          <Label htmlFor="protocol_number">Protocol Number</Label>
          <Input
            id="protocol_number"
            {...register("protocol_number")}
            disabled={isPending}
            readOnly={mode === "edit"}
            className={mode === "edit" ? "bg-muted text-muted-foreground cursor-default" : ""}
            placeholder={mode === "create" ? "Auto-generated (e.g. ST-2026-0001)" : undefined}
          />
          {mode === "create" ? (
            <p className="text-xs text-muted-foreground">Leave blank to auto-generate.</p>
          ) : null}
          {formState.errors.protocol_number && (
            <p className="text-sm text-destructive">{formState.errors.protocol_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input id="title" {...register("title")} disabled={isPending} />
          {formState.errors.title && (
            <p className="text-sm text-destructive">{formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phase">
            Phase <span className="text-destructive">*</span>
          </Label>
          <EnumDropdown
            value={phaseValue}
            onChange={(value) => setValue("phase", value as (typeof STUDY_PHASES)[number], { shouldValidate: true })}
            options={STUDY_PHASES.map((phase) => ({ value: phase, label: phase }))}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-destructive">*</span>
          </Label>
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
          <Label htmlFor="therapeutic_area">Therapeutic Area</Label>
          <Input id="therapeutic_area" {...register("therapeutic_area")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sponsor_name">Sponsor</Label>
          <Input id="sponsor_name" {...register("sponsor_name")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cro_partner">CRO Partner</Label>
          <Input id="cro_partner" {...register("cro_partner")} disabled={isPending} placeholder="Optional" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="regulatory_reference">Regulatory Reference</Label>
          <Input
            id="regulatory_reference"
            {...register("regulatory_reference")}
            disabled={isPending}
            placeholder="IND / CTA number (optional)"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="indication">Indication</Label>
            <span className="text-xs text-muted-foreground">{indicationValue?.length ?? 0} / 2000</span>
          </div>
          <Textarea
            id="indication"
            {...register("indication")}
            disabled={isPending}
            rows={3}
            placeholder="Brief description of the condition being studied"
          />
          {formState.errors.indication && (
            <p className="text-sm text-destructive">{formState.errors.indication.message}</p>
          )}
        </div>
      </FormSection>

      <FormSection label="Timeline & Enrollment">
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
          <Label htmlFor="planned_start_date">Planned Start Date</Label>
          <Input id="planned_start_date" type="date" {...register("planned_start_date")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="planned_end_date">Planned End Date</Label>
          <Input id="planned_end_date" type="date" {...register("planned_end_date")} disabled={isPending} />
          {formState.errors.planned_end_date && (
            <p className="text-sm text-destructive">{formState.errors.planned_end_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="actual_start_date">Actual Start Date</Label>
          <Input id="actual_start_date" type="date" {...register("actual_start_date")} disabled={isPending} />
        </div>
      </FormSection>

      <Button type="submit" loading={isPending} loadingText="Saving...">
        {mode === "create" ? "Create Study" : "Save Changes"}
      </Button>
    </form>
  );
}
