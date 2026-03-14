import { z } from "zod";

export const DOCUMENT_TYPES = [
  "protocol",
  "icf",
  "investigator_brochure",
  "regulatory_submission",
  "monitoring_report",
  "deviation_report",
  "other",
] as const;

export const DOCUMENT_STATUSES = ["draft", "under_review", "approved", "superseded"] as const;

export const documentPresignSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required."),
  fileType: z.string().trim().min(1, "File type is required."),
  study_id: z.string().uuid("Valid study id is required."),
  doc_type: z.enum(DOCUMENT_TYPES),
});

export const documentCreateSchema = z.object({
  study_id: z.string().uuid("Valid study id is required."),
  site_id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1, "Document name is required."),
  doc_type: z.enum(DOCUMENT_TYPES),
  version: z.string().trim().min(1).default("1.0"),
  status: z.enum(DOCUMENT_STATUSES).default("draft"),
  file_url: z.string().url().optional().nullable(),
  file_size: z.number().int().nonnegative().optional().nullable(),
  file_mime: z.string().trim().optional().nullable(),
  s3_key: z.string().trim().optional().nullable(),
});

export const documentUpdateSchema = z.object({
  site_id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1, "Document name is required.").optional(),
  doc_type: z.enum(DOCUMENT_TYPES).optional(),
  version: z.string().trim().min(1).optional(),
  status: z.enum(DOCUMENT_STATUSES).optional(),
  file_url: z.string().url().optional().nullable(),
  file_size: z.number().int().nonnegative().optional().nullable(),
  file_mime: z.string().trim().optional().nullable(),
  s3_key: z.string().trim().optional().nullable(),
});

export const uploadDocumentFormSchema = z.object({
  name: z.string().trim().min(1, "Document name is required."),
  doc_type: z.enum(DOCUMENT_TYPES),
  site_id: z.string().uuid().optional().or(z.literal("")),
  version: z.string().trim().min(1).default("1.0"),
  file: z
    .custom<File>(
      (value) =>
        typeof File !== "undefined"
          ? value instanceof File
          : Boolean(value && typeof value === "object" && "name" in value && "size" in value),
      "Please choose a file."
    )
    .refine((value) => Number((value as { size?: number }).size ?? 0) > 0, "File cannot be empty."),
});

export type DocumentPresignInput = z.input<typeof documentPresignSchema>;
export type DocumentCreateInput = z.input<typeof documentCreateSchema>;
export type DocumentUpdateInput = z.input<typeof documentUpdateSchema>;
export type UploadDocumentFormInput = z.input<typeof uploadDocumentFormSchema>;
