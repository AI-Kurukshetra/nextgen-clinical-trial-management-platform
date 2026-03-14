"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EnumDropdown } from "@/components/shared/enum-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE_STATUSES, siteCreateSchema, type SiteCreateInput } from "@/types/schemas";
import { useCreateSite, useUpdateSite } from "@/hooks/use-sites";
import { getErrorMessage } from "@/lib/utils";
import type { Site } from "@/types/database";

interface SiteFormProps {
  studyId: string;
  mode: "create" | "edit";
  initialSite?: Site;
}

export function SiteForm({ studyId, mode, initialSite }: SiteFormProps) {
  const router = useRouter();
  const createSite = useCreateSite(studyId);
  const updateSite = useUpdateSite(initialSite?.id ?? "", studyId);

  const form = useForm<SiteCreateInput>({
    resolver: zodResolver(siteCreateSchema),
    defaultValues: {
      study_id: studyId,
      site_number: initialSite?.site_number ?? null,
      name: initialSite?.name ?? "",
      city: initialSite?.city ?? "",
      country: initialSite?.country ?? "US",
      status: (initialSite?.status as (typeof SITE_STATUSES)[number]) ?? "identified",
      principal_investigator_name: initialSite?.principal_investigator_name ?? "",
      principal_investigator_email: initialSite?.principal_investigator_email ?? "",
      target_enrollment: initialSite?.target_enrollment ?? 0,
      initiated_date: initialSite?.initiated_date ?? null,
      closed_date: initialSite?.closed_date ?? null,
    },
  });

  const { register, handleSubmit, formState, watch, setValue } = form;
  const statusValue = watch("status") ?? "identified";
  const isPending = createSite.isPending || updateSite.isPending;

  async function onSubmit(values: SiteCreateInput) {
    const payload: SiteCreateInput = {
      ...values,
      study_id: studyId,
      site_number: values.site_number || null,
      city: values.city || null,
      principal_investigator_name: values.principal_investigator_name || null,
      principal_investigator_email: values.principal_investigator_email || null,
      initiated_date: values.initiated_date || null,
      closed_date: values.closed_date || null,
      target_enrollment: values.target_enrollment ?? 0,
    };

    try {
      if (mode === "create") {
        const site = await createSite.mutateAsync(payload);
        toast.success("Site created.");
        router.push(`/dashboard/studies/${studyId}/sites/${site.id}`);
        return;
      }

      const site = await updateSite.mutateAsync({
        site_number: payload.site_number,
        name: payload.name,
        city: payload.city,
        country: payload.country,
        status: payload.status,
        principal_investigator_name: payload.principal_investigator_name,
        principal_investigator_email: payload.principal_investigator_email,
        target_enrollment: payload.target_enrollment,
        initiated_date: payload.initiated_date,
        closed_date: payload.closed_date,
      });
      toast.success("Site updated.");
      router.push(`/dashboard/studies/${studyId}/sites/${site.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save site."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input type="hidden" {...register("study_id")} />
      <Input type="hidden" {...register("status")} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="site_number">Site Number</Label>
          <Input
            id="site_number"
            {...register("site_number")}
            disabled={isPending}
            placeholder={mode === "create" ? "Auto-generated (e.g. S-001)" : undefined}
          />
          {mode === "create" ? (
            <p className="text-xs text-muted-foreground">Leave blank to auto-generate a site code.</p>
          ) : null}
          {formState.errors.site_number ? (
            <p className="text-sm text-destructive">{formState.errors.site_number.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Site Name</Label>
          <Input id="name" {...register("name")} disabled={isPending} />
          {formState.errors.name ? (
            <p className="text-sm text-destructive">{formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <EnumDropdown
            value={statusValue}
            onChange={(value) => setValue("status", value as (typeof SITE_STATUSES)[number], { shouldValidate: true })}
            options={SITE_STATUSES.map((status) => ({ value: status, label: status.replaceAll("_", " ") }))}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} disabled={isPending} />
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
          <Label htmlFor="principal_investigator_name">Principal Investigator</Label>
          <Input
            id="principal_investigator_name"
            {...register("principal_investigator_name")}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="principal_investigator_email">PI Email</Label>
          <Input
            id="principal_investigator_email"
            type="email"
            {...register("principal_investigator_email")}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="initiated_date">Initiated Date</Label>
          <Input id="initiated_date" type="date" {...register("initiated_date")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closed_date">Closed Date</Label>
          <Input id="closed_date" type="date" {...register("closed_date")} disabled={isPending} />
        </div>
      </div>

      <Button type="submit" loading={isPending} loadingText="Saving...">
        {mode === "create" ? "Create Site" : "Save Site"}
      </Button>
    </form>
  );
}
