import { z } from "zod";

export const STUDY_PHASES = [
  "Phase I",
  "Phase II",
  "Phase III",
  "Phase IV",
  "Observational",
] as const;

export const STUDY_STATUSES = [
  "setup",
  "active",
  "on_hold",
  "completed",
  "terminated",
] as const;

export const studyCreateSchema = z.object({
  protocol_number: z.string().trim().optional().nullable(),
  title: z.string().trim().min(1, "Study title is required."),
  phase: z.enum(STUDY_PHASES),
  status: z.enum(STUDY_STATUSES),
  therapeutic_area: z.string().trim().optional().nullable(),
  sponsor_name: z.string().trim().optional().nullable(),
  indication: z.string().trim().optional().nullable(),
  target_enrollment: z.number().int().nonnegative().optional().nullable(),
  planned_start_date: z.string().optional().nullable(),
  planned_end_date: z.string().optional().nullable(),
  actual_start_date: z.string().optional().nullable(),
});

export const studyUpdateSchema = studyCreateSchema.partial();

export type StudyCreateInput = z.input<typeof studyCreateSchema>;
export type StudyUpdateInput = z.input<typeof studyUpdateSchema>;
