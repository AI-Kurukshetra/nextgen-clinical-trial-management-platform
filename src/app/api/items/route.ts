import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/utils/api";
import { createItemSchema } from "@/types/schemas";
import type { Item } from "@/types/database";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) {
    return sendError("Unauthorized", 401);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("id, title, description, created_at, updated_at, created_by")
    .order("created_at", { ascending: false });

  if (error) {
    return sendError(error.message, 500);
  }

  return sendSuccess<Item[]>((data ?? []) as Item[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) {
    return sendError("Unauthorized", 401);
  }

  const parsed = createItemSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const { title, description } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      created_by: auth.user.id,
    })
    .select("id, title, description, created_at, updated_at, created_by")
    .single();

  if (error) {
    return sendError(error.message, 500);
  }

  return sendSuccess<Item>(data as Item, 201, { message: "Item created." });
}
