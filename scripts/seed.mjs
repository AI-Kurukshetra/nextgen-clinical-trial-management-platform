/**
 * CTMS Comprehensive Seed Script
 * Run: node scripts/seed.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://btyegkygtvotuaxjjzgl.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eWVna3lndHZvdHVheGpqemdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ1NDg3OSwiZXhwIjoyMDg5MDMwODc5fQ.0YJF49XKx2QIrp1eMeQDNjDVxfVhX7Hzn90MeqG91Mg";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── helpers ────────────────────────────────────────────────────────────────
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
function isoDate(y, m, d) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── master data ────────────────────────────────────────────────────────────
const SEED_PASSWORD = "Ctms@2026!";

const USER_DEFS = [
  { email: "dr.sarah.chen@pharmaone.com",   full_name: "Dr. Sarah Chen",       role: "study_manager" },
  { email: "michael.torres@globalcro.com",  full_name: "Michael Torres",       role: "study_manager" },
  { email: "amelia.patel@trialsync.com",    full_name: "Amelia Patel",         role: "study_manager" },
  { email: "james.okoro@medresearch.org",   full_name: "Dr. James Okoro",      role: "study_manager" },
  { email: "cra.lisa.huang@globalcro.com",  full_name: "Lisa Huang",           role: "monitor" },
  { email: "cra.derek.nash@trialsync.com",  full_name: "Derek Nash",           role: "monitor" },
  { email: "cra.priya.rao@pharmaone.com",   full_name: "Priya Rao",            role: "monitor" },
  { email: "coord.alice.wu@cityhospital.com", full_name: "Alice Wu",           role: "site_coordinator" },
  { email: "coord.ben.foster@clinicx.com",  full_name: "Ben Foster",           role: "site_coordinator" },
  { email: "coord.nina.ross@medhub.com",    full_name: "Nina Ross",            role: "site_coordinator" },
  { email: "coord.omar.ali@regenhospital.com", full_name: "Omar Ali",          role: "site_coordinator" },
  { email: "viewer.kate.marsh@pharmaone.com", full_name: "Kate Marsh",         role: "viewer" },
  { email: "viewer.raj.kumar@globalcro.com",  full_name: "Raj Kumar",          role: "viewer" },
];

const STUDY_DEFS = [
  {
    protocol: "PT-2022-0001", title: "CARDINAL: A Phase III Study of Cardizarin in Heart Failure",
    phase: "Phase III", status: "completed", therapeutic_area: "Cardiology",
    sponsor: "PharmaOne Inc.", cro: "GlobalCRO Ltd.", reg_ref: "IND-2021-44821",
    indication: "Chronic heart failure with reduced ejection fraction (HFrEF)",
    target: 320, start: "2022-03-01", end: "2024-09-30", actual_start: "2022-04-15",
  },
  {
    protocol: "PT-2022-0002", title: "AURORA: Azithroban vs. Placebo in Acute Respiratory Distress",
    phase: "Phase II", status: "completed", therapeutic_area: "Pulmonology",
    sponsor: "MedResearch Corp.", cro: "TrialSync CRO", reg_ref: "IND-2022-10233",
    indication: "Acute respiratory distress syndrome (ARDS) requiring ventilator support",
    target: 180, start: "2022-06-01", end: "2024-03-31", actual_start: "2022-07-10",
  },
  {
    protocol: "PT-2022-0003", title: "NEXAFEN-DM: Safety of Nexafen in Type 2 Diabetes",
    phase: "Phase II", status: "completed", therapeutic_area: "Endocrinology",
    sponsor: "TrialSync Bio.", cro: "GlobalCRO Ltd.", reg_ref: "IND-2022-50017",
    indication: "Type 2 diabetes mellitus, HbA1c 7.5–10.5%",
    target: 240, start: "2022-09-01", end: "2024-12-31", actual_start: "2022-10-01",
  },
  {
    protocol: "PT-2023-0001", title: "LUMINOS: Lumivastatin in Non-Alcoholic Steatohepatitis",
    phase: "Phase II", status: "active", therapeutic_area: "Hepatology",
    sponsor: "PharmaOne Inc.", cro: "TrialSync CRO", reg_ref: "IND-2023-11450",
    indication: "NASH with fibrosis stage F2–F3 confirmed by biopsy",
    target: 200, start: "2023-01-15", end: "2026-06-30", actual_start: "2023-02-20",
  },
  {
    protocol: "PT-2023-0002", title: "APEX-RCC: Apexanil in Renal Cell Carcinoma",
    phase: "Phase III", status: "active", therapeutic_area: "Oncology",
    sponsor: "GlobalBio Pharma", cro: "GlobalCRO Ltd.", reg_ref: "IND-2023-29883",
    indication: "Clear cell renal cell carcinoma, previously untreated, metastatic",
    target: 400, start: "2023-03-01", end: "2027-03-01", actual_start: "2023-04-05",
  },
  {
    protocol: "PT-2023-0003", title: "BRAINSHIELD-MS: Neuroprotection in Progressive Multiple Sclerosis",
    phase: "Phase II", status: "active", therapeutic_area: "Neurology",
    sponsor: "MedResearch Corp.", cro: "TrialSync CRO", reg_ref: "IND-2023-37741",
    indication: "Primary progressive MS (PPMS) with EDSS 3.0–6.5",
    target: 160, start: "2023-05-01", end: "2026-12-31", actual_start: "2023-06-15",
  },
  {
    protocol: "PT-2023-0004", title: "GLOWSKIN: Biologic for Moderate-to-Severe Psoriasis",
    phase: "Phase III", status: "active", therapeutic_area: "Dermatology",
    sponsor: "TrialSync Bio.", cro: null, reg_ref: "IND-2023-44422",
    indication: "Plaque psoriasis covering ≥10% BSA with PASI ≥12",
    target: 280, start: "2023-07-01", end: "2026-07-01", actual_start: "2023-08-10",
  },
  {
    protocol: "PT-2023-0005", title: "HEMOPATH: Gene Therapy Approach in Sickle Cell Disease",
    phase: "Phase I", status: "active", therapeutic_area: "Hematology",
    sponsor: "PharmaOne Inc.", cro: "GlobalCRO Ltd.", reg_ref: "IND-2023-55001",
    indication: "Severe sickle cell disease (HbSS or HbSβ0)",
    target: 40, start: "2023-08-15", end: "2026-08-15", actual_start: "2023-09-20",
  },
  {
    protocol: "PT-2024-0001", title: "SOLVEX-RA: JAK Inhibitor in Rheumatoid Arthritis",
    phase: "Phase III", status: "active", therapeutic_area: "Rheumatology",
    sponsor: "GlobalBio Pharma", cro: "TrialSync CRO", reg_ref: "IND-2024-10102",
    indication: "Moderate-to-severe RA inadequate response to ≥1 bDMARD",
    target: 360, start: "2024-01-10", end: "2027-01-10", actual_start: "2024-02-15",
  },
  {
    protocol: "PT-2024-0002", title: "DEMENTRA-AD: Anti-Tau Antibody in Early Alzheimer's Disease",
    phase: "Phase II", status: "active", therapeutic_area: "Neurology",
    sponsor: "MedResearch Corp.", cro: "GlobalCRO Ltd.", reg_ref: "IND-2024-21234",
    indication: "Early symptomatic Alzheimer's disease with amyloid positivity",
    target: 220, start: "2024-02-01", end: "2027-02-01", actual_start: "2024-03-10",
  },
  {
    protocol: "PT-2024-0003", title: "CODIVAR: mRNA Vaccine in Coronary Artery Disease Prevention",
    phase: "Phase II", status: "active", therapeutic_area: "Cardiology",
    sponsor: "TrialSync Bio.", cro: "TrialSync CRO", reg_ref: "IND-2024-33001",
    indication: "High-risk primary prevention of MACE in patients with elevated Lp(a)",
    target: 300, start: "2024-04-01", end: "2027-04-01", actual_start: "2024-05-01",
  },
  {
    protocol: "PT-2024-0004", title: "OPALUX-OC: PARP Inhibitor Maintenance in Ovarian Cancer",
    phase: "Phase III", status: "setup", therapeutic_area: "Oncology",
    sponsor: "PharmaOne Inc.", cro: "GlobalCRO Ltd.", reg_ref: "IND-2024-44500",
    indication: "Platinum-sensitive recurrent ovarian cancer with BRCAm",
    target: 260, start: "2024-09-01", end: "2028-09-01", actual_start: null,
  },
  {
    protocol: "PT-2025-0001", title: "INSULEX-T1D: Closed-Loop Insulin System in Type 1 Diabetes",
    phase: "Phase III", status: "setup", therapeutic_area: "Endocrinology",
    sponsor: "GlobalBio Pharma", cro: "TrialSync CRO", reg_ref: "IND-2025-10020",
    indication: "Type 1 diabetes mellitus, adults 18–70 years, HbA1c 7.5–10.0%",
    target: 340, start: "2025-03-01", end: "2027-12-31", actual_start: null,
  },
  {
    protocol: "PT-2025-0002", title: "RENOVA-CKD: Stem Cell Therapy in Chronic Kidney Disease",
    phase: "Phase I", status: "setup", therapeutic_area: "Nephrology",
    sponsor: "MedResearch Corp.", cro: null, reg_ref: "IND-2025-22100",
    indication: "CKD stage 3b–4 (eGFR 15–44 mL/min) not yet on dialysis",
    target: 48, start: "2025-06-01", end: "2027-06-01", actual_start: null,
  },
  {
    protocol: "PT-2025-0003", title: "PAINTHRESH: Oral GLP-1 for Chronic Low Back Pain",
    phase: "Phase II", status: "on_hold", therapeutic_area: "Pain Management",
    sponsor: "TrialSync Bio.", cro: "GlobalCRO Ltd.", reg_ref: "IND-2025-30050",
    indication: "Chronic non-specific low back pain ≥6 months, NRS ≥5",
    target: 180, start: "2025-09-01", end: "2027-09-01", actual_start: null,
  },
];

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

const SITE_DATA = [
  { name: "City General Hospital",       city: "New York",      state: "NY", country: "US", pi: "Dr. Robert Kim" },
  { name: "Lakeside Medical Center",     city: "Chicago",       state: "IL", country: "US", pi: "Dr. Fatima Al-Hassan" },
  { name: "Pacific Coast Clinical",      city: "Los Angeles",   state: "CA", country: "US", pi: "Dr. James Nguyen" },
  { name: "St. Mary's Research Unit",    city: "Boston",        state: "MA", country: "US", pi: "Dr. Claire O'Brien" },
  { name: "Sunbelt Research Institute",  city: "Houston",       state: "TX", country: "US", pi: "Dr. Marco Silva" },
  { name: "NovaCare Clinical Centre",    city: "Toronto",       state: "ON", country: "CA", pi: "Dr. Priya Mehta" },
  { name: "Royal London Trials Unit",    city: "London",        state: null, country: "GB", pi: "Dr. William Scott" },
  { name: "Charité Research Center",     city: "Berlin",        state: null, country: "DE", pi: "Dr. Hanna Mueller" },
  { name: "Hôpital Saint-Louis CRT",     city: "Paris",         state: null, country: "FR", pi: "Dr. Élise Bernard" },
  { name: "Hospital Clínic Trials",      city: "Barcelona",     state: null, country: "ES", pi: "Dr. Carlos Vidal" },
  { name: "Osaka Clinical Research",     city: "Osaka",         state: null, country: "JP", pi: "Dr. Yuki Tanaka" },
  { name: "AIIMS Clinical Trials Cell",  city: "New Delhi",     state: null, country: "IN", pi: "Dr. Arun Sharma" },
  { name: "Great Lakes Research Hub",    city: "Cleveland",     state: "OH", country: "US", pi: "Dr. Sandra Lee" },
  { name: "Midwest Academic Medical",    city: "Minneapolis",   state: "MN", country: "US", pi: "Dr. Erik Larson" },
  { name: "Southeast Research Partners", city: "Atlanta",       state: "GA", country: "US", pi: "Dr. Denise Brown" },
  { name: "Mountain West Clinical",      city: "Denver",        state: "CO", country: "US", pi: "Dr. Thomas Reyes" },
  { name: "Emerald Isle Clinical",       city: "Dublin",        state: null, country: "GB", pi: "Dr. Siobhan Murphy" },
  { name: "Cape Medical Research",       city: "Cape Town",     state: null, country: "ZA", pi: "Dr. Thabo Nkosi" },
  { name: "Amsterdam Clinical Hub",      city: "Amsterdam",     state: null, country: "NL", pi: "Dr. Anna de Vries" },
  { name: "Sydney Harbour Trials",       city: "Sydney",        state: null, country: "AU", pi: "Dr. Emma Taylor" },
];

const SUBJECT_STATUSES_DIST = [
  "enrolled", "enrolled", "enrolled", "active", "active", "active",
  "completed", "completed", "screened", "withdrawn", "screen_failed",
];

const WITHDRAWAL_REASONS = [
  "Patient withdrew consent due to personal reasons.",
  "Adverse event requiring study discontinuation.",
  "Lost to follow-up after relocation.",
  "Non-compliance with study protocol.",
  "Physician decision due to intercurrent illness.",
];

const SCREEN_FAIL_REASONS = [
  "Failed inclusion criterion: eGFR below minimum threshold.",
  "Active concurrent malignancy identified at screening.",
  "Prohibited concomitant medication could not be discontinued.",
  "Screening ECG showed QTc prolongation > 500ms.",
  "Baseline HbA1c outside protocol-specified range.",
];

// ─── main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting CTMS seed...\n");

  // 1. Create users
  console.log("👤 Creating users...");
  const userMap = {}; // email → { id, ... }

  for (const u of USER_DEFS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });
    if (error && !error.message.includes("already been registered")) {
      console.error(`  ✗ ${u.email}: ${error.message}`);
      continue;
    }

    // If already exists, look up
    let userId = data?.user?.id;
    if (!userId) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", u.email)
        .single();
      userId = existing?.id;
    }

    if (userId) {
      // Set role in profiles
      await supabase.from("profiles").upsert({ id: userId, email: u.email, full_name: u.full_name, role: u.role });
      userMap[u.email] = { id: userId, ...u };
      console.log(`  ✓ ${u.full_name} (${u.role}) — ${u.email}`);
    }
  }

  const studyManagers = Object.values(userMap).filter((u) => u.role === "study_manager");
  const monitors = Object.values(userMap).filter((u) => u.role === "monitor");
  const coordinators = Object.values(userMap).filter((u) => u.role === "site_coordinator");

  // 2. Create studies
  console.log("\n📋 Creating studies...");
  const studyMap = {}; // protocol → study row

  for (const sd of STUDY_DEFS) {
    const owner = rnd(studyManagers);
    const { data: study, error } = await supabase
      .from("studies")
      .insert({
        protocol_number: sd.protocol,
        title: sd.title,
        phase: sd.phase,
        status: sd.status,
        therapeutic_area: sd.therapeutic_area,
        sponsor_name: sd.sponsor,
        cro_partner: sd.cro,
        regulatory_reference: sd.reg_ref,
        indication: sd.indication,
        target_enrollment: sd.target,
        planned_start_date: sd.start,
        planned_end_date: sd.end,
        actual_start_date: sd.actual_start,
        created_by: owner.id,
        owner_user_id: owner.id,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ✗ ${sd.protocol}: ${error.message}`);
      continue;
    }
    studyMap[sd.protocol] = { ...study, _def: sd, _owner: owner };
    console.log(`  ✓ ${sd.protocol} — ${sd.title.slice(0, 50)}...`);

    // Add owner to study_team
    await supabase.from("study_team").upsert({
      study_id: study.id, user_id: owner.id, role: "study_manager"
    }, { onConflict: "study_id,user_id" });

    // Add a monitor to study_team
    const mon = rnd(monitors);
    await supabase.from("study_team").upsert({
      study_id: study.id, user_id: mon.id, role: "monitor"
    }, { onConflict: "study_id,user_id" });
  }

  // 3. Create milestones per study
  console.log("\n🏁 Creating milestones...");
  for (const [proto, study] of Object.entries(studyMap)) {
    const sd = study._def;
    const isCompleted = sd.status === "completed";
    const isActive = sd.status === "active";
    const startDate = sd.actual_start || sd.start;

    const milestoneInserts = MILESTONE_NAMES.map((name, idx) => {
      const plannedDate = addDays(startDate, idx * 90);
      let status = "pending";
      let actualDate = null;

      if (isCompleted) {
        status = "completed";
        actualDate = addDays(plannedDate, rndInt(-15, 30));
      } else if (isActive) {
        if (idx <= 3) {
          status = "completed";
          actualDate = addDays(plannedDate, rndInt(-10, 20));
        } else if (idx === 4) {
          status = rnd(["at_risk", "completed"]);
          if (status === "completed") actualDate = addDays(plannedDate, rndInt(-5, 15));
        } else {
          status = "pending";
        }
      }

      return {
        study_id: study.id,
        name,
        status,
        planned_date: plannedDate,
        actual_date: actualDate,
        board_order: idx,
        created_by: study._owner.id,
      };
    });

    const { error } = await supabase.from("milestones").insert(milestoneInserts);
    if (error) console.error(`  ✗ milestones for ${proto}: ${error.message}`);
    else console.log(`  ✓ ${MILESTONE_NAMES.length} milestones → ${proto}`);
  }

  // 4. Create sites (4–8 per study)
  console.log("\n🏥 Creating sites...");
  const siteMap = {}; // studyId → [site rows]

  for (const [proto, study] of Object.entries(studyMap)) {
    const sd = study._def;
    const numSites = rndInt(4, 8);
    const shuffled = [...SITE_DATA].sort(() => Math.random() - 0.5).slice(0, numSites);
    const sites = [];

    for (let i = 0; i < shuffled.length; i++) {
      const siteInfo = shuffled[i];
      const siteNum = `S-${String(i + 1).padStart(3, "0")}`;
      const siteStatus = sd.status === "completed" ? "closed"
        : sd.status === "setup" ? rnd(["identified", "selected"])
        : rnd(["active", "active", "initiated"]);
      const initiatedDate = sd.actual_start ? addDays(sd.actual_start, rndInt(30, 120)) : null;
      const targetEnroll = Math.round(sd.target / numSites + rndInt(-20, 20));
      const coord = rnd(coordinators);

      const { data: site, error } = await supabase
        .from("sites")
        .insert({
          study_id: study.id,
          site_number: siteNum,
          name: siteInfo.name,
          city: siteInfo.city,
          state: siteInfo.state,
          country: siteInfo.country,
          status: siteStatus,
          principal_investigator_name: siteInfo.pi,
          principal_investigator_email: `pi.${siteNum.toLowerCase().replace("-", "")}@${siteInfo.name.toLowerCase().replace(/[^a-z]/g, "")}.org`,
          irb_number: `IRB-${rndInt(2022, 2025)}-${rndInt(1000, 9999)}`,
          irb_approval_date: sd.actual_start ? addDays(sd.actual_start, rndInt(-30, 10)) : null,
          target_enrollment: targetEnroll > 0 ? targetEnroll : 10,
          initiated_date: initiatedDate,
          closed_date: sd.status === "completed" ? addDays(sd.end, rndInt(-30, 0)) : null,
        })
        .select()
        .single();

      if (error) { console.error(`  ✗ site ${siteNum}: ${error.message}`); continue; }
      sites.push({ ...site, _coord: coord });

      // Add site member (coordinator)
      await supabase.from("site_members").upsert({
        site_id: site.id, user_id: coord.id, role: "coordinator",
        permission_mask: 63, invited_by: study._owner.id,
      }, { onConflict: "site_id,user_id" });
    }

    siteMap[study.id] = sites;
    console.log(`  ✓ ${sites.length} sites → ${proto}`);
  }

  // 5. Create subjects per site
  console.log("\n👥 Creating subjects...");
  for (const [studyId, sites] of Object.entries(siteMap)) {
    const study = Object.values(studyMap).find((s) => s.id === studyId);
    const sd = study._def;
    const startDate = sd.actual_start || sd.start;
    let totalCreated = 0;

    for (const site of sites) {
      const numSubjects = rndInt(8, 22);

      for (let j = 0; j < numSubjects; j++) {
        const subjectNum = `${site.site_number}-${String(j + 1).padStart(3, "0")}`;
        const screenDate = addDays(startDate, rndInt(30, 400));
        // cap at 2026-03-14
        const capDate = (d) => d > "2026-03-14" ? "2026-03-14" : d;
        const screenDateCapped = capDate(screenDate);

        const status = rnd(SUBJECT_STATUSES_DIST);
        const enrollDate = ["enrolled","active","completed"].includes(status)
          ? capDate(addDays(screenDateCapped, rndInt(7, 30))) : null;
        const completionDate = status === "completed"
          ? capDate(addDays(enrollDate, rndInt(90, 365))) : null;
        const withdrawalReason = status === "withdrawn"
          ? rnd(WITHDRAWAL_REASONS) : null;
        const screenFailReason = status === "screen_failed"
          ? rnd(SCREEN_FAIL_REASONS) : null;

        const initials = `${rnd("ABCDEFGHJKLMNPQRSTUVWXYZ")}${rnd("ABCDEFGHJKLMNPQRSTUVWXYZ")}`;

        const { error } = await supabase.from("subjects").insert({
          study_id: studyId,
          site_id: site.id,
          subject_number: subjectNum,
          initials,
          status,
          screen_date: screenDateCapped,
          enrollment_date: enrollDate,
          completion_date: completionDate,
          withdrawal_reason: withdrawalReason,
          screen_failure_reason: screenFailReason,
        });

        if (!error) totalCreated++;
      }
    }
    console.log(`  ✓ ${totalCreated} subjects → ${sd.protocol}`);
  }

  // 6. Create documents per study
  console.log("\n📄 Creating documents...");
  const DOC_TYPES = [
    { doc_type: "protocol", name: "Study Protocol", version: "v3.0" },
    { doc_type: "icf", name: "Informed Consent Form", version: "v2.1" },
    { doc_type: "investigator_brochure", name: "Investigator Brochure", version: "v5.0" },
    { doc_type: "regulatory_submission", name: "IND Application", version: "v1.0" },
    { doc_type: "other", name: "Statistical Analysis Plan", version: "v1.2" },
  ];

  for (const [, study] of Object.entries(studyMap)) {
    const docs = DOC_TYPES.slice(0, rndInt(2, 5));
    for (const doc of docs) {
      const status = study._def.status === "completed" ? "approved"
        : study._def.status === "active" ? rnd(["approved", "under_review"]) : "draft";

      await supabase.from("documents").insert({
        study_id: study.id,
        name: `${doc.name} — ${study._def.protocol}`,
        doc_type: doc.doc_type,
        version: doc.version,
        status,
        uploaded_by: study._owner.id,
      });
    }
    console.log(`  ✓ ${docs.length} documents → ${study._def.protocol}`);
  }

  // 7. Audit logs
  console.log("\n📝 Seeding audit log entries...");
  const auditRows = [];
  for (const [, study] of Object.entries(studyMap)) {
    auditRows.push({
      table_name: "studies",
      record_id: study.id,
      action: "INSERT",
      new_data: { protocol_number: study.protocol_number, title: study.title },
      performed_by: study._owner.id,
      performed_at: study.created_at,
    });
  }
  await supabase.from("audit_logs").insert(auditRows);
  console.log(`  ✓ ${auditRows.length} audit entries`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("✅ SEED COMPLETE");
  console.log("═".repeat(60));
  console.log(`\nAll user passwords: ${SEED_PASSWORD}\n`);
  console.log("Users created:");
  for (const u of USER_DEFS) {
    console.log(`  [${u.role.padEnd(18)}] ${u.email}`);
  }
  console.log(`\nStudies: ${STUDY_DEFS.length}`);
  console.log(`Sites:   up to ${STUDY_DEFS.length * 8} (4–8 per study)`);
  console.log(`Subjects: ~${STUDY_DEFS.length * 6 * 15} (8–22 per site)`);
}

main().catch(console.error);
