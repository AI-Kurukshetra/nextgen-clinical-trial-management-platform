import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { getAccessibleStudyIds } from "@/lib/access-control";
import { generateProtocolNumber } from "@/lib/identifiers";
import { studyCreateSchema } from "@/types/schemas";
import type { Study } from "@/types/database";

const STUDY_COLUMNS = "id, protocol_number, title, phase, status, therapeutic_area, sponsor_name, indication, target_enrollment, planned_start_date, planned_end_date, actual_start_date, created_by, owner_user_id, created_at, updated_at";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const supabase = await createClient();
  const role = auth.profile?.role;
  const accessibleStudyIds = await getAccessibleStudyIds(supabase, auth.user.id, role);

  if (accessibleStudyIds.length === 0) return sendSuccess<Study[]>([]);

  const { data, error } = await supabase
    .from("studies")
    .select(STUDY_COLUMNS)
    .in("id", accessibleStudyIds)
    .order("created_at", { ascending: false });

  if (error) return sendError(error.message, 500);
  return sendSuccess<Study[]>((data ?? []) as Study[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = studyCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const supabase = await createClient();
  const payload = parsed.data;
  const protocolNumber = payload.protocol_number?.trim() || (await generateProtocolNumber(supabase));

  const { data: study, error: studyError } = await supabase
    .rpc("create_study_as_owner", {
      p_protocol_number: protocolNumber,
      p_title: payload.title.trim(),
      p_phase: payload.phase,
      p_status: payload.status,
      p_therapeutic_area: payload.therapeutic_area || null,
      p_sponsor_name: payload.sponsor_name || null,
      p_indication: payload.indication || null,
      p_target_enrollment: payload.target_enrollment ?? null,
      p_planned_start_date: payload.planned_start_date || null,
      p_planned_end_date: payload.planned_end_date || null,
      p_actual_start_date: payload.actual_start_date || null,
    });

  if (studyError || !study) return sendError(studyError?.message ?? "Failed to create study", 500);

  await insertAuditLog(supabase, {
    tableName: "studies",
    recordId: study.id,
    action: "INSERT",
    newData: study as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Study>(study as Study, 201, { message: "Study created." });
}
