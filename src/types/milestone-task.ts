import type { Milestone } from "@/types/database";

export interface MilestoneTask extends Milestone {
  site: {
    id: string;
    study_id: string;
    name: string;
    site_number: string;
  } | null;
  assignee: {
    id: string;
    email: string | null;
    full_name: string | null;
    role: string;
  } | null;
  study: {
    id: string;
    title: string;
    protocol_number: string;
  } | null;
  permissions: {
    can_edit: boolean;
    can_complete: boolean;
    can_delete: boolean;
  };
}

