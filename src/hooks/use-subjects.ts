"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { Subject } from "@/types/database";
import type { SubjectCreateInput, SubjectUpdateInput } from "@/types/schemas";

export function useSubjects(studyId: string, siteId?: string) {
  return useQuery({
    queryKey: siteId ? QUERY_KEYS.subjects.bySite(studyId, siteId) : QUERY_KEYS.subjects.byStudy(studyId),
    queryFn: () => {
      const base = `/subjects?study_id=${studyId}`;
      return apiGet<Subject[]>(siteId ? `${base}&site_id=${siteId}` : base);
    },
    enabled: Boolean(studyId),
  });
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.subjects.detail(id),
    queryFn: () => apiGet<Subject>(`/subjects/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateSubject(studyId: string, siteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubjectCreateInput) => apiPost<Subject>("/subjects", input),
    onSuccess: async (subject) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects.byStudy(studyId) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects.bySite(studyId, siteId) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sites.byStudy(studyId) }),
      ]);
      queryClient.setQueryData(QUERY_KEYS.subjects.detail(subject.id), subject);
    },
  });
}

export function useUpdateSubject(studyId: string, subjectId: string, siteId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubjectUpdateInput) => apiPut<Subject>(`/subjects/${subjectId}`, input),
    onSuccess: async (subject) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects.byStudy(studyId) }),
        siteId
          ? queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects.bySite(studyId, siteId) })
          : Promise.resolve(),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sites.byStudy(studyId) }),
      ]);
      queryClient.setQueryData(QUERY_KEYS.subjects.detail(subject.id), subject);
    },
  });
}
