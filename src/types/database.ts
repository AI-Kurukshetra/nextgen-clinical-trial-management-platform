export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Study {
  id: string;
  protocol_number: string;
  title: string;
  phase: string;
  status: string;
  therapeutic_area: string | null;
  sponsor_name: string | null;
  indication: string | null;
  target_enrollment: number | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  cro_partner: string | null;
  regulatory_reference: string | null;
  created_by: string | null;
  owner_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyTeamMember {
  id: string;
  study_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface Site {
  id: string;
  study_id: string;
  site_number: string;
  name: string;
  city: string | null;
  country: string;
  status: string;
  principal_investigator_name: string | null;
  principal_investigator_email: string | null;
  principal_investigator_phone: string | null;
  address: string | null;
  state: string | null;
  postal_code: string | null;
  irb_number: string | null;
  irb_approval_date: string | null;
  target_enrollment: number | null;
  enrolled_count: number;
  screen_failures: number;
  initiated_date: string | null;
  closed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  study_id: string;
  site_id: string;
  subject_number: string;
  initials: string | null;
  status: string;
  screen_date: string | null;
  enrollment_date: string | null;
  completion_date: string | null;
  withdrawal_reason: string | null;
  screen_failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteMember {
  id: string;
  site_id: string;
  user_id: string;
  role: string;
  permission_mask: number;
  invited_by: string | null;
  created_at: string;
}

export interface SubjectAssignment {
  id: string;
  subject_id: string;
  assignee_user_id: string;
  assigned_by: string | null;
  assignment_role: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubjectFormTemplate {
  id: string;
  study_id: string;
  site_id: string | null;
  name: string;
  description: string | null;
  schema: Record<string, unknown>;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubjectFormAssignment {
  id: string;
  template_id: string;
  study_id: string;
  site_id: string;
  subject_id: string;
  recurrence: "once" | "daily" | "weekly" | "monthly" | "ad_hoc";
  due_at: string | null;
  status: "assigned" | "submitted" | "overdue" | "cancelled";
  assigned_by: string | null;
  created_at: string;
}

export interface SubjectFormSubmission {
  id: string;
  assignment_id: string;
  template_id: string;
  study_id: string;
  site_id: string;
  subject_id: string;
  submitted_by: string | null;
  answers: Record<string, unknown>;
  notes: string | null;
  submitted_at: string;
}

export interface SubjectPortalLink {
  id: string;
  subject_id: string;
  user_id: string;
  linked_by: string | null;
  status: "active" | "inactive";
  created_at: string;
}

export interface MonitoringVisit {
  id: string;
  study_id: string;
  site_id: string;
  monitor_id: string | null;
  visit_type: string;
  status: string;
  planned_date: string;
  actual_date: string | null;
  subjects_reviewed: number | null;
  findings_summary: string | null;
  report_due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deviation {
  id: string;
  study_id: string;
  site_id: string;
  subject_id: string | null;
  deviation_number: string;
  category: string;
  description: string;
  severity: string;
  status: string;
  reported_date: string;
  resolved_date: string | null;
  root_cause: string | null;
  corrective_action: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  study_id: string;
  name: string;
  description: string | null;
  planned_date: string | null;
  actual_date: string | null;
  status: string;
  site_id: string | null;
  assignee_user_id: string | null;
  created_by: string | null;
  board_order: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  study_id: string;
  site_id: string | null;
  name: string;
  doc_type: string;
  version: string;
  status: string;
  file_url: string | null;
  file_size: number | null;
  file_mime: string | null;
  s3_key: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  table_name: string;
  record_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  performed_by: string | null;
  performed_at: string;
}

export interface Signature {
  id: string;
  table_name: "documents";
  record_id: string;
  signed_by: string;
  reason: string;
  meaning: string;
  ip_address: string | null;
  user_agent: string | null;
  signed_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
      studies: {
        Row: Study;
        Insert: Omit<Study, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Study>;
      };
      study_team: {
        Row: StudyTeamMember;
        Insert: Omit<StudyTeamMember, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<StudyTeamMember>;
      };
      sites: {
        Row: Site;
        Insert: Omit<Site, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Site>;
      };
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Subject>;
      };
      site_members: {
        Row: SiteMember;
        Insert: Omit<SiteMember, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<SiteMember>;
      };
      subject_assignments: {
        Row: SubjectAssignment;
        Insert: Omit<SubjectAssignment, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<SubjectAssignment>;
      };
      subject_form_templates: {
        Row: SubjectFormTemplate;
        Insert: Omit<SubjectFormTemplate, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<SubjectFormTemplate>;
      };
      subject_form_assignments: {
        Row: SubjectFormAssignment;
        Insert: Omit<SubjectFormAssignment, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<SubjectFormAssignment>;
      };
      subject_form_submissions: {
        Row: SubjectFormSubmission;
        Insert: Omit<SubjectFormSubmission, "id" | "submitted_at"> & {
          id?: string;
          submitted_at?: string;
        };
        Update: Partial<SubjectFormSubmission>;
      };
      subject_portal_links: {
        Row: SubjectPortalLink;
        Insert: Omit<SubjectPortalLink, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<SubjectPortalLink>;
      };
      monitoring_visits: {
        Row: MonitoringVisit;
        Insert: Omit<MonitoringVisit, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<MonitoringVisit>;
      };
      deviations: {
        Row: Deviation;
        Insert: Omit<Deviation, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Deviation>;
      };
      milestones: {
        Row: Milestone;
        Insert: Omit<Milestone, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Milestone>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Document>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "performed_at"> & {
          id?: number;
          performed_at?: string;
        };
        Update: Partial<AuditLog>;
      };
      signatures: {
        Row: Signature;
        Insert: Omit<Signature, "id" | "signed_at"> & {
          id?: string;
          signed_at?: string;
        };
        Update: Partial<Signature>;
      };
    };
  };
}
