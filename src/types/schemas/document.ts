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

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const uploadDocumentFormSchema = z.object({
  name: z.string().trim().min(1, "Document name is required."),
  doc_type: z.enum(DOCUMENT_TYPES),
  site_id: z.string().uuid().optional().or(z.literal("")),
  version: z.string().trim().min(1).default("1.0"),
  effective_date: z.string().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  file: z
    .custom<File>(
      (value) =>
        typeof File !== "undefined"
          ? value instanceof File
          : Boolean(value && typeof value === "object" && "name" in value && "size" in value),
      "Please choose a file."
    )
    .refine((value) => Number((value as { size?: number }).size ?? 0) > 0, "File cannot be empty.")
    .refine(
      (value) => ALLOWED_MIME_TYPES.includes((value as File).type),
      "Only PDF, DOCX, and XLSX files are accepted."
    )
    .refine(
      (value) => ((value as File).size ?? 0) <= MAX_FILE_SIZE_BYTES,
      "File size must be 50 MB or less."
    ),
});

export type DocumentPresignInput = z.input<typeof documentPresignSchema>;
export type DocumentCreateInput = z.input<typeof documentCreateSchema>;
export type DocumentUpdateInput = z.input<typeof documentUpdateSchema>;
export type UploadDocumentFormInput = z.input<typeof uploadDocumentFormSchema>;
export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES };
