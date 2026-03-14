"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { CurrentUserProfile } from "@/types/api";

export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.profile.current,
    queryFn: () => apiGet<CurrentUserProfile>("/profile/current"),
  });
}
