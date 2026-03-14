"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSites } from "@/hooks/use-sites";
import { useSubjectFormAssignments, useSubjectFormTemplates, useCreateSubjectFormAssignment, useCreateSubjectFormTemplate, useLinkSubjectPortal } from "@/hooks/use-subject-forms";
import { useSubjects } from "@/hooks/use-subjects";
import { getErrorMessage } from "@/lib/utils";
import {
  FORM_RECURRENCES,
  subjectFormAssignmentCreateSchema,
  subjectFormTemplateCreateSchema,
  subjectPortalLinkCreateSchema,
  type SubjectFormAssignmentCreateInput,
  type SubjectFormTemplateCreateInput,
  type SubjectPortalLinkCreateInput,
} from "@/types/schemas";

export default function StudyFormsPage() {
  const params = useParams<{ id: string }>();
  const studyId = params.id;

  const { data: sites } = useSites(studyId);
  const { data: subjects } = useSubjects(studyId);
  const { data: templates } = useSubjectFormTemplates(studyId);
  const { data: assignments } = useSubjectFormAssignments(studyId);

  const createTemplate = useCreateSubjectFormTemplate(studyId);
  const createAssignment = useCreateSubjectFormAssignment(studyId);
  const linkPortal = useLinkSubjectPortal(studyId);

  const templateForm = useForm<SubjectFormTemplateCreateInput>({
    resolver: zodResolver(subjectFormTemplateCreateSchema),
    defaultValues: { study_id: studyId, site_id: null, name: "", description: "", schema: { fields: [] }, is_active: true },
  });

  const assignmentForm = useForm<SubjectFormAssignmentCreateInput>({
    resolver: zodResolver(subjectFormAssignmentCreateSchema),
    defaultValues: {
      study_id: studyId,
      template_id: "",
      site_id: "",
      subject_id: "",
      recurrence: "ad_hoc",
      due_at: null,
    },
  });

  const linkForm = useForm<SubjectPortalLinkCreateInput>({
    resolver: zodResolver(subjectPortalLinkCreateSchema),
    defaultValues: { subject_id: "", user_id: "" },
  });

  async function onCreateTemplate(values: SubjectFormTemplateCreateInput) {
    try {
      await createTemplate.mutateAsync({
        ...values,
        study_id: studyId,
      });
      toast.success("Template created.");
      templateForm.reset({ study_id: studyId, site_id: null, name: "", description: "", schema: { fields: [] }, is_active: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create template."));
    }
  }

  async function onAssign(values: SubjectFormAssignmentCreateInput) {
    try {
      await createAssignment.mutateAsync({ ...values, study_id: studyId });
      toast.success("Form assigned.");
      assignmentForm.reset({
        study_id: studyId,
        template_id: "",
        site_id: "",
        subject_id: "",
        recurrence: "ad_hoc",
        due_at: null,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to assign form."));
    }
  }

  async function onLink(values: SubjectPortalLinkCreateInput) {
    try {
      await linkPortal.mutateAsync(values);
      toast.success("Portal link created.");
      linkForm.reset({ subject_id: "", user_id: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to link subject portal."));
    }
  }

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={studyId} />

      <div>
        <h2 className="text-xl font-semibold">Subject Forms</h2>
        <p className="text-sm text-muted-foreground">
          No-code subject data capture for daily diaries, meal logs, side-effects, and scheduled follow-up forms.
        </p>
      </div>

      <section className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Study owner configures templates. Site owner/admin assigns forms to subjects. Subjects submit entries via{" "}
        <span className="font-medium text-foreground">/portal</span>. All actions remain audit-tracked.
      </section>

      <section className="grid gap-4 rounded-lg border p-4">
        <h3 className="font-semibold">Create Form Template</h3>
        <form onSubmit={templateForm.handleSubmit(onCreateTemplate)} className="grid gap-3 md:grid-cols-2">
          <Input type="hidden" {...templateForm.register("study_id")} />
          <div className="space-y-1">
            <Label>Template Name</Label>
            <Input {...templateForm.register("name")} placeholder="Daily Meal + Side Effects" />
          </div>
          <div className="space-y-1">
            <Label>Scope Site (optional)</Label>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              {...templateForm.register("site_id")}
            >
              <option value="">All sites (study-wide)</option>
              {(sites ?? []).map((site) => (
                <option key={site.id} value={site.id}>
                  {site.site_number} · {site.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Description</Label>
            <Input {...templateForm.register("description")} placeholder="Capture meal quality, appetite score, and any adverse symptoms." />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Schema JSON</Label>
            <Input
              value={JSON.stringify(templateForm.watch("schema") ?? { fields: [] })}
              onChange={(event) => {
                try {
                  const next = JSON.parse(event.target.value) as Record<string, unknown>;
                  templateForm.setValue("schema", next);
                } catch {
                  // Keep previous valid JSON while user edits.
                }
              }}
              placeholder='{"fields":[{"key":"meal_quality","label":"Meal quality","type":"select","options":["Good","Average","Poor"]}]}'
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" loading={createTemplate.isPending}>
              Create Template
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 rounded-lg border p-4">
        <h3 className="font-semibold">Assign Template To Subject</h3>
        <form onSubmit={assignmentForm.handleSubmit(onAssign)} className="grid gap-3 md:grid-cols-2">
          <Input type="hidden" {...assignmentForm.register("study_id")} />
          <div className="space-y-1">
            <Label>Template</Label>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              {...assignmentForm.register("template_id")}
            >
              <option value="">Select template</option>
              {(templates ?? []).map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Site</Label>
            <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" {...assignmentForm.register("site_id")}>
              <option value="">Select site</option>
              {(sites ?? []).map((site) => (
                <option key={site.id} value={site.id}>
                  {site.site_number} · {site.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Subject</Label>
            <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" {...assignmentForm.register("subject_id")}>
              <option value="">Select subject</option>
              {(subjects ?? []).map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_number}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Recurrence</Label>
            <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" {...assignmentForm.register("recurrence")}>
              {FORM_RECURRENCES.map((recurrence) => (
                <option key={recurrence} value={recurrence}>
                  {recurrence}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Due At (optional)</Label>
            <Input
              type="datetime-local"
              onChange={(event) => {
                const value = event.target.value;
                assignmentForm.setValue("due_at", value ? new Date(value).toISOString() : null);
              }}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" loading={createAssignment.isPending}>
              Assign Form
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 rounded-lg border p-4">
        <h3 className="font-semibold">Link Subject To Portal User</h3>
        <p className="text-sm text-muted-foreground">
          Use this once per subject so that patient account can submit assigned forms at <span className="font-medium text-foreground">/portal</span>.
        </p>
        <form onSubmit={linkForm.handleSubmit(onLink)} className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Subject</Label>
            <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" {...linkForm.register("subject_id")}>
              <option value="">Select subject</option>
              {(subjects ?? []).map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_number}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>User ID</Label>
            <Input {...linkForm.register("user_id")} placeholder="Supabase auth user UUID for the patient" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" loading={linkPortal.isPending}>
              Link Portal Access
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border p-4">
        <h3 className="font-semibold">Recent Assignments</h3>
        <div className="mt-3 space-y-2 text-sm">
          {(assignments ?? []).slice(0, 10).map((assignment) => (
            <div key={assignment.id} className="rounded-md border bg-muted/20 p-2">
              <p className="font-medium">
                Subject {assignment.subject_id.slice(0, 8)} · {assignment.status}
              </p>
              <p className="text-muted-foreground">
                Recurrence: {assignment.recurrence} · Due: {assignment.due_at ? new Date(assignment.due_at).toLocaleString() : "-"}
              </p>
            </div>
          ))}
          {(assignments ?? []).length === 0 ? (
            <p className="text-muted-foreground">No assignments yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
