import { z } from "zod";

export const SITE_STATUSES = [
  "identified",
  "selected",
  "initiated",
  "active",
  "closed",
  "terminated",
] as const;

export const siteCreateSchema = z.object({
  study_id: z.string().uuid(),
  site_number: z.string().trim().optional().nullable(),
  name: z.string().trim().min(1, "Site name is required."),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  postal_code: z.string().trim().optional().nullable(),
  country: z.string().trim().min(1).optional().default("US"),
  status: z.enum(SITE_STATUSES).optional().default("identified"),
  principal_investigator_name: z.string().trim().optional().nullable(),
  principal_investigator_email: z.string().trim().optional().nullable(),
  principal_investigator_phone: z.string().trim().optional().nullable(),
  irb_number: z.string().trim().optional().nullable(),
  irb_approval_date: z.string().optional().nullable(),
  target_enrollment: z.number().int().nonnegative().optional().nullable(),
  initiated_date: z.string().optional().nullable(),
  closed_date: z.string().optional().nullable(),
});

export const siteUpdateSchema = siteCreateSchema.omit({ study_id: true }).partial();

export type SiteCreateInput = z.input<typeof siteCreateSchema>;
export type SiteUpdateInput = z.input<typeof siteUpdateSchema>;
