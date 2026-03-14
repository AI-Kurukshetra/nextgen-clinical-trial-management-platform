import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const S3_BUCKET = process.env.S3_BUCKET_NAME ?? "ctms-documents";
export const S3_SIGNATURES_BUCKET = process.env.S3_SIGNATURES_BUCKET_NAME ?? "ctms-signatures";

function getS3Config() {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION ?? "us-east-1";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing S3 configuration. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY."
    );
  }

  return { endpoint, accessKeyId, secretAccessKey, region };
}

function getS3Client(): S3Client {
  const config = getS3Config();
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export function buildDocumentS3Key(input: {
  studyId: string;
  docType: string;
  fileName: string;
}): string {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${input.studyId}/${input.docType}/${Date.now()}_${safeName}`;
}

export function buildDocumentPublicUrl(key: string): string {
  const endpoint = process.env.S3_ENDPOINT ?? "";
  const S3_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? `${endpoint}/${S3_BUCKET}`;
  return `${S3_PUBLIC_BASE_URL}/${key}`;
}

export async function getUploadSignedUrl(key: string, contentType: string): Promise<string> {
  const s3Client = getS3Client();
  return getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 }
  );
}

export async function getDownloadSignedUrl(key: string): Promise<string> {
  const s3Client = getS3Client();
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
    { expiresIn: 300 }
  );
}
