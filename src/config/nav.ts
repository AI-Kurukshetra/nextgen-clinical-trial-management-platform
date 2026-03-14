import type { Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  Shield,
  Home,
  Table2,
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
 * Omit `roles` to show to everyone (admin + user).
 */
export const sidebarNav: NavItem[] = [
  {
    label: "Home",
    href: ROUTES.HOME,
    icon: Home,
    roles: ["admin", "user"],
  },
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["admin", "user"],
  },
  {
    label: "Table",
    href: ROUTES.DASHBOARD_TABLE,
    icon: Table2,
    roles: ["admin", "user"],
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
    roles: ["admin", "user"],
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
