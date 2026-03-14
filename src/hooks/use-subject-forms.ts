"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import type {
  SubjectFormAssignment,
  SubjectFormSubmission,
  SubjectFormTemplate,
  SubjectPortalLink,
} from "@/types/database";
import type {
  SubjectFormAssignmentCreateInput,
  SubjectFormSubmitInput,
  SubjectFormTemplateCreateInput,
  SubjectFormTemplateUpdateInput,
  SubjectPortalLinkCreateInput,
} from "@/types/schemas";

function templatePath(studyId: string, siteId?: string | null) {
  const params = new URLSearchParams({ study_id: studyId });
  if (siteId) params.set("site_id", siteId);
  return `/subject-forms/templates?${params.toString()}`;
}

function assignmentPath(studyId: string, siteId?: string | null, subjectId?: string | null) {
  const params = new URLSearchParams({ study_id: studyId });
  if (siteId) params.set("site_id", siteId);
  if (subjectId) params.set("subject_id", subjectId);
  return `/subject-forms/assignments?${params.toString()}`;
}

export function useSubjectFormTemplates(studyId: string, siteId?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.subjectForms.templates(studyId, siteId),
    queryFn: () => apiGet<SubjectFormTemplate[]>(templatePath(studyId, siteId)),
    enabled: Boolean(studyId),
  });
}

export function useCreateSubjectFormTemplate(studyId: string, siteId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectFormTemplateCreateInput) =>
      apiPost<SubjectFormTemplate>("/subject-forms/templates", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subjectForms.templates(studyId, siteId),
      });
    },
  });
}

export function useUpdateSubjectFormTemplate(studyId: string, siteId?: string | null, templateId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectFormTemplateUpdateInput) =>
      apiPut<SubjectFormTemplate>(`/subject-forms/templates/${templateId}`, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subjectForms.templates(studyId, siteId),
      });
    },
  });
}

export function useSubjectFormAssignments(studyId: string, siteId?: string | null, subjectId?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.subjectForms.assignments(studyId, siteId, subjectId),
    queryFn: () => apiGet<SubjectFormAssignment[]>(assignmentPath(studyId, siteId, subjectId)),
    enabled: Boolean(studyId),
  });
}

export function useCreateSubjectFormAssignment(studyId: string, siteId?: string | null, subjectId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectFormAssignmentCreateInput) =>
      apiPost<SubjectFormAssignment>("/subject-forms/assignments", input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.subjectForms.assignments(studyId, siteId, subjectId),
        }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjectForms.portalAssignments }),
      ]);
    },
  });
}

export function useSubmitSubjectForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectFormSubmitInput) =>
      apiPost<SubjectFormSubmission>("/subject-forms/assignments/submit", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjectForms.portalAssignments });
    },
  });
}

export function usePortalAssignments() {
  return useQuery({
    queryKey: QUERY_KEYS.subjectForms.portalAssignments,
    queryFn: () => apiGet<Array<SubjectFormAssignment & { template?: SubjectFormTemplate | null }>>("/portal/assignments"),
  });
}

export function useLinkSubjectPortal(studyId: string, siteId?: string | null, subjectId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectPortalLinkCreateInput) =>
      apiPost<SubjectPortalLink>("/subject-forms/portal-links", input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subjectForms.assignments(studyId, siteId, subjectId),
      });
    },
  });
}
