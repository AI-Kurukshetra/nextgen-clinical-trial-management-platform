"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiGet, apiPost } from "@/lib/api/client";
import type { Signature } from "@/types/database";
import type { SignatureCreateInput } from "@/types/schemas";

type SignatureTable = "documents" | "deviations" | "monitoring_visits";

interface SignaturePayload {
  table_name: SignatureTable;
  record_id: string;
  reason: string;
  meaning: string;
  password: string;
}

export function useRecordSignatures(tableName: SignatureTable, recordId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.signatures.byRecord(tableName, recordId),
    queryFn: () => apiGet<Signature[]>(`/signatures/${recordId}?table_name=${tableName}`),
    enabled: Boolean(recordId),
  });
}

export function useCreateSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignatureCreateInput | SignaturePayload) => apiPost<Signature>("/signatures", input),
    onSuccess: async (signature) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.signatures.byRecord(signature.table_name, signature.record_id),
        }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.detail(signature.record_id) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deviations.detail(signature.record_id) }),
      ]);
    },
  });
}
