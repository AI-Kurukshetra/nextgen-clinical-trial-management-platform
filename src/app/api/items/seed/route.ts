import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/utils/api";

const DEMO_ITEMS = [
  { title: "Welcome item", description: "First item in the app." },
  { title: "Getting started", description: "Edit or delete this from the dashboard." },
  { title: "Demo item", description: "Seed data for a populated first visit." },
] as const;

export async function POST() {
  const auth = await requireAuth();
  if (!auth) {
    return sendError("Unauthorized", 401);
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("items")
    .select("id", { count: "exact", head: true });

  if (count && count > 0) {
    return sendSuccess(
      { message: "You already have items. No seed needed." },
      200,
      { message: "You already have items. No seed needed." }
    );
  }

  const { error } = await supabase.from("items").insert(
    DEMO_ITEMS.map((item) => ({
      ...item,
      created_by: auth.user.id,
    }))
  );

  if (error) {
    return sendError(error.message, 500);
  }

  return sendSuccess(
    { message: "Demo items added." },
    201,
    { message: "Demo items added." }
  );
}
