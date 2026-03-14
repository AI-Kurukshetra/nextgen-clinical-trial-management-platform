"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { MonitoringVisit } from "@/types/database";
import type { MonitoringVisitCreateInput, MonitoringVisitUpdateInput } from "@/types/schemas";

export function useMonitoringVisits(studyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.monitoringVisits.byStudy(studyId),
    queryFn: () => apiGet<MonitoringVisit[]>(`/monitoring-visits?study_id=${studyId}`),
    enabled: Boolean(studyId),
  });
}

export function useMyMonitoringVisits() {
  return useQuery({
    queryKey: QUERY_KEYS.monitoringVisits.mine,
    queryFn: () => apiGet<MonitoringVisit[]>("/monitoring-visits?mine=true"),
  });
}

export function useMonitoringVisit(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.monitoringVisits.detail(id),
    queryFn: () => apiGet<MonitoringVisit>(`/monitoring-visits/${id}`),
    enabled: Boolean(id),
  });
}

export function useScheduleMonitoringVisit(studyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MonitoringVisitCreateInput) => apiPost<MonitoringVisit>("/monitoring-visits", input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monitoringVisits.byStudy(studyId) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monitoringVisits.mine }),
      ]);
    },
  });
}

export function useUpdateMonitoringVisit(studyId: string, visitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MonitoringVisitUpdateInput) =>
      apiPut<MonitoringVisit>(`/monitoring-visits/${visitId}`, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monitoringVisits.byStudy(studyId) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monitoringVisits.mine }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monitoringVisits.detail(visitId) }),
      ]);
    },
  });
}
