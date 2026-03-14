import { z } from "zod";

export const MILESTONE_STATUSES = ["pending", "at_risk", "completed", "missed"] as const;
export const MILESTONE_COMPLETION_STATUSES = ["completed", "missed"] as const;

export const milestoneCreateSchema = z.object({
  study_id: z.string().uuid(),
  name: z.string().trim().min(1, "Milestone name is required."),
  description: z.string().trim().optional().nullable(),
  planned_date: z.string().optional().nullable(),
  actual_date: z.string().optional().nullable(),
  status: z.enum(MILESTONE_STATUSES).optional().default("pending"),
  site_id: z.string().uuid().optional().nullable(),
  assignee_user_id: z.string().uuid().optional().nullable(),
  board_order: z.number().int().nonnegative().optional(),
});

export const milestoneUpdateSchema = milestoneCreateSchema
  .omit({ study_id: true })
  .partial()
  .refine(
    (value) => {
      if (value.name === undefined) return true;
      return value.name.trim().length > 0;
    },
    { message: "Milestone name is required.", path: ["name"] }
  );

export const milestoneCompleteSchema = z.object({
  status: z.enum(MILESTONE_COMPLETION_STATUSES).optional().default("completed"),
  actual_date: z.string().optional().nullable(),
});

export type MilestoneCreateInput = z.input<typeof milestoneCreateSchema>;
export type MilestoneUpdateInput = z.input<typeof milestoneUpdateSchema>;
export type MilestoneCompleteInput = z.input<typeof milestoneCompleteSchema>;
