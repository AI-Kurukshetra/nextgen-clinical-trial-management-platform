"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { MilestoneTask } from "@/types/milestone-task";
import type { MilestoneCreateInput, MilestoneUpdateInput } from "@/types/schemas";

export function useMilestones(studyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.milestones.byStudy(studyId),
    queryFn: () => apiGet<MilestoneTask[]>(`/milestones?study_id=${studyId}`),
    enabled: Boolean(studyId),
  });
}

export function useMyMilestones(studyId?: string) {
  return useQuery({
    queryKey: studyId ? [...QUERY_KEYS.milestones.mine, studyId] : QUERY_KEYS.milestones.mine,
    queryFn: () =>
      apiGet<MilestoneTask[]>(`/milestones?mine=true${studyId ? `&study_id=${encodeURIComponent(studyId)}` : ""}`),
  });
}

export function useCreateMilestone(studyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MilestoneCreateInput) => apiPost<MilestoneTask>("/milestones", input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.milestones.byStudy(studyId) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.milestones.mine }),
      ]);
    },
  });
}

export function useUpdateMilestone(studyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, input }: { milestoneId: string; input: MilestoneUpdateInput }) =>
      apiPut<MilestoneTask>(`/milestones/${milestoneId}`, input),
    onSuccess: async (data, variables) => {
      const invalidateTasks: Promise<unknown>[] = [
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.milestones.mine }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.milestones.detail(variables.milestoneId) }),
      ];
      if (studyId) {
        invalidateTasks.push(queryClient.invalidateQueries({ queryKey: QUERY_KEYS.milestones.byStudy(studyId) }));
      } else if (data?.study_id) {
        invalidateTasks.push(queryClient.invalidateQueries({ queryKey: QUERY_KEYS.milestones.byStudy(data.study_id) }));
      }
      await Promise.all(invalidateTasks);
    },
  });
}

export function useDeleteMilestone(studyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: string) => apiDelete<null>(`/milestones/${milestoneId}`),
    onSuccess: async (_data, milestoneId) => {
      const invalidateTasks: Promise<unknown>[] = [
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.milestones.mine }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.milestones.detail(milestoneId) }),
      ];
      if (studyId) {
        invalidateTasks.push(queryClient.invalidateQueries({ queryKey: QUERY_KEYS.milestones.byStudy(studyId) }));
      }
      await Promise.all(invalidateTasks);
    },
  });
}
