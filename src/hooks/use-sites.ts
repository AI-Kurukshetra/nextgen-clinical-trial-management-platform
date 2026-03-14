"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { Site } from "@/types/database";
import type { SiteCreateInput, SiteUpdateInput } from "@/types/schemas";

export function useSites(studyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.sites.byStudy(studyId),
    queryFn: () => apiGet<Site[]>(`/sites?study_id=${studyId}`),
    enabled: Boolean(studyId),
  });
}

export function useSite(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.sites.detail(id),
    queryFn: () => apiGet<Site>(`/sites/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateSite(studyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SiteCreateInput) => apiPost<Site>("/sites", input),
    onSuccess: async (site) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sites.byStudy(studyId) });
      queryClient.setQueryData(QUERY_KEYS.sites.detail(site.id), site);
    },
  });
}

export function useUpdateSite(siteId: string, studyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SiteUpdateInput) => apiPut<Site>(`/sites/${siteId}`, input),
    onSuccess: async (site) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sites.byStudy(studyId) });
      queryClient.setQueryData(QUERY_KEYS.sites.detail(site.id), site);
    },
  });
}
