import { z } from "zod";

export const SIGNATURE_TABLES = ["documents", "deviations", "monitoring_visits"] as const;

export const signatureCreateSchema = z.object({
  table_name: z.enum(SIGNATURE_TABLES),
  record_id: z.string().uuid(),
  reason: z.string().trim().min(3, "Reason is required."),
  meaning: z.string().trim().min(2, "Meaning is required."),
  password: z.string().min(1, "Password is required."),
});

export const signatureRecordQuerySchema = z.object({
  table_name: z.enum(SIGNATURE_TABLES),
});

export type SignatureCreateInput = z.input<typeof signatureCreateSchema>;
