/**
 * API Route Test Script — authenticates via Supabase token exchange and tests all routes.
 * Run: node scripts/test-routes.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://btyegkygtvotuaxjjzgl.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eWVna3lndHZvdHVheGpqemdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ1NDg3OSwiZXhwIjoyMDg5MDMwODc5fQ.0YJF49XKx2QIrp1eMeQDNjDVxfVhX7Hzn90MeqG91Mg";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eWVna3lndHZvdHVheGpqemdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NTQ4NzksImV4cCI6MjA4OTAzMDg3OX0.sFz5LnF0t2CQGAUCFO1G1wgQLnEPyWK2g1ntZnHaFjg";

// The Next.js server uses SSR cookies. We test directly against Supabase for data integrity,
// and make API calls with the auth cookie injected.
const BASE = "http://localhost:3000/api";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Get a user session token and the matching cookie format
async function getSession(email, password) {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Auth failed: ${error.message}`);
  return data.session;
}

// Build the Supabase auth cookie the SSR client expects
function makeAuthCookie(session) {
  const cookieValue = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: "bearer",
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    user: session.user,
  });
  const ref = "btyegkygtvotuaxjjzgl";
  return `sb-${ref}-auth-token=${encodeURIComponent(cookieValue)}`;
}

async function req(method, path, cookie, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data: json };
}

let passed = 0;
let failed = 0;
function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}${detail ? " — " + detail : ""}`);
    failed++;
  }
}

async function main() {
  console.log("🔐 Authenticating as study_manager (dr.sarah.chen@pharmaone.com)...");
  const session = await getSession("dr.sarah.chen@pharmaone.com", "Ctms@2026!");
  const cookie = makeAuthCookie(session);
  console.log("  ✓ Session obtained\n");

  // ── DB sanity checks via service role ────────────────────────────────────
  console.log("🗄️  DB sanity checks (service role)");
  {
    const { count: studyCount } = await admin.from("studies").select("id", { count: "exact", head: true });
    check(`Studies in DB: ${studyCount}`, studyCount >= 10);

    const { count: siteCount } = await admin.from("sites").select("id", { count: "exact", head: true });
    check(`Sites in DB: ${siteCount}`, siteCount >= 50);

    const { count: subjectCount } = await admin.from("subjects").select("id", { count: "exact", head: true });
    check(`Subjects in DB: ${subjectCount}`, subjectCount >= 500);

    const { count: milestoneCount } = await admin.from("milestones").select("id", { count: "exact", head: true });
    check(`Milestones in DB: ${milestoneCount}`, milestoneCount >= 100);

    const { count: docCount } = await admin.from("documents").select("id", { count: "exact", head: true });
    check(`Documents in DB: ${docCount}`, docCount >= 30);

    const { count: userCount } = await admin.from("profiles").select("id", { count: "exact", head: true });
    check(`User profiles in DB: ${userCount}`, userCount >= 13);

    // Verify new columns exist
    const { data: studySample } = await admin.from("studies").select("cro_partner, regulatory_reference").limit(1).single();
    check("studies.cro_partner column exists", studySample !== null && "cro_partner" in (studySample ?? {}));

    const { data: siteSample } = await admin.from("sites").select("address, state, postal_code, irb_number, principal_investigator_phone").limit(1).single();
    check("sites new columns exist", siteSample !== null && "irb_number" in (siteSample ?? {}));

    const { data: subjSample } = await admin.from("subjects").select("screen_failure_reason").limit(1).single();
    check("subjects.screen_failure_reason column exists", subjSample !== null && "screen_failure_reason" in (subjSample ?? {}));
  }

  // ── API Route tests with cookie auth ─────────────────────────────────────
  console.log("\n🌐 API route tests (cookie auth)");

  let studyId, siteId, subjectId, milestoneId;

  // Profile
  {
    const r = await req("GET", "/profile/current", cookie);
    check("GET /profile/current → 200", r.status === 200, `status=${r.status}`);
    check("  profile has role", r.data?.data?.role !== undefined);
  }

  // Studies list
  {
    const r = await req("GET", "/studies", cookie);
    check("GET /studies → 200", r.status === 200, `status=${r.status}`);
    check("  studies is array", Array.isArray(r.data?.data));
    check("  at least 1 study returned", (r.data?.data?.length ?? 0) >= 1);
    studyId = r.data?.data?.[0]?.id;
    check("  has cro_partner field", "cro_partner" in (r.data?.data?.[0] ?? {}));
  }

  // Study detail
  if (studyId) {
    const r = await req("GET", `/studies/${studyId}`, cookie);
    check("GET /studies/:id → 200", r.status === 200);
  }

  // Create study
  {
    const r = await req("POST", "/studies", cookie, {
      title: "TEST Study — Route Validation Run",
      phase: "Phase I",
      status: "setup",
      therapeutic_area: "Oncology",
      sponsor_name: "Test Sponsor Inc.",
      cro_partner: "Test CRO",
      regulatory_reference: "IND-TEST-0001",
      target_enrollment: 50,
      planned_start_date: "2026-04-01",
      planned_end_date: "2027-04-01",
    });
    check("POST /studies → 201", r.status === 201, `status=${r.status} msg=${r.data?.message ?? r.data?.error?.message ?? ""}`);
    if (r.data?.data?.id) studyId = r.data.data.id;
  }

  // Update study
  if (studyId) {
    const r = await req("PUT", `/studies/${studyId}`, cookie, { status: "active" });
    check("PUT /studies/:id → 200", r.status === 200);
  }

  // Sites
  if (studyId) {
    const createR = await req("POST", "/sites", cookie, {
      study_id: studyId,
      name: "Test Site Alpha",
      city: "San Francisco",
      state: "CA",
      country: "US",
      address: "123 Trial Lane",
      postal_code: "94105",
      irb_number: "IRB-TEST-1234",
      irb_approval_date: "2026-03-01",
      principal_investigator_name: "Dr. Test PI",
      principal_investigator_email: "testpi@test.org",
      principal_investigator_phone: "+1-555-0199",
      target_enrollment: 25,
    });
    check("POST /sites → 201", createR.status === 201, `status=${createR.status}`);
    siteId = createR.data?.data?.id;

    const listR = await req("GET", `/sites?study_id=${studyId}`, cookie);
    check("GET /sites?study_id → 200", listR.status === 200);

    if (siteId) {
      const detailR = await req("GET", `/sites/${siteId}`, cookie);
      check("GET /sites/:id → 200", detailR.status === 200);
      check("  site has irb_number field", "irb_number" in (detailR.data?.data ?? {}));

      const updateR = await req("PUT", `/sites/${siteId}`, cookie, { status: "initiated" });
      check("PUT /sites/:id → 200", updateR.status === 200);
    }
  }

  // Subjects
  if (studyId && siteId) {
    const createR = await req("POST", "/subjects", cookie, {
      study_id: studyId,
      site_id: siteId,
      subject_number: "TST-001",
      initials: "AB",
      status: "screened",
      screen_date: "2026-03-01",
    });
    check("POST /subjects → 201", createR.status === 201, `status=${createR.status}`);
    subjectId = createR.data?.data?.id;

    const listR = await req("GET", `/subjects?study_id=${studyId}`, cookie);
    check("GET /subjects?study_id → 200", listR.status === 200);

    if (subjectId) {
      const detailR = await req("GET", `/subjects/${subjectId}`, cookie);
      check("GET /subjects/:id → 200", detailR.status === 200);
      check("  has screen_failure_reason", "screen_failure_reason" in (detailR.data?.data ?? {}));

      const updateR = await req("PUT", `/subjects/${subjectId}`, cookie, { status: "enrolled", enrollment_date: "2026-03-10" });
      check("PUT /subjects/:id → 200", updateR.status === 200);
    }
  }

  // Milestones
  if (studyId) {
    const listR = await req("GET", `/milestones?study_id=${studyId}`, cookie);
    check("GET /milestones?study_id → 200", listR.status === 200);
    milestoneId = listR.data?.data?.[0]?.id;

    if (milestoneId) {
      const updateR = await req("PUT", `/milestones/${milestoneId}`, cookie, { status: "completed", actual_date: "2026-04-15" });
      check("PUT /milestones/:id → 200", updateR.status === 200);
    }
  }

  // Documents
  if (studyId) {
    const listR = await req("GET", `/documents?study_id=${studyId}`, cookie);
    check("GET /documents?study_id → 200", listR.status === 200);
    const docId = listR.data?.data?.[0]?.id;
    if (docId) {
      const detailR = await req("GET", `/documents/${docId}`, cookie);
      check("GET /documents/:id → 200", detailR.status === 200);
    }
  }

  // Audit logs
  {
    const r = await req("GET", "/audit-logs?limit=5", cookie);
    check("GET /audit-logs → 200", r.status === 200, `count=${r.data?.data?.length}`);
  }

  // Site members
  if (siteId) {
    const r = await req("GET", `/sites/${siteId}/members`, cookie);
    check("GET /sites/:id/members → 200", r.status === 200);
  }

  // Study team
  if (studyId) {
    const { data: members } = await admin.from("study_team").select("user_id").eq("study_id", studyId);
    check("study_team has owner entry", (members?.length ?? 0) >= 1);
  }

  // DELETE study (cleanup)
  if (studyId) {
    const r = await req("DELETE", `/studies/${studyId}`, cookie);
    check("DELETE /studies/:id → 200", r.status === 200, `status=${r.status}`);
  }

  // ── Final ────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(54));
  const total = passed + failed;
  console.log(`Results: ${passed}/${total} passed  (${failed} failed)`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
