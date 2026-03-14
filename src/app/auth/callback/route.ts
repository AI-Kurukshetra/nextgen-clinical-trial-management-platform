import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth callback: exchange code (PKCE) or token_hash (email verification) for a session.
 * Email verification links may send token_hash + type when opened in another browser,
 * so we support both to avoid auth_callback_error.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const origin = url.origin;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_callback_error`);
}
