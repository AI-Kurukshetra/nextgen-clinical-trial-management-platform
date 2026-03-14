/**
 * Fix milestones for studies that failed due to invalid 'in_progress' status.
 * Run: node scripts/fix-milestones.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://btyegkygtvotuaxjjzgl.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eWVna3lndHZvdHVheGpqemdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ1NDg3OSwiZXhwIjoyMDg5MDMwODc5fQ.0YJF49XKx2QIrp1eMeQDNjDVxfVhX7Hzn90MeqG91Mg";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const MILESTONE_NAMES = [
  "Protocol Finalized",
  "IRB/Ethics Approval Received",
  "First Site Initiated (FSI)",
  "First Patient In (FPI)",
  "Last Patient In (LPI)",
  "Last Patient Out (LPO)",
  "Database Lock",
  "Primary Analysis Complete",
  "Clinical Study Report Submitted",
];

// Studies that failed (active status, some milestones completed)
const FAILED_PROTOCOLS = ["PT-2023-0001", "PT-2023-0003", "PT-2023-0005", "PT-2024-0001"];

async function main() {
  // Find studies that have NO milestones (the failed ones)
  const { data: allStudies } = await supabase
    .from("studies")
    .select("id, protocol_number, status, actual_start_date, planned_start_date, owner_user_id")
    .in("protocol_number", FAILED_PROTOCOLS);

  for (const study of allStudies ?? []) {
    // Check if milestones already exist
    const { count } = await supabase
      .from("milestones")
      .select("id", { count: "exact", head: true })
      .eq("study_id", study.id);

    if (count > 0) {
      console.log(`  ⟳ ${study.protocol_number} already has ${count} milestones, skipping`);
      continue;
    }

    const startDate = study.actual_start_date || study.planned_start_date;
    const milestoneInserts = MILESTONE_NAMES.map((name, idx) => {
      const plannedDate = addDays(startDate, idx * 90);
      let status = "pending";
      let actualDate = null;

      // Active studies: first 3-4 milestones completed, rest pending/at_risk
      if (idx <= 3) {
        status = "completed";
        actualDate = addDays(plannedDate, rndInt(-10, 20));
      } else if (idx === 4) {
        status = rnd(["at_risk", "completed"]);
        if (status === "completed") actualDate = addDays(plannedDate, rndInt(-5, 15));
      } else {
        status = "pending";
      }

      return {
        study_id: study.id,
        name,
        status,
        planned_date: plannedDate,
        actual_date: actualDate,
        board_order: idx,
        created_by: study.owner_user_id,
      };
    });

    const { error } = await supabase.from("milestones").insert(milestoneInserts);
    if (error) {
      console.error(`  ✗ ${study.protocol_number}: ${error.message}`);
    } else {
      console.log(`  ✓ ${MILESTONE_NAMES.length} milestones → ${study.protocol_number}`);
    }
  }

  console.log("\n✅ Done");
}

main().catch(console.error);
