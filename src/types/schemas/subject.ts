import { z } from "zod";

export const SUBJECT_STATUSES = [
  "screened",
  "enrolled",
  "active",
  "completed",
  "withdrawn",
  "screen_failed",
  "lost_to_followup",
] as const;

const subjectBaseSchema = z.object({
  study_id: z.string().uuid(),
  site_id: z.string().uuid(),
  subject_number: z.string().trim().min(1, "Subject number is required."),
  initials: z.string().trim().max(10).optional().nullable(),
  status: z.enum(SUBJECT_STATUSES).optional().default("screened"),
  screen_date: z.string().optional().nullable(),
  enrollment_date: z.string().optional().nullable(),
  completion_date: z.string().optional().nullable(),
  withdrawal_reason: z.string().trim().optional().nullable(),
  screen_failure_reason: z.string().trim().optional().nullable(),
});

export const subjectCreateSchema = subjectBaseSchema
  .refine(
    (data) => {
      if (!data.screen_date || !data.enrollment_date) return true;
      return data.enrollment_date >= data.screen_date;
    },
    {
      message: "Enrollment date must be on or after screen date.",
      path: ["enrollment_date"],
    }
  )
  .refine(
    (data) => {
      if (!data.enrollment_date || !data.completion_date) return true;
      return data.completion_date >= data.enrollment_date;
    },
    {
      message: "Completion date must be on or after enrollment date.",
      path: ["completion_date"],
    }
  );

export const subjectUpdateSchema = subjectBaseSchema.omit({ study_id: true }).partial();

export type SubjectCreateInput = z.input<typeof subjectCreateSchema>;
export type SubjectUpdateInput = z.input<typeof subjectUpdateSchema>;
