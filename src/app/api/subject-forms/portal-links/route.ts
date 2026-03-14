import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { subjectPortalLinkCreateSchema } from "@/types/schemas";
import type { SubjectPortalLink } from "@/types/database";

const LINK_COLUMNS = "id, subject_id, user_id, linked_by, status, created_at";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = subjectPortalLinkCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());
  const payload = parsed.data;

  const supabase = await createClient();
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, site_id")
    .eq("id", payload.subject_id)
    .single();
  if (subjectError || !subject) return sendError("Subject not found", 404);

  const { data: membership } = await supabase
    .from("site_members")
    .select("id")
    .eq("site_id", subject.site_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!membership && auth.profile?.role !== "admin") return sendError("Forbidden", 403);

  const { data, error } = await supabase
    .from("subject_portal_links")
    .upsert(
      {
        subject_id: payload.subject_id,
        user_id: payload.user_id,
        linked_by: auth.user.id,
        status: "active",
      },
      { onConflict: "subject_id" }
    )
    .select(LINK_COLUMNS)
    .single();
  if (error || !data) return sendError(error?.message ?? "Failed to link subject portal", 500);

  return sendSuccess<SubjectPortalLink>(data as SubjectPortalLink, 201, {
    message: "Subject portal access linked.",
  });
}
