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
    <nav className="flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
      <Button
        variant="ghost"
        className="hidden md:inline-flex"
        render={<Link href="/understanding">Understanding</Link>}
        nativeButton={false}
      />
      <ThemeSwitcher />
      {user ? (
        <Button variant="default" render={<Link href="/dashboard">Dashboard</Link>} nativeButton={false} />
      ) : (
        <>
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            render={<Link href="/auth/sign-in">Sign in</Link>}
            nativeButton={false}
          />
          <Button variant="default" render={<Link href="/auth/sign-up">Sign up</Link>} nativeButton={false} />
        </>
      )}
    </nav>
  );
}
