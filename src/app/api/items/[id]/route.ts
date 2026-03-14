import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/utils/api";
import { updateItemSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";
import type { Item } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) {
    return sendError("Unauthorized", 401);
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("id, title, description, created_at, updated_at, created_by")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return sendError("Item not found", 404);
    }
    return sendError(error.message, 500);
  }

  return sendSuccess<Item>(data as Item);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) {
    return sendError("Unauthorized", 401);
  }

  const { id } = await context.params;
  const parsed = updateItemSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("items")
    .select("id, created_by")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return sendError("Item not found", 404);
  }

  const isAdmin = auth.profile?.role === ROLES.ADMIN;
  const isOwner = (existing as { created_by: string }).created_by === auth.user.id;
  if (!isAdmin && !isOwner) {
    return sendError("Forbidden", 403);
  }

  const { title, description } = parsed.data;
  const { data, error } = await supabase
    .from("items")
    .update({
      title: title.trim(),
      description: description?.trim() ?? null,
    })
    .eq("id", id)
    .select("id, title, description, created_at, updated_at, created_by")
    .single();

  if (error) {
    return sendError(error.message, 500);
  }

  return sendSuccess<Item>(data as Item, 200, { message: "Item updated." });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) {
    return sendError("Unauthorized", 401);
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("items")
    .select("id, created_by")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return sendError("Item not found", 404);
  }

  const isAdmin = auth.profile?.role === ROLES.ADMIN;
  const isOwner = (existing as { created_by: string }).created_by === auth.user.id;
  if (!isAdmin && !isOwner) {
    return sendError("Forbidden", 403);
  }

  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) {
    return sendError(error.message, 500);
  }

  return sendSuccess<null>(null, 200, { message: "Item deleted." });
}
