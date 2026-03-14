/**
 * Ensures Supabase env vars are set. Call this before creating a client
 * so missing config fails with a clear message instead of a generic Supabase error.
 * Prefers Publishable key (recommended); falls back to legacy anon key.
 */
function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url?.trim() || !key) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local. " +
        "Get your Publishable key from: https://supabase.com/dashboard/project/_/settings/api " +
        "See README for step-by-step setup."
    );
  }

  return { url, key };
}

export { getSupabaseEnv };
