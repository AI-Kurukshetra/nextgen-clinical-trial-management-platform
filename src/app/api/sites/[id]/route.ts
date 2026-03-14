import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { insertAuditLog } from "@/lib/audit";
import { canManageSite, canViewSite } from "@/lib/site-permissions";
import { siteUpdateSchema } from "@/types/schemas";
import type { Site } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

const SITE_COLUMNS =
  "id, study_id, site_number, name, address, city, state, postal_code, country, status, principal_investigator_name, principal_investigator_email, principal_investigator_phone, irb_number, irb_approval_date, target_enrollment, enrolled_count, screen_failures, initiated_date, closed_date, created_at, updated_at";

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { id } = await context.params;
  const supabase = await createClient();
  const canView = await canViewSite(supabase, id, auth.user.id, auth.profile?.role);
  if (!canView) return sendError("Forbidden", 403);

  const { data, error } = await supabase.from("sites").select(SITE_COLUMNS).eq("id", id).single();
  if (error || !data) return sendError("Site not found", 404);

  return sendSuccess<Site>(data as Site);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = siteUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const { id } = await context.params;
  const payload = parsed.data;
  const supabase = await createClient();
  const role = auth.profile?.role;
  const nextSiteNumber = payload.site_number === undefined ? undefined : payload.site_number?.trim() || undefined;

  const canManage = await canManageSite(supabase, id, auth.user.id, role);
  if (!canManage) return sendError("Forbidden", 403);

  const { data: existing, error: existingError } = await supabase
    .from("sites")
    .select(SITE_COLUMNS)
    .eq("id", id)
    .single();

  if (existingError || !existing) return sendError("Site not found", 404);

  const { data, error } = await supabase
    .from("sites")
    .update({
      site_number: nextSiteNumber,
      name: payload.name?.trim(),
      address: payload.address ?? null,
      city: payload.city ?? null,
      state: payload.state ?? null,
      postal_code: payload.postal_code ?? null,
      country: payload.country,
      status: payload.status,
      principal_investigator_name: payload.principal_investigator_name ?? null,
      principal_investigator_email: payload.principal_investigator_email ?? null,
      principal_investigator_phone: payload.principal_investigator_phone ?? null,
      irb_number: payload.irb_number ?? null,
      irb_approval_date: payload.irb_approval_date ?? null,
      target_enrollment: payload.target_enrollment ?? null,
      initiated_date: payload.initiated_date ?? null,
      closed_date: payload.closed_date ?? null,
    })
    .eq("id", id)
    .select(SITE_COLUMNS)
    .single();

  if (error || !data) return sendError(error?.message ?? "Failed to update site", 500);

  await insertAuditLog(supabase, {
    tableName: "sites",
    recordId: id,
    action: "UPDATE",
    oldData: existing as unknown as Record<string, unknown>,
    newData: data as unknown as Record<string, unknown>,
    performedBy: auth.user.id,
  });

  return sendSuccess<Site>(data as Site, 200, { message: "Site updated." });
}
