import { z } from "zod";

export const MONITORING_VISIT_TYPES = ["SIV", "IMV", "COV", "Remote", "For_Cause"] as const;
export const MONITORING_VISIT_STATUSES = ["scheduled", "in_progress", "completed", "cancelled"] as const;

export const monitoringVisitCreateSchema = z.object({
  study_id: z.string().uuid(),
  site_id: z.string().uuid(),
  monitor_id: z.string().uuid().optional().nullable(),
  visit_type: z.enum(MONITORING_VISIT_TYPES),
  planned_date: z.string().min(1, "Planned date is required."),
  report_due_date: z.string().optional().nullable(),
  findings_summary: z.string().trim().optional().nullable(),
  subjects_reviewed: z.number().int().nonnegative().optional().nullable(),
});

export const monitoringVisitUpdateSchema = z.object({
  site_id: z.string().uuid().optional(),
  monitor_id: z.string().uuid().optional().nullable(),
  visit_type: z.enum(MONITORING_VISIT_TYPES).optional(),
  status: z.enum(MONITORING_VISIT_STATUSES).optional(),
  planned_date: z.string().optional().nullable(),
  actual_date: z.string().optional().nullable(),
  report_due_date: z.string().optional().nullable(),
  findings_summary: z.string().trim().optional().nullable(),
  subjects_reviewed: z.number().int().nonnegative().optional().nullable(),
});

export type MonitoringVisitCreateInput = z.input<typeof monitoringVisitCreateSchema>;
export type MonitoringVisitUpdateInput = z.input<typeof monitoringVisitUpdateSchema>;
