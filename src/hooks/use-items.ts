"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { Item } from "@/types/database";

export function useItems() {
  return useQuery({
    queryKey: QUERY_KEYS.items.all,
    queryFn: () => apiGet<Item[]>("/items"),
  });
}
