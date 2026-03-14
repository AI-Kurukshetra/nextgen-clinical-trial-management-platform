import type { Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  ClipboardList,
  Shield,
  User,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Roles that can see this item. Empty = all authenticated. */
  roles?: Role[];
}

/**
 * Sidebar navigation config. Items are shown when user's role is in `roles`.
 * Omit `roles` to show to everyone.
 */
export const sidebarNav: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["admin", "study_manager", "monitor", "site_coordinator", "viewer"],
  },
  {
    label: "Studies",
    href: ROUTES.STUDIES,
    icon: ClipboardList,
    roles: ["admin", "study_manager", "monitor", "site_coordinator", "viewer"],
  },
  {
    label: "Admin",
    href: ROUTES.ADMIN,
    icon: Shield,
    roles: ["admin"],
  },
  {
    label: "Users",
    href: `${ROUTES.ADMIN}/users`,
    icon: Shield,
    roles: ["admin"],
  },
];

export const sidebarNavFooter: NavItem[] = [
  {
    label: "Profile",
    href: ROUTES.PROFILE,
    icon: User,
    roles: ["admin", "study_manager", "monitor", "site_coordinator", "viewer"],
  },
];

export function getVisibleNavItems(
  items: NavItem[],
  userRole: Role
): NavItem[] {
  return items.filter(
    (item) => !item.roles || item.roles.length === 0 || item.roles.includes(userRole)
  );
}
