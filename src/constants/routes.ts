export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  EMAIL_VERIFIED: "/auth/email-verified",
  DASHBOARD: "/dashboard",
  DASHBOARD_TABLE: "/dashboard/table",
  ADMIN: "/admin",
  PROFILE: "/profile",
} as const;

export type RouteKey = keyof typeof ROUTES;

