import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { buildDocumentPublicUrl, buildDocumentS3Key, getUploadSignedUrl } from "@/lib/s3";
import { documentPresignSchema } from "@/types/schemas";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const body = await request.json();
  const normalized = {
    fileName: body.fileName,
    fileType: body.fileType,
    study_id: body.study_id ?? body.studyId,
    doc_type: body.doc_type ?? body.docType,
  };

  const parsed = documentPresignSchema.safeParse(normalized);
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const s3Key = buildDocumentS3Key({
    studyId: parsed.data.study_id,
    docType: parsed.data.doc_type,
    fileName: parsed.data.fileName,
  });

  const uploadUrl = await getUploadSignedUrl(s3Key, parsed.data.fileType);
  const publicUrl = buildDocumentPublicUrl(s3Key);

  return sendSuccess({ uploadUrl, s3Key, publicUrl }, 200);
}
