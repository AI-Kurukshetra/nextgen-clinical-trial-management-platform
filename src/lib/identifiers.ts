import type { SupabaseClient } from "@supabase/supabase-js";

function pad(value: number, size: number): string {
  return value.toString().padStart(size, "0");
}

export async function generateProtocolNumber(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ST-${year}-`;

  const { data } = await supabase
    .from("studies")
    .select("protocol_number")
    .ilike("protocol_number", `${prefix}%`)
    .order("protocol_number", { ascending: false })
    .limit(1);

  const latest = data?.[0]?.protocol_number;
  const latestSequence = latest ? Number(latest.split("-").at(-1) ?? "0") : 0;
  const nextSequence = Number.isFinite(latestSequence) ? latestSequence + 1 : 1;

  return `${prefix}${pad(nextSequence, 4)}`;
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
