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

const studyBaseSchema = z.object({
  protocol_number: z.string().trim().optional().nullable(),
  title: z.string().trim().min(1, "Study title is required."),
  phase: z.enum(STUDY_PHASES),
  status: z.enum(STUDY_STATUSES),
  therapeutic_area: z.string().trim().optional().nullable(),
  sponsor_name: z.string().trim().optional().nullable(),
  cro_partner: z.string().trim().optional().nullable(),
  regulatory_reference: z.string().trim().optional().nullable(),
  indication: z.string().trim().max(2000, "Max 2000 characters.").optional().nullable(),
  target_enrollment: z.number().int().nonnegative().optional().nullable(),
  planned_start_date: z.string().optional().nullable(),
  planned_end_date: z.string().optional().nullable(),
  actual_start_date: z.string().optional().nullable(),
});

export const studyCreateSchema = studyBaseSchema.refine(
  (data) => {
    if (!data.planned_start_date || !data.planned_end_date) return true;
    return data.planned_end_date >= data.planned_start_date;
  },
  {
    message: "Planned end date must be on or after the start date.",
    path: ["planned_end_date"],
  }
);

export const studyUpdateSchema = studyBaseSchema.partial();

export type StudyCreateInput = z.input<typeof studyCreateSchema>;
export type StudyUpdateInput = z.input<typeof studyUpdateSchema>;
