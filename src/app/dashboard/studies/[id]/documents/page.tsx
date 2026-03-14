"use client";

import { useParams } from "next/navigation";
import { DocumentsTable } from "@/components/ctms/documents/documents-table";
import { UploadDocumentForm } from "@/components/ctms/documents/upload-document-form";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { useDocuments } from "@/hooks/use-documents";
import { getErrorMessage } from "@/lib/utils";

export default function StudyDocumentsPage() {
  const params = useParams<{ id: string }>();
  const studyId = params.id;

  const { data: documents, isLoading, isError, error } = useDocuments(studyId);

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={studyId} />

      <div>
        <h2 className="text-xl font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload and govern study documents with MinIO/S3-backed object storage and controlled status transitions.
        </p>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Upload flow: request presigned URL → upload directly to object storage → persist document metadata and audit log.
      </section>

      <UploadDocumentForm studyId={studyId} />

      {isLoading ? <p className="text-sm text-muted-foreground">Loading documents...</p> : null}
      {isError ? <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load documents.")}</p> : null}

      {!isLoading && !isError ? <DocumentsTable studyId={studyId} documents={documents ?? []} /> : null}
    </div>
  );
}
