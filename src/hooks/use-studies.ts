"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { Study } from "@/types/database";
import type { StudyCreateInput, StudyUpdateInput } from "@/types/schemas";

export function useStudies() {
  return useQuery({
    queryKey: QUERY_KEYS.studies.all,
    queryFn: () => apiGet<Study[]>("/studies"),
  });
}

export function useStudy(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.studies.detail(id),
    queryFn: () => apiGet<Study>(`/studies/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateStudy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StudyCreateInput) => apiPost<Study>("/studies", input),
    onSuccess: async (study) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studies.all });
      queryClient.setQueryData(QUERY_KEYS.studies.detail(study.id), study);
    },
  });
}

export function useUpdateStudy(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StudyUpdateInput) => apiPut<Study>(`/studies/${id}`, input),
    onSuccess: async (study) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studies.all });
      queryClient.setQueryData(QUERY_KEYS.studies.detail(study.id), study);
    },
  });
}

export function useDeleteStudy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete<null>(`/studies/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studies.all });
    },
  });
}
