import type { SupabaseClient } from "@supabase/supabase-js";

function pad(value: number, size: number): string {
  return value.toString().padStart(size, "0");
}

export async function generateProtocolNumber(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ST-${year}-`;

  // Fetch all existing protocol numbers with this prefix to avoid RLS-filtered gaps causing collisions
  const { data } = await supabase
    .from("studies")
    .select("protocol_number")
    .ilike("protocol_number", `${prefix}%`)
    .order("protocol_number", { ascending: false });

  const existingSet = new Set((data ?? []).map((r) => r.protocol_number));
  const maxSeq = (data ?? []).reduce((max, r) => {
    const seq = Number(r.protocol_number?.split("-").at(-1) ?? "0");
    return Number.isFinite(seq) && seq > max ? seq : max;
  }, 0);

  // Increment from max and find the first unused number
  let nextSeq = maxSeq + 1;
  while (existingSet.has(`${prefix}${pad(nextSeq, 4)}`)) {
    nextSeq++;
  }

  return `${prefix}${pad(nextSeq, 4)}`;
}

export async function generateSiteNumber(supabase: SupabaseClient, studyId: string): Promise<string> {
  const { data } = await supabase
    .from("sites")
    .select("site_number")
    .eq("study_id", studyId)
    .order("site_number", { ascending: false })
    .limit(1);

  const latest = data?.[0]?.site_number ?? "";
  const number = Number(latest.replace(/[^\d]/g, "")) || 0;
  return `S-${pad(number + 1, 3)}`;
}
