"use client";

import type React from "react";
import { useRole } from "@/hooks/use-role";
import type { Role } from "@/constants/roles";

type RoleGuardProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { role, isLoading } = useRole();

  if (isLoading) return null;
  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

