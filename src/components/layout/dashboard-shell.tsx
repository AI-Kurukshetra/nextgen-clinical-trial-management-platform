"use client";

import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ContentContainer } from "@/components/shared/content-container";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { LayoutBreadcrumbs } from "@/components/layout/breadcrumbs";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { ROUTES } from "@/constants/routes";

type DashboardShellProps = {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
};

export function DashboardShell({ user, profile, children }: DashboardShellProps) {
  const initial = (profile?.full_name || user.email || "U").slice(0, 1).toUpperCase();
  const role = (profile?.role ?? "user") as "admin" | "user";
  const { collapsed, toggle } = useSidebar();
  const { signOut } = useAuth();

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden">
      <AppSidebar userRole={role} collapsed={collapsed} onToggle={toggle} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4">
          <div className="flex min-w-0 items-center gap-2">
            <LayoutBreadcrumbs />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url ?? undefined} alt={user.email ?? ""} />
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {profile?.full_name || user.email}
                </div>
                <div className="px-2 py-1 text-muted-foreground text-xs">{user.email}</div>
                <DropdownMenuItem>
                  <Link href={ROUTES.PROFILE} className="block w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    type="button"
                    onClick={() => {
                      void signOut();
                    }}
                    className="w-full cursor-pointer text-left"
                  >
                    Sign out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          <ContentContainer>{children}</ContentContainer>
        </main>
      </div>
    </div>
  );
}
