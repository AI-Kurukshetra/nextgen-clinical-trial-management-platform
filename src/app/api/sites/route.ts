import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { SITE_ROLE_DEFAULT_MASK } from "@/constants/permissions";
import { generateSiteNumber } from "@/lib/identifiers";
import { isGlobalStudyOperator } from "@/lib/site-permissions";
import { canManageStudy } from "@/lib/access-control";
import { siteCreateSchema } from "@/types/schemas";
import type { Site } from "@/types/database";

const SITE_COLUMNS =
  "id, study_id, site_number, name, city, country, status, principal_investigator_name, principal_investigator_email, target_enrollment, enrolled_count, screen_failures, initiated_date, closed_date, created_at, updated_at";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const studyId = request.nextUrl.searchParams.get("study_id");
  if (!studyId) return sendError("study_id query param is required", 400);

  const supabase = await createClient();
  const role = auth.profile?.role;
  const { data, error } = await supabase
    .from("sites")
    .select(SITE_COLUMNS)
    .eq("study_id", studyId)
    .order("site_number", { ascending: true });

  if (error) return sendError(error.message, 500);

  const hasStudyManage = await canManageStudy(supabase, studyId, auth.user.id, role);
  if (isGlobalStudyOperator(role) || hasStudyManage) {
    return sendSuccess<Site[]>((data ?? []) as Site[]);
  }

  const { data: memberships } = await supabase
    .from("site_members")
    .select("site_id")
    .eq("user_id", auth.user.id);
  const allowed = new Set((memberships ?? []).map((item) => item.site_id));
  const filtered = (data ?? []).filter((site) => allowed.has(site.id));
  return sendSuccess<Site[]>(filtered as Site[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = siteCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const payload = parsed.data;
  const supabase = await createClient();
  const hasStudyWrite = await canManageStudy(supabase, payload.study_id, auth.user.id, auth.profile?.role);
  if (!hasStudyWrite) {
    return sendError("Forbidden: you do not have permission to create sites for this study", 403);
  }

  const siteNumber = payload.site_number?.trim() || (await generateSiteNumber(supabase, payload.study_id));

  const { data, error } = await supabase
    .from("sites")
    .insert({
      study_id: payload.study_id,
      site_number: siteNumber,
      name: payload.name.trim(),
      city: payload.city || null,
      country: payload.country || "US",
      status: payload.status || "identified",
      principal_investigator_name: payload.principal_investigator_name || null,
      principal_investigator_email: payload.principal_investigator_email || null,
      target_enrollment: payload.target_enrollment ?? 0,
      initiated_date: payload.initiated_date || null,
      closed_date: payload.closed_date || null,
    })
    .select(SITE_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to create site", 500);

  await supabase.from("site_members").insert({
    site_id: data.id,
    user_id: auth.user.id,
    role: "owner",
    permission_mask: SITE_ROLE_DEFAULT_MASK.owner,
    invited_by: auth.user.id,
  });

  await insertAuditLog(supabase, {
    tableName: "sites",
    recordId: data.id,
    action: "INSERT",
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Site>(data as Site, 201, { message: "Site created." });
}
