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

export const subjectCreateSchema = z.object({
  study_id: z.string().uuid(),
  site_id: z.string().uuid(),
  subject_number: z.string().trim().min(1, "Subject number is required."),
  initials: z.string().trim().max(10).optional().nullable(),
  status: z.enum(SUBJECT_STATUSES).optional().default("screened"),
  screen_date: z.string().optional().nullable(),
  enrollment_date: z.string().optional().nullable(),
  completion_date: z.string().optional().nullable(),
  withdrawal_reason: z.string().trim().optional().nullable(),
});

export const subjectUpdateSchema = subjectCreateSchema
  .omit({ study_id: true })
  .partial();

export type SubjectCreateInput = z.input<typeof subjectCreateSchema>;
export type SubjectUpdateInput = z.input<typeof subjectUpdateSchema>;
