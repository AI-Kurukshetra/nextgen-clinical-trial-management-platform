"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import type { Role } from "@/constants/roles";

type UseRoleResult = {
  role: Role | null;
  isLoading: boolean;
};

export function useRole(): UseRoleResult {
  const { data, isLoading } = useCurrentUser();
  const role = (data?.profile?.role ?? null) as Role | null;
  return { role, isLoading };
}
