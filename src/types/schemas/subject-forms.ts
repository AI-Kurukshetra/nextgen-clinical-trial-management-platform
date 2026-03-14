import { z } from "zod";

export const FORM_RECURRENCES = ["once", "daily", "weekly", "monthly", "ad_hoc"] as const;
export const FORM_ASSIGNMENT_STATUSES = ["assigned", "submitted", "overdue", "cancelled"] as const;

export const subjectFormTemplateCreateSchema = z.object({
  study_id: z.string().uuid(),
  site_id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(2, "Template name is required."),
  description: z.string().trim().max(2000).optional().nullable(),
  schema: z.record(z.string(), z.unknown()).default({}),
  is_active: z.boolean().optional().default(true),
});

export const subjectFormTemplateUpdateSchema = subjectFormTemplateCreateSchema
  .omit({ study_id: true })
  .partial();

export const subjectFormAssignmentCreateSchema = z.object({
  template_id: z.string().uuid(),
  study_id: z.string().uuid(),
  site_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  recurrence: z.enum(FORM_RECURRENCES).optional().default("ad_hoc"),
  due_at: z.string().datetime().optional().nullable(),
});

export const subjectFormSubmitSchema = z.object({
  assignment_id: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
  notes: z.string().trim().max(5000).optional().nullable(),
});

export const subjectPortalLinkCreateSchema = z.object({
  subject_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export type SubjectFormTemplateCreateInput = z.input<typeof subjectFormTemplateCreateSchema>;
export type SubjectFormTemplateUpdateInput = z.input<typeof subjectFormTemplateUpdateSchema>;
export type SubjectFormAssignmentCreateInput = z.input<typeof subjectFormAssignmentCreateSchema>;
export type SubjectFormSubmitInput = z.input<typeof subjectFormSubmitSchema>;
export type SubjectPortalLinkCreateInput = z.input<typeof subjectPortalLinkCreateSchema>;
