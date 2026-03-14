"use client";

import { useState } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { ROUTES } from "@/constants/routes";
import type { Role } from "@/constants/roles";
import { PanelLeft } from "lucide-react";

type DashboardShellProps = {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
};

export function DashboardShell({ user, profile, children }: DashboardShellProps) {
  const initial = (profile?.full_name || user.email || "U").slice(0, 1).toUpperCase();
  const role = (profile?.role ?? "viewer") as Role;
  const { collapsed, toggle } = useSidebar();
  const { signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden md:h-screen">
      <div className="hidden md:block">
        <AppSidebar userRole={role} collapsed={collapsed} onToggle={toggle} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation menu"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="hidden min-w-0 md:block">
              <LayoutBreadcrumbs />
            </div>
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

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="border-b border-sidebar-border px-4 py-3">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar
            userRole={role}
            collapsed={false}
            onToggle={toggle}
            mobile
            onNavigate={() => setMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
