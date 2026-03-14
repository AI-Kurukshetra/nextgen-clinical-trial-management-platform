import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { formatAuditActivity } from "@/lib/activity";
import type { AuditLog } from "@/types/database";
import type { AuditActivity } from "@/types/api";

const AUDIT_COLUMNS = "id, table_name, record_id, action, old_data, new_data, performed_by, performed_at";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam || 10), 1), 100);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(AUDIT_COLUMNS)
    .order("performed_at", { ascending: false })
    .limit(limit);

  if (error) return sendError(error.message, 500);

  const logs = (data ?? []) as AuditLog[];
  const performerIds = Array.from(new Set(logs.map((log) => log.performed_by).filter((id): id is string => !!id)));

  const actorById = new Map<string, { fullName: string | null; email: string | null }>();
  if (performerIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", performerIds);

    if (profilesError) {
      return sendError(profilesError.message, 500);
    }

    for (const profile of profiles ?? []) {
      actorById.set(profile.id, {
        fullName: profile.full_name ?? null,
        email: profile.email ?? null,
      });
    }
  }

  const activities: AuditActivity[] = logs.map((log) => {
    const actor = log.performed_by ? actorById.get(log.performed_by) : undefined;
    const formatted = formatAuditActivity(log, actor);

    return {
      ...log,
      actor_name: formatted.actorName,
      actor_email: formatted.actorEmail,
      entity_label: formatted.entityLabel,
      entity_name: formatted.entityName,
      message: formatted.message,
    };
  });

  return sendSuccess<AuditActivity[]>(activities);
}
