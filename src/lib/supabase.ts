import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserSupabaseClient() {
  if (!browserClient) {
    const { url, key } = getSupabaseEnv();
    browserClient = createBrowserClient<Database>(url, key);
  }
  return browserClient;
}

