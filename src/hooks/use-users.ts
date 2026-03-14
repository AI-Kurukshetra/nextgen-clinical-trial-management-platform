"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { PaginatedResponse, UserListItem } from "@/types/api";
import { getErrorMessage } from "@/lib/utils";

export type UseUsersParams = {
  page?: number;
  limit?: number;
};

export function useUsers(params: UseUsersParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return useQuery({
    queryKey: [QUERY_KEYS.users.all, { page, limit }],
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("page", String(page));
      search.set("limit", String(limit));
      const data = await apiGet<PaginatedResponse<UserListItem>>(
        `/users?${search.toString()}`
      );
      return data;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; role: UserListItem["role"] }) => {
      return apiPatch<UserListItem>(`/users/${input.id}/role`, {
        role: input.role,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
    onError: (error: unknown) => {
      // Surface error via generic handler; UI components can also handle directly.
      // eslint-disable-next-line no-console
      console.error(getErrorMessage(error));
    },
  });
}

