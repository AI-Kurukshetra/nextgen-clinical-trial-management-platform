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
  "/dashboard/admin": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin Workspace" },
  ],
  "/dashboard/study-manager": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Study Manager Workspace" },
  ],
  "/dashboard/site-owner": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Site Operations Workspace" },
  ],
  "/dashboard/field": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Field Workspace" },
  ],
  "/dashboard/monitor": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Monitor Workspace" },
  ],
  "/dashboard/studies": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Studies" },
  ],
  "/dashboard/studies/new": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Studies", href: "/dashboard/studies" },
    { label: "New Study" },
  ],
  "/dashboard/studies/": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Studies", href: "/dashboard/studies" },
    { label: "Study Detail" },
  ],
  "/dashboard/monitoring": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My CRA Visits" },
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
  "/portal": [
    { label: "Patient Portal" },
  ],
};

/**
 * Returns breadcrumb segments for the given pathname.
 * Matches exact path first, then longest prefix.
 */
export function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  if (pathname.startsWith("/dashboard/studies/")) {
    const parts = pathname.split("/").filter(Boolean);
    const tail = parts.slice(3);

    if (tail.length === 0) {
      return [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Studies", href: "/dashboard/studies" },
        { label: "Study Detail" },
      ];
    }

    const labelMap: Record<string, string> = {
      edit: "Edit Study",
      sites: "Sites",
      subjects: "Subjects",
      monitoring: "Monitoring (CRA)",
      deviations: "Deviations",
      milestones: "Milestones",
      documents: "Documents",
      forms: "Forms",
    };

    const firstKey = tail[0] ?? "";
    const first = labelMap[firstKey] ?? "Study Detail";
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Studies", href: "/dashboard/studies" },
      { label: first },
    ];
  }

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
