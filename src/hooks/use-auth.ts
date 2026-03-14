"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { ROUTES } from "@/constants/routes";
import { queryClient } from "@/lib/query-client";

export function useAuth() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message);
      }
      queryClient.clear();
      router.push(ROUTES.DASHBOARD);
    },
    [router, supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string | null): Promise<void> => {
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";

      const emailRedirectTo = origin
        ? `${origin}/auth/callback?redirectTo=${encodeURIComponent(ROUTES.EMAIL_VERIFIED)}`
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined,
          emailRedirectTo,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const identities = data.user?.identities ?? [];
      if (identities.length === 0) {
        // Supabase intentionally returns no error when the email already exists.
        // Surface a generic, privacy-safe message instead of silent success.
        throw new Error(
          "If this email is already registered, please sign in to your account."
        );
      }

      queryClient.clear();
    },
    [supabase]
  );

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    queryClient.clear();
    router.push(ROUTES.HOME);
  }, [router, supabase]);

  return { signIn, signUp, signOut };
}
