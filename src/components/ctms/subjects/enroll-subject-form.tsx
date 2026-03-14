"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EnumDropdown } from "@/components/shared/enum-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSubject } from "@/hooks/use-subjects";
import { getErrorMessage } from "@/lib/utils";
import { SUBJECT_STATUSES, subjectCreateSchema, type SubjectCreateInput } from "@/types/schemas";

interface EnrollSubjectFormProps {
  studyId: string;
  siteId: string;
}

export function EnrollSubjectForm({ studyId, siteId }: EnrollSubjectFormProps) {
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
    },
  });

  const { register, handleSubmit, formState, watch, setValue } = form;
  const statusValue = watch("status") ?? "screened";

  async function onSubmit(values: SubjectCreateInput) {
    try {
      await createSubject.mutateAsync({
        ...values,
        initials: values.initials || null,
        screen_date: values.screen_date || null,
        enrollment_date: values.enrollment_date || null,
        completion_date: values.completion_date || null,
        withdrawal_reason: values.withdrawal_reason || null,
      });

      toast.success("Subject enrolled.");
      router.push(`/dashboard/studies/${studyId}/subjects`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to enroll subject."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input type="hidden" {...register("study_id")} />
      <Input type="hidden" {...register("site_id")} />
      <Input type="hidden" {...register("status")} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subject_number">Subject Number</Label>
          <Input id="subject_number" placeholder="e.g. 001-003" {...register("subject_number")} />
          {formState.errors.subject_number ? (
            <p className="text-sm text-destructive">{formState.errors.subject_number.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="initials">Initials</Label>
          <Input id="initials" placeholder="e.g. J.D." {...register("initials")} />
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
        </div>
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
