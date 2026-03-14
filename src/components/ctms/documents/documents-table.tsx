"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SignDialog } from "@/components/ctms/signatures/sign-dialog";
import { SignaturesList } from "@/components/ctms/signatures/signatures-list";
import { QUERY_KEYS } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteDocument, useDownloadDocument, useUpdateDocument } from "@/hooks/use-documents";
import { getErrorMessage } from "@/lib/utils";
import type { Document } from "@/types/database";
import { DOCUMENT_STATUSES, type DocumentUpdateInput } from "@/types/schemas";
import { DocumentStatusBadge } from "@/components/ctms/documents/document-status-badge";
import { DocumentVersionBadge } from "@/components/ctms/documents/document-version-badge";
import { DocumentViewer } from "@/components/ctms/documents/document-viewer";

interface DocumentsTableProps {
  studyId: string;
  documents: Document[];
}

export function DocumentsTable({ studyId, documents }: DocumentsTableProps) {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const updateDocument = useUpdateDocument(studyId);
  const deleteDocument = useDeleteDocument(studyId);
  const downloadDocument = useDownloadDocument();

  async function handleStatusChange(document: Document, status: string) {
    if (!DOCUMENT_STATUSES.includes(status as (typeof DOCUMENT_STATUSES)[number])) return;
    if (status === "approved") {
      toast.info("Use 'Approve' to capture an electronic signature.");
      return;
    }
    setUpdatingId(document.id);
    try {
      const nextStatus = status as DocumentUpdateInput["status"];
      await updateDocument.mutateAsync({ id: document.id, input: { status: nextStatus } });
      toast.success("Document status updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update document."));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDownload(documentId: string) {
    try {
      const { downloadUrl } = await downloadDocument.mutateAsync(documentId);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to generate download URL."));
    }
  }

  async function handleDelete(documentId: string) {
    try {
      await deleteDocument.mutateAsync(documentId);
      toast.success("Document deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete document."));
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead>Size</TableHead>
          <TableHead className="w-[320px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <div className="font-medium">{doc.name}</div>
              <div className="text-xs text-muted-foreground">{doc.file_mime ?? "-"}</div>
            </TableCell>
            <TableCell>{doc.doc_type.replaceAll("_", " ")}</TableCell>
            <TableCell>
              <DocumentVersionBadge version={doc.version} />
            </TableCell>
            <TableCell>
              <DocumentStatusBadge status={doc.status} />
            </TableCell>
            <TableCell>{doc.created_at.slice(0, 10)}</TableCell>
            <TableCell>{doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : "-"}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                <DocumentViewer document={doc} />

                <Button size="sm" variant="outline" onClick={() => handleDownload(doc.id)}>
                  Download
                </Button>

                <select
                  value={doc.status}
                  onChange={(e) => handleStatusChange(doc, e.target.value)}
                  className="h-7 rounded-md border border-input bg-transparent px-2 text-xs"
                  disabled={updateDocument.isPending && updatingId === doc.id}
                >
                  {DOCUMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>

                <SignDialog
                  triggerLabel="Approve"
                  tableName="documents"
                  recordId={doc.id}
                  meaning="Approved"
                  title="Electronic Signature: Approve Document"
                  description="Re-enter your password to approve this document and create a signature record."
                  onSigned={async () => {
                    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.byStudy(studyId) });
                  }}
                />

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(doc.id)}
                  loading={deleteDocument.isPending}
                >
                  Delete
                </Button>
              </div>
              <div className="mt-2 max-w-md">
                <SignaturesList tableName="documents" recordId={doc.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}

        {documents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-muted-foreground">
              No documents uploaded yet.
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}
