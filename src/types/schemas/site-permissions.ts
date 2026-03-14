import { SITE_MEMBER_ROLES } from "@/constants/permissions";
import { z } from "zod";

export const siteMemberCreateSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(SITE_MEMBER_ROLES).default("viewer"),
  permission_mask: z.number().int().nonnegative().optional(),
});

export const siteMemberUpdateSchema = z.object({
  role: z.enum(SITE_MEMBER_ROLES).optional(),
  permission_mask: z.number().int().nonnegative().optional(),
});

export const subjectAssignmentCreateSchema = z.object({
  subject_id: z.string().uuid(),
  assignee_user_id: z.string().uuid(),
  assignment_role: z.string().trim().min(1).max(50).default("nurse"),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type SiteMemberCreateInput = z.input<typeof siteMemberCreateSchema>;
export type SiteMemberUpdateInput = z.input<typeof siteMemberUpdateSchema>;
export type SubjectAssignmentCreateInput = z.input<typeof subjectAssignmentCreateSchema>;
