"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import type { User } from "@supabase/supabase-js";

type HomeNavProps = {
  user: User | null;
};

export function HomeNav({ user }: HomeNavProps) {
  return (
    <nav className="flex items-center gap-2">
      <ThemeSwitcher />
      {user ? (
        <Button variant="default" render={<Link href="/dashboard">Dashboard</Link>} nativeButton={false} />
      ) : (
        <>
          <Button variant="ghost" render={<Link href="/auth/sign-in">Sign in</Link>} nativeButton={false} />
          <Button variant="default" render={<Link href="/auth/sign-up">Sign up</Link>} nativeButton={false} />
        </>
      )}
    </nav>
  );
}
