"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { Deviation } from "@/types/database";
import type { DeviationCreateInput, DeviationUpdateInput } from "@/types/schemas";

export function useDeviations(studyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.deviations.byStudy(studyId),
    queryFn: () => apiGet<Deviation[]>(`/deviations?study_id=${studyId}`),
    enabled: Boolean(studyId),
  });
}

export function useDeviation(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.deviations.detail(id),
    queryFn: () => apiGet<Deviation>(`/deviations/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateDeviation(studyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeviationCreateInput) => apiPost<Deviation>("/deviations", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deviations.byStudy(studyId) });
    },
  });
}

export function useUpdateDeviation(studyId: string, deviationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeviationUpdateInput) => apiPut<Deviation>(`/deviations/${deviationId}`, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deviations.byStudy(studyId) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deviations.detail(deviationId) }),
      ]);
    },
  });
}
