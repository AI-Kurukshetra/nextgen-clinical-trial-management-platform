"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EnumDropdown } from "@/components/shared/enum-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSubject } from "@/hooks/use-subjects";
import { getErrorMessage } from "@/lib/utils";
import { SUBJECT_STATUSES, subjectCreateSchema, type SubjectCreateInput } from "@/types/schemas";

interface EnrollSubjectFormProps {
  studyId: string;
  siteId: string;
  /** Site number prefix used to suggest subject_number format, e.g. "S-001" */
  siteNumber?: string;
}

export function EnrollSubjectForm({ studyId, siteId, siteNumber }: EnrollSubjectFormProps) {
  const router = useRouter();
  const createSubject = useCreateSubject(studyId, siteId);

  const form = useForm<SubjectCreateInput>({
    resolver: zodResolver(subjectCreateSchema),
    defaultValues: {
      study_id: studyId,
      site_id: siteId,
      subject_number: "",
      initials: "",
      status: "screened",
      screen_date: null,
      enrollment_date: null,
      completion_date: null,
      withdrawal_reason: null,
      screen_failure_reason: null,
    },
  });

  const { register, handleSubmit, formState, watch, setValue } = form;
  const statusValue = watch("status") ?? "screened";
  const isWithdrawn = statusValue === "withdrawn";
  const isScreenFailed = statusValue === "screen_failed";

  const hasErrors = Object.keys(formState.errors).length > 0 && formState.isSubmitted;

  async function onSubmit(values: SubjectCreateInput) {
    try {
      await createSubject.mutateAsync({
        ...values,
        initials: values.initials || null,
        screen_date: values.screen_date || null,
        enrollment_date: values.enrollment_date || null,
        completion_date: values.completion_date || null,
        withdrawal_reason: isWithdrawn ? (values.withdrawal_reason || null) : null,
        screen_failure_reason: isScreenFailed ? (values.screen_failure_reason || null) : null,
      });

      toast.success("Subject enrolled.");
      router.push(`/dashboard/studies/${studyId}/subjects`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to enroll subject."));
    }
  }

  const subjectNumberPlaceholder = siteNumber ? `${siteNumber}-001` : "e.g. S-001-001";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input type="hidden" {...register("study_id")} />
      <Input type="hidden" {...register("site_id")} />
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subject_number">
            Subject Number <span className="text-destructive">*</span>
          </Label>
          <Input id="subject_number" placeholder={subjectNumberPlaceholder} {...register("subject_number")} />
          <p className="text-xs text-muted-foreground">Format: {siteNumber ?? "SITE"}-NNN (site prefix + sequence).</p>
          {formState.errors.subject_number && (
            <p className="text-sm text-destructive">{formState.errors.subject_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="initials">Initials</Label>
          <Input id="initials" placeholder="e.g. JD" {...register("initials")} maxLength={10} />
          <p className="text-xs text-muted-foreground">2–3 letters only. No full names or PII.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <EnumDropdown
            value={statusValue}
            onChange={(value) =>
              setValue("status", value as (typeof SUBJECT_STATUSES)[number], { shouldValidate: true })
            }
            options={SUBJECT_STATUSES.map((status) => ({ value: status, label: status.replaceAll("_", " ") }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="screen_date">Screen Date</Label>
          <Input id="screen_date" type="date" {...register("screen_date")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="enrollment_date">Enrollment Date</Label>
          <Input id="enrollment_date" type="date" {...register("enrollment_date")} />
          {formState.errors.enrollment_date && (
            <p className="text-sm text-destructive">{formState.errors.enrollment_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="completion_date">Completion Date</Label>
          <Input id="completion_date" type="date" {...register("completion_date")} />
          {formState.errors.completion_date && (
            <p className="text-sm text-destructive">{formState.errors.completion_date.message}</p>
          )}
        </div>

        {isWithdrawn && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="withdrawal_reason">Withdrawal Reason</Label>
            <Textarea
              id="withdrawal_reason"
              {...register("withdrawal_reason")}
              placeholder="Describe why the subject withdrew from the study"
              rows={3}
            />
          </div>
        )}

        {isScreenFailed && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="screen_failure_reason">Screen Failure Reason</Label>
            <Textarea
              id="screen_failure_reason"
              {...register("screen_failure_reason")}
              placeholder="Describe the eligibility criteria not met"
              rows={3}
            />
          </div>
        )}
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Privacy rule: capture subject number and initials only. No full names, DOB, phone, or email.
      </section>

      <Button type="submit" loading={createSubject.isPending} loadingText="Enrolling...">
        Enroll Subject
      </Button>
    </form>
  );
}
