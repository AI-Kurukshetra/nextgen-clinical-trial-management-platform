"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { SiteMember } from "@/types/database";
import type { SiteMemberCreateInput, SiteMemberUpdateInput } from "@/types/schemas";

export interface SiteMemberWithProfile extends SiteMember {
  profile: {
    id: string;
    email: string | null;
    full_name: string | null;
    role: string;
  } | null;
}

export function useSiteMembers(siteId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.sites.members(siteId),
    queryFn: () => apiGet<SiteMemberWithProfile[]>(`/sites/${siteId}/members`),
    enabled: Boolean(siteId),
  });
}

export function useAddSiteMember(siteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SiteMemberCreateInput) => apiPost<SiteMember>(`/sites/${siteId}/members`, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sites.members(siteId) });
    },
  });
}

export function useUpdateSiteMember(siteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, input }: { memberId: string; input: SiteMemberUpdateInput }) =>
      apiPut<SiteMember>(`/sites/${siteId}/members/${memberId}`, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sites.members(siteId) });
    },
  });
}

export function useRemoveSiteMember(siteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => apiDelete<null>(`/sites/${siteId}/members/${memberId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sites.members(siteId) });
    },
  });
}

export interface ProfileSearchItem {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
}

export function useProfileSearch(query: string) {
  return useQuery({
    queryKey: ["profiles", "search", query],
    queryFn: () => apiGet<ProfileSearchItem[]>(`/profiles/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
  });
}
