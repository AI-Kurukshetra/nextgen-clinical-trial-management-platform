import type { SupabaseClient } from "@supabase/supabase-js";

interface InsertAuditLogInput {
  tableName: string;
  recordId: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  performedBy: string;
}

export async function insertAuditLog(
  supabase: SupabaseClient,
  entry: InsertAuditLogInput
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    table_name: entry.tableName,
    record_id: entry.recordId,
    action: entry.action,
    old_data: entry.oldData ?? null,
    new_data: entry.newData ?? null,
    performed_by: entry.performedBy,
  });

  // Audit write should not block business actions.
  if (error) {
    console.error("Failed to write audit log:", error.message);
  }
}
