import { z } from "zod";

export const DEVIATION_CATEGORIES = [
  "protocol",
  "gcp",
  "informed_consent",
  "ip_handling",
  "eligibility",
  "visit_window",
  "other",
] as const;

export const DEVIATION_SEVERITIES = ["minor", "major", "critical"] as const;
export const DEVIATION_STATUSES = ["open", "under_review", "resolved", "closed"] as const;

export const deviationCreateSchema = z.object({
  study_id: z.string().uuid(),
  site_id: z.string().uuid(),
  subject_id: z.string().uuid().optional().nullable(),
  deviation_number: z.string().trim().min(1, "Deviation number is required."),
  category: z.enum(DEVIATION_CATEGORIES),
  description: z.string().trim().min(1, "Description is required."),
  severity: z.enum(DEVIATION_SEVERITIES).optional().default("minor"),
  status: z.enum(DEVIATION_STATUSES).optional().default("open"),
  reported_date: z.string().optional().nullable(),
  resolved_date: z.string().optional().nullable(),
  root_cause: z.string().trim().optional().nullable(),
  corrective_action: z.string().trim().optional().nullable(),
});

export const deviationUpdateSchema = deviationCreateSchema
  .omit({ study_id: true, deviation_number: true, site_id: true })
  .partial()
  .extend({
    site_id: z.string().uuid().optional(),
  });

export type DeviationCreateInput = z.input<typeof deviationCreateSchema>;
export type DeviationUpdateInput = z.input<typeof deviationUpdateSchema>;
