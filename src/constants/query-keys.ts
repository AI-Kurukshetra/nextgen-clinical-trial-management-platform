export const QUERY_KEYS = {
  studies: {
    all: ["studies"] as const,
    detail: (id: string) => ["studies", "detail", id] as const,
  },
  sites: {
    byStudy: (studyId: string) => ["sites", "study", studyId] as const,
    detail: (id: string) => ["sites", "detail", id] as const,
    members: (siteId: string) => ["sites", "members", siteId] as const,
  },
  subjects: {
    byStudy: (studyId: string) => ["subjects", "study", studyId] as const,
    bySite: (studyId: string, siteId: string) => ["subjects", "study", studyId, "site", siteId] as const,
    detail: (id: string) => ["subjects", "detail", id] as const,
    assignments: (studyId: string, siteId?: string) =>
      ["subjects", "assignments", "study", studyId, "site", siteId ?? "all"] as const,
  },
  monitoringVisits: {
    byStudy: (studyId: string) => ["monitoring-visits", "study", studyId] as const,
    mine: ["monitoring-visits", "mine"] as const,
    detail: (id: string) => ["monitoring-visits", "detail", id] as const,
  },
  deviations: {
    byStudy: (studyId: string) => ["deviations", "study", studyId] as const,
    detail: (id: string) => ["deviations", "detail", id] as const,
  },
  milestones: {
    byStudy: (studyId: string) => ["milestones", "study", studyId] as const,
    detail: (id: string) => ["milestones", "detail", id] as const,
    mine: ["milestones", "mine"] as const,
  },
  documents: {
    byStudy: (studyId: string, siteId?: string | null) =>
      ["documents", "study", studyId, "site", siteId ?? "all"] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
  },
  signatures: {
    byRecord: (tableName: "documents" | "deviations" | "monitoring_visits", recordId: string) =>
      ["signatures", "table", tableName, "record", recordId] as const,
  },
  profile: {
    current: ["profile", "current"] as const,
  },
  subjectForms: {
    templates: (studyId: string, siteId?: string | null) =>
      ["subject-forms", "templates", "study", studyId, "site", siteId ?? "all"] as const,
    assignments: (studyId: string, siteId?: string | null, subjectId?: string | null) =>
      [
        "subject-forms",
        "assignments",
        "study",
        studyId,
        "site",
        siteId ?? "all",
        "subject",
        subjectId ?? "all",
      ] as const,
    portalAssignments: ["subject-forms", "portal-assignments"] as const,
  },
  users: {
    all: ["users"] as const,
  },
} as const;
