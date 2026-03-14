/**
 * Breadcrumb segment config keyed by pathname (exact or prefix).
 * Used by LayoutBreadcrumbs to render nav. Last segment is current page (no href).
 */
export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

/** Path pattern -> segments. First segment typically Home/Dashboard; last is current page. */
const pathSegments: Record<string, BreadcrumbSegment[]> = {
  "/": [{ label: "Home" }],
  "/dashboard": [
    { label: "Dashboard", href: "/dashboard" },
  ],
  "/dashboard/table": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Table" },
  ],
  "/admin": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin" },
  ],
  "/admin/users": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
    { label: "Users" },
  ],
  "/profile": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile" },
  ],
};

/**
 * Returns breadcrumb segments for the given pathname.
 * Matches exact path first, then longest prefix.
 */
export function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  if (pathSegments[pathname]) {
    return pathSegments[pathname];
  }
  const sorted = Object.keys(pathSegments)
    .filter((p) => p !== "/" && pathname.startsWith(p))
    .sort((a, b) => b.length - a.length);
  const key = sorted[0];
  const segments = key ? pathSegments[key] : undefined;
  return segments ?? [{ label: pathname.slice(1) || "Home" }];
}
