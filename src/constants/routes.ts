export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  EMAIL_VERIFIED: "/auth/email-verified",
  DASHBOARD: "/dashboard",
  DASHBOARD_ADMIN: "/dashboard/admin",
  DASHBOARD_STUDY_MANAGER: "/dashboard/study-manager",
  DASHBOARD_SITE_OWNER: "/dashboard/site-owner",
  DASHBOARD_FIELD: "/dashboard/field",
  DASHBOARD_MONITOR: "/dashboard/monitor",
  STUDIES: "/dashboard/studies",
  MONITORING: "/dashboard/monitoring",
  ADMIN: "/admin",
  PROFILE: "/profile",
  PORTAL: "/portal",
} as const;

export type RouteKey = keyof typeof ROUTES;
