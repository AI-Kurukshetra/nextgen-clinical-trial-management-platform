"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EnumDropdown } from "@/components/shared/enum-dropdown";
import { FormSection } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE_STATUSES, siteCreateSchema, type SiteCreateInput } from "@/types/schemas";
import { useCreateSite, useUpdateSite } from "@/hooks/use-sites";
import { getErrorMessage } from "@/lib/utils";
import type { Site } from "@/types/database";

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "CH", label: "Switzerland" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "ZA", label: "South Africa" },
  { value: "OTHER", label: "Other" },
];

interface SiteFormProps {
  studyId: string;
  mode: "create" | "edit";
  initialSite?: Site;
  studyTargetEnrollment?: number | null;
}

export function SiteForm({ studyId, mode, initialSite, studyTargetEnrollment }: SiteFormProps) {
  const router = useRouter();
  const createSite = useCreateSite(studyId);
  const updateSite = useUpdateSite(initialSite?.id ?? "", studyId);

  const form = useForm<SiteCreateInput>({
    resolver: zodResolver(siteCreateSchema),
    defaultValues: {
      study_id: studyId,
      site_number: initialSite?.site_number ?? null,
      name: initialSite?.name ?? "",
      address: initialSite?.address ?? "",
      city: initialSite?.city ?? "",
      state: initialSite?.state ?? "",
      postal_code: initialSite?.postal_code ?? "",
      country: initialSite?.country ?? "US",
      status: (initialSite?.status as (typeof SITE_STATUSES)[number]) ?? "identified",
      principal_investigator_name: initialSite?.principal_investigator_name ?? "",
      principal_investigator_email: initialSite?.principal_investigator_email ?? "",
      principal_investigator_phone: initialSite?.principal_investigator_phone ?? "",
      irb_number: initialSite?.irb_number ?? "",
      irb_approval_date: initialSite?.irb_approval_date ?? null,
      target_enrollment: initialSite?.target_enrollment ?? 0,
      initiated_date: initialSite?.initiated_date ?? null,
      closed_date: initialSite?.closed_date ?? null,
    },
  });

  const { register, handleSubmit, formState, watch, setValue } = form;
  const statusValue = watch("status") ?? "identified";
  const countryValue = watch("country") ?? "US";
  const targetEnrollmentValue = watch("target_enrollment");
  const isPending = createSite.isPending || updateSite.isPending;

  const enrollmentWarning =
    studyTargetEnrollment != null &&
    targetEnrollmentValue != null &&
    targetEnrollmentValue > studyTargetEnrollment;

  const hasErrors = Object.keys(formState.errors).length > 0 && formState.isSubmitted;

  async function onSubmit(values: SiteCreateInput) {
    const payload: SiteCreateInput = {
      ...values,
      study_id: studyId,
      site_number: values.site_number || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      postal_code: values.postal_code || null,
      principal_investigator_name: values.principal_investigator_name || null,
      principal_investigator_email: values.principal_investigator_email || null,
      principal_investigator_phone: values.principal_investigator_phone || null,
      irb_number: values.irb_number || null,
      irb_approval_date: values.irb_approval_date || null,
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

      const { study_id: _, ...updatePayload } = payload;
      const site = await updateSite.mutateAsync(updatePayload);
      toast.success("Site updated.");
      router.push(`/dashboard/studies/${studyId}/sites/${site.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save site."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input type="hidden" {...register("study_id")} />
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

      <FormSection label="Site Details">
        <div className="space-y-2">
          <Label htmlFor="site_number">Site Number</Label>
          <Input
            id="site_number"
            {...register("site_number")}
            disabled={isPending}
            placeholder={mode === "create" ? "Auto-generated (e.g. S-001)" : undefined}
          />
          {mode === "create" && (
            <p className="text-xs text-muted-foreground">Leave blank to auto-generate a site code.</p>
          )}
          {formState.errors.site_number && (
            <p className="text-sm text-destructive">{formState.errors.site_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">
            Site Name <span className="text-destructive">*</span>
          </Label>
          <Input id="name" {...register("name")} disabled={isPending} />
          {formState.errors.name && (
            <p className="text-sm text-destructive">{formState.errors.name.message}</p>
          )}
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
          <Label htmlFor="address">Street Address</Label>
          <Input id="address" {...register("address")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State / Province</Label>
          <Input id="state" {...register("state")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input id="postal_code" {...register("postal_code")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <select
            value={countryValue}
            onChange={(e) => setValue("country", e.target.value, { shouldValidate: true })}
            disabled={isPending}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </FormSection>

      <FormSection label="Principal Investigator">
        <div className="space-y-2">
          <Label htmlFor="principal_investigator_name">PI Name</Label>
          <Input id="principal_investigator_name" {...register("principal_investigator_name")} disabled={isPending} />
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
          <Label htmlFor="principal_investigator_phone">PI Phone</Label>
          <Input
            id="principal_investigator_phone"
            type="tel"
            {...register("principal_investigator_phone")}
            disabled={isPending}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="irb_number">IRB / Ethics Committee Number</Label>
          <Input id="irb_number" {...register("irb_number")} disabled={isPending} placeholder="Optional" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="irb_approval_date">IRB Approval Date</Label>
          <Input id="irb_approval_date" type="date" {...register("irb_approval_date")} disabled={isPending} />
        </div>
      </FormSection>

      <FormSection label="Enrollment & Timeline">
        <div className="space-y-2">
          <Label htmlFor="target_enrollment">Target Enrollment</Label>
          <Input
            id="target_enrollment"
            type="number"
            {...register("target_enrollment", { valueAsNumber: true })}
            disabled={isPending}
          />
          {enrollmentWarning && (
            <p className="text-sm text-amber-600">
              Site target ({targetEnrollmentValue}) exceeds study target ({studyTargetEnrollment}). Double-check before saving.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="initiated_date">Initiation Date</Label>
          <Input id="initiated_date" type="date" {...register("initiated_date")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closed_date">Close Date</Label>
          <Input id="closed_date" type="date" {...register("closed_date")} disabled={isPending} />
        </div>
      </FormSection>

      <Button type="submit" loading={isPending} loadingText="Saving...">
        {mode === "create" ? "Create Site" : "Save Site"}
      </Button>
    </form>
  );
}
