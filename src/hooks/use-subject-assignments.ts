"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiDelete, apiGet, apiPost } from "@/lib/api/client";
import type { SubjectAssignment } from "@/types/database";
import type { SubjectAssignmentCreateInput } from "@/types/schemas";

export interface SubjectAssignmentView extends SubjectAssignment {
  subject: { id: string; subject_number: string; site_id: string } | null;
  assignee: { id: string; email: string | null; full_name: string | null } | null;
}

export function useSubjectAssignments(studyId: string, siteId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.subjects.assignments(studyId, siteId),
    queryFn: () => {
      const params = new URLSearchParams({ study_id: studyId });
      if (siteId) params.set("site_id", siteId);
      return apiGet<SubjectAssignmentView[]>(`/subject-assignments?${params.toString()}`);
    },
    enabled: Boolean(studyId),
  });
}

export function useCreateSubjectAssignment(studyId: string, siteId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectAssignmentCreateInput) =>
      apiPost<SubjectAssignmentView>("/subject-assignments", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects.assignments(studyId, siteId) });
    },
  });
}

export function useDeleteSubjectAssignment(studyId: string, siteId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<null>(`/subject-assignments/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects.assignments(studyId, siteId) });
    },
  });
}
