"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiClient, apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { Document } from "@/types/database";
import type { DocumentCreateInput, DocumentUpdateInput, UploadDocumentFormInput } from "@/types/schemas";

interface PresignResponse {
  uploadUrl: string;
  s3Key: string;
  publicUrl: string;
}

interface DownloadResponse {
  downloadUrl: string;
}

function getDocumentsPath(studyId: string, siteId?: string | null) {
  const params = new URLSearchParams({ study_id: studyId });
  if (siteId) params.set("site_id", siteId);
  return `/documents?${params.toString()}`;
}

export function useDocuments(studyId: string, siteId?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.byStudy(studyId, siteId ?? null),
    queryFn: () => apiGet<Document[]>(getDocumentsPath(studyId, siteId)),
    enabled: Boolean(studyId),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.detail(id),
    queryFn: () => apiGet<Document>(`/documents/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateDocument(studyId: string, siteId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DocumentCreateInput) => apiPost<Document>("/documents", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.byStudy(studyId, siteId ?? null) });
    },
  });
}

export function useUpdateDocument(studyId: string, siteId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DocumentUpdateInput }) =>
      apiPut<Document>(`/documents/${id}`, input),
    onSuccess: async (document) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.byStudy(studyId, siteId ?? null) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.detail(document.id) }),
      ]);
      queryClient.setQueryData(QUERY_KEYS.documents.detail(document.id), document);
    },
  });
}

export function useDeleteDocument(studyId: string, siteId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => apiDelete<null>(`/documents/${documentId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.byStudy(studyId, siteId ?? null) });
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: (documentId: string) => apiGet<DownloadResponse>(`/documents/download/${documentId}`),
  });
}

export function useUploadDocument(studyId: string, siteId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadDocumentFormInput) => {
      const fileType = input.file.type || "application/octet-stream";

      const presign = await apiPost<PresignResponse>("/documents/presign", {
        fileName: input.file.name,
        fileType,
        study_id: studyId,
        doc_type: input.doc_type,
      });

      await apiClient.put(presign.uploadUrl, input.file, {
        headers: { "Content-Type": fileType },
        withCredentials: false,
      });

      return apiPost<Document>("/documents", {
        study_id: studyId,
        site_id: input.site_id || null,
        name: input.name,
        doc_type: input.doc_type,
        version: input.version,
        status: "draft",
        s3_key: presign.s3Key,
        file_url: presign.publicUrl,
        file_size: input.file.size,
        file_mime: fileType,
      } satisfies DocumentCreateInput);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.byStudy(studyId, siteId ?? null) });
    },
  });
}
