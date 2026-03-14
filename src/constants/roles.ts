export const ROLES = {
  ADMIN: "admin",
  STUDY_MANAGER: "study_manager",
  MONITOR: "monitor",
  SITE_COORDINATOR: "site_coordinator",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
