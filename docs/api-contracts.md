# API Contracts

## Conventions

- All app APIs are under `/api/*`.
- Success shape: `{ success: true, data, message?, metadata? }`
- Error shape: `{ success: false, error: { message, code? }, message?, details? }`
- Auth uses Supabase session cookies.

## Studies

### `GET /api/studies`

- Returns only studies visible to current user scope:
  - global role (`admin`) sees all
  - others see studies through `study_team` or `site_members`
- Response `200`: `Study[]`

### `POST /api/studies`

- Creates a study.
- Authorization: any authenticated user can create.
- Side effects:
  - Auto-generates `protocol_number` when omitted (format `ST-{year}-{####}`).
  - Sets `owner_user_id` to creator.
  - Inserts creator into `study_team` as `owner`.
  - Inserts 9 standard milestones.
  - Writes an audit log entry.
- Implementation note:
  - Uses DB RPC `create_study_as_owner(...)` (security definer) for a stable, RLS-safe create path.
- Request body: `studyCreateSchema` (`src/types/schemas/study.ts`)
- Response `201`: `Study`

### `GET /api/studies/:id`

- Returns one study by id.
- Response `200`: `Study`
- Errors: `401`, `404`

### `PUT /api/studies/:id`

- Updates a study.
- Request body: `studyUpdateSchema` (`src/types/schemas/study.ts`)
- Response `200`: updated `Study`
- Side effect: audit log `UPDATE`
- Supports protocol text updates: `safety_rules`, `statistical_plan`

### `DELETE /api/studies/:id`

- Deletes a study.
- Response `200`: `null`
- Side effect: audit log `DELETE`

## Sites

### `GET /api/sites?study_id=:id`

- Returns all sites for a study.
- Response `200`: `Site[]`
- Errors: `400` if `study_id` missing, `401`

### `POST /api/sites`

- Creates a site under a study.
- Authorization: caller must have write scope on the target study (`canManageStudy`).
- Side effects:
  - Auto-generates `site_number` when omitted (format `S-###` per study).
  - Adds creator as `owner` in `site_members` with full permission mask.
- Request body: `siteCreateSchema` (`src/types/schemas/site.ts`)
- Response `201`: `Site`
- Side effect: audit log `INSERT`
- Errors: `401`, `403`

### `GET /api/sites/:id`

- Returns a site by id.
- Response `200`: `Site`
- Errors: `401`, `404`

### `PUT /api/sites/:id`

- Updates a site.
- Request body: `siteUpdateSchema` (`src/types/schemas/site.ts`)
- Response `200`: updated `Site`
- Side effect: audit log `UPDATE`

### `GET /api/sites/:id/members`

- Returns site members with basic profile info.
- Response `200`: `SiteMemberWithProfile[]`
- Errors: `401`, `403`

### `POST /api/sites/:id/members`

- Adds or upserts a member for a site.
- Request body: `siteMemberCreateSchema` (`src/types/schemas/site-permissions.ts`)
- Response `201`: `SiteMember`
- Errors: `401`, `403`

### `PUT /api/sites/:id/members/:memberId`

- Updates role/permission mask for a site member.
- Request body: `siteMemberUpdateSchema` (`src/types/schemas/site-permissions.ts`)
- Response `200`: updated `SiteMember`
- Errors: `401`, `403`, `404`

### `DELETE /api/sites/:id/members/:memberId`

- Removes a site member (owner cannot be removed).
- Response `200`: `null`
- Errors: `401`, `403`, `404`

## Subjects

### `GET /api/subjects?study_id=:id[&site_id=:id]`

- Returns subjects for a study (optionally filtered by site).
- Response `200`: `Subject[]`
- Errors: `400` if `study_id` missing, `401`

### `POST /api/subjects`

- Creates/enrolls a subject.
- Request body: `subjectCreateSchema` (`src/types/schemas/subject.ts`)
- Response `201`: `Subject`
- Side effect: audit log `INSERT`

### `GET /api/subjects/:id`

- Returns a subject by id.
- Response `200`: `Subject`
- Errors: `401`, `404`

### `PUT /api/subjects/:id`

- Updates a subject lifecycle/status fields.
- Request body: `subjectUpdateSchema` (`src/types/schemas/subject.ts`)
- Response `200`: updated `Subject`
- Side effect: audit log `UPDATE`

### `GET /api/subject-assignments?study_id=:id[&site_id=:id]`

- Returns subject responsibility assignments for allowed sites.
- Response `200`: `SubjectAssignmentView[]`
- Errors: `400` if `study_id` missing, `401`

### `POST /api/subject-assignments`

- Creates or upserts an assignment (`subject_id + assignee_user_id` unique).
- Request body: `subjectAssignmentCreateSchema` (`src/types/schemas/site-permissions.ts`)
- Response `201`: `SubjectAssignmentView`
- Side effect: audit log `INSERT`

### `DELETE /api/subject-assignments/:id`

- Removes a subject assignment.
- Response `200`: `null`
- Errors: `401`, `403`, `404`

## Subject Forms (No-code Patient Data Capture)

### `GET /api/subject-forms/templates?study_id=:id[&site_id=:id]`

- Returns form templates for a study or optional site scope.
- Errors: `400`, `401`, `403`

### `POST /api/subject-forms/templates`

- Creates a no-code template (`schema` JSON payload).
- Request body: `subjectFormTemplateCreateSchema` (`src/types/schemas/subject-forms.ts`)
- Errors: `400`, `401`, `403`

### `GET/PUT/DELETE /api/subject-forms/templates/:id`

- Reads, updates, or deletes a template.
- Errors: `401`, `403`, `404`

### `GET /api/subject-forms/assignments?study_id=:id[&site_id=:id][&subject_id=:id]`

- Returns assignments in study scope.
- Errors: `400`, `401`, `403`

### `POST /api/subject-forms/assignments`

- Assigns a template to a subject with recurrence + due date.
- Request body: `subjectFormAssignmentCreateSchema`
- Errors: `400`, `401`, `403`, `404`

### `POST /api/subject-forms/assignments/submit`

- Submits answers for an assignment and marks it submitted.
- Request body: `subjectFormSubmitSchema`
- Errors: `400`, `401`, `403`, `404`

### `POST /api/subject-forms/portal-links`

- Links subject record to patient auth account.
- Request body: `subjectPortalLinkCreateSchema`
- Errors: `400`, `401`, `403`, `404`

### `GET /api/portal/assignments`

- Returns current patient's assigned forms with template metadata.
- Errors: `401`

### `GET /api/profiles/search?q=:text`

- Lightweight user search for member/assignment pickers.
- Returns empty list when query length < 2.
- Response `200`: `{id,email,full_name,role}[]`
- Errors: `401`

## Monitoring Visits

### `GET /api/monitoring-visits?study_id=:id`

- Returns monitoring visits for a study.
- Response `200`: `MonitoringVisit[]`
- Errors: `400` when `study_id` missing (unless `mine=true`), `401`

### `GET /api/monitoring-visits?mine=true`

- Returns visits assigned to current user (`monitor_id = auth.uid()`).
- Response `200`: `MonitoringVisit[]`

### `POST /api/monitoring-visits`

- Schedules a monitoring visit.
- Request body: `monitoringVisitCreateSchema` (`src/types/schemas/monitoring-visit.ts`)
- Response `201`: `MonitoringVisit`
- Side effect: audit log `INSERT`

### `GET /api/monitoring-visits/:id`

- Returns one monitoring visit.
- Response `200`: `MonitoringVisit`
- Errors: `401`, `404`

### `PUT /api/monitoring-visits/:id`

- Updates monitoring visit status and completion details.
- Request body: `monitoringVisitUpdateSchema` (`src/types/schemas/monitoring-visit.ts`)
- Response `200`: updated `MonitoringVisit`
- Side effect: audit log `UPDATE`

## Signatures

### `POST /api/signatures`

- Captures a basic electronic signature with credential re-confirmation.
- Request body: `signatureCreateSchema` (`src/types/schemas/signature.ts`)
- Behavior:
  - Verifies current user's email/password via Supabase `signInWithPassword`.
  - Inserts a `signatures` row.
  - For `documents` + meaning `Approved`, updates document `status = approved`.
  - For `deviations` + meaning `Closed`, updates deviation `status = closed` and stamps `resolved_date`.
  - Writes audit logs for signature insert and any record status update.
- Response `201`: `Signature`
- Errors: `400`, `401`, `403`, `404`

### `GET /api/signatures/:recordId?table_name=:table`

- Returns signatures for a specific record (`documents`, `deviations`, `monitoring_visits`).
- Query param:
  - `table_name` required enum: `documents | deviations | monitoring_visits`
- Response `200`: `Signature[]` ordered by `signed_at desc`
- Errors: `400`, `401`, `403`, `404`

## Deviations

### `GET /api/deviations?study_id=:id`

- Returns deviations for a study.
- Response `200`: `Deviation[]`
- Errors: `400` if `study_id` missing, `401`

### `POST /api/deviations`

- Logs a deviation.
- Request body: `deviationCreateSchema` (`src/types/schemas/deviation.ts`)
- Response `201`: `Deviation`
- Side effect: audit log `INSERT`

### `GET /api/deviations/:id`

- Returns one deviation.
- Response `200`: `Deviation`
- Errors: `401`, `404`

### `PUT /api/deviations/:id`

- Updates deviation triage and resolution fields.
- Request body: `deviationUpdateSchema` (`src/types/schemas/deviation.ts`)
- Response `200`: updated `Deviation`
- Side effect: audit log `UPDATE`

## Milestones

### `GET /api/milestones?study_id=:id`

- Returns milestone tasks for a study (kanban-ready, includes site/assignee/study metadata and permission flags).
- Response `200`: `MilestoneTask[]`
- Errors: `400` if `study_id` missing, `401`

### `GET /api/milestones?mine=true[&study_id=:id]`

- Returns tasks assigned directly to current user or to clinics where user is a member.
- Optional `study_id` filters assigned tasks within one study.
- Response `200`: `MilestoneTask[]`

### `POST /api/milestones`

- Creates an additional milestone task.
- Request body: `milestoneCreateSchema` (`src/types/schemas/milestone.ts`)
- Supports assignment fields: `site_id`, `assignee_user_id`, `description`, `board_order`.
- Response `201`: `MilestoneTask`
- Side effect: audit log `INSERT`

### `GET /api/milestones/:id`

- Returns one milestone task with assignment metadata and permission flags.
- Response `200`: `MilestoneTask`
- Errors: `401`, `404`

### `PUT /api/milestones/:id`

- Updates milestone task fields.
- Request body: `milestoneUpdateSchema` (`src/types/schemas/milestone.ts`)
- Behavior:
  - Study manager/admin: full edit (name, dates, status, assignment, order).
  - Assigned user/clinic member: completion-only update (`status` to `completed|missed`, `actual_date`).
- Response `200`: updated `MilestoneTask`
- Side effect: audit log `UPDATE`

### `DELETE /api/milestones/:id`

- Deletes one milestone task.
- Allowed for study manager/admin scope only.
- Response `200`: `null`
- Side effect: audit log `DELETE`

## Audit Logs

### `GET /api/audit-logs?limit=:n`

- Returns recent audit entries ordered by `performed_at desc`.
- Response `200`: `AuditActivity[]`
- Query param:
  - `limit` optional, clamped to `1..100`, default `10`
- Errors: `401`
- Enriched activity fields:
  - `actor_name`: resolved from `profiles.full_name` (fallback email or `"A user"`)
  - `actor_email`: resolved from `profiles.email`
  - `entity_label`: normalized CTMS entity label (`study`, `site`, etc.)
  - `entity_name`: best-effort identifier from payload (`protocol_number`, `site_number`, etc.)
  - `message`: human-readable sentence for dashboard feed (for example, `Ketan Rathod added study ABC-123`)

## Documents

### `GET /api/documents?study_id=:id[&site_id=:id]`

- Returns document metadata for a study (optionally filtered by site).
- Response `200`: `Document[]`
- Errors: `400` if `study_id` missing, `401`

### `POST /api/documents`

- Creates a document metadata record after successful object storage upload.
- Request body: `documentCreateSchema` (`src/types/schemas/document.ts`)
- Response `201`: `Document`
- Side effects:
  - Marks previous records with same `study_id + name + doc_type` as `superseded`
  - Writes audit log `INSERT`

### `GET /api/documents/:id`

- Returns one document metadata record.
- Response `200`: `Document`
- Errors: `401`, `404`

### `PUT /api/documents/:id`

- Updates document metadata and workflow status.
- Request body: `documentUpdateSchema` (`src/types/schemas/document.ts`)
- Response `200`: updated `Document`
- Side effect: audit log `UPDATE`

### `DELETE /api/documents/:id`

- Deletes a document metadata record.
- Response `200`: `null`
- Side effect: audit log `DELETE`

### `POST /api/documents/presign`

- Returns short-lived presigned PUT URL for direct MinIO/S3 upload.
- Request body: `documentPresignSchema` (`src/types/schemas/document.ts`)
- Response `200`: `{ uploadUrl, s3Key, publicUrl }`

### `GET /api/documents/download/:id`

- Returns short-lived presigned GET URL for document download.
- Response `200`: `{ downloadUrl }`
- Errors: `401`, `404`

## Protocol & Design Sub-Entities

All list endpoints require `study_id` query param. All payload validation is powered by `src/types/schemas/protocol.ts`.

### `GET/POST /api/protocol-objectives`

- GET response `200`: `ProtocolObjective[]`
- POST response `201`: `ProtocolObjective`

### `GET/PUT/DELETE /api/protocol-objectives/:id`

- GET response `200`: `ProtocolObjective`
- PUT response `200`: updated `ProtocolObjective`
- DELETE response `200`: `null`

### `GET/POST /api/eligibility-criteria`

- GET response `200`: `EligibilityCriterion[]`
- POST response `201`: `EligibilityCriterion`

### `GET/PUT/DELETE /api/eligibility-criteria/:id`

- GET response `200`: `EligibilityCriterion`
- PUT response `200`: updated `EligibilityCriterion`
- DELETE response `200`: `null`

### `GET/POST /api/study-arms`

- GET response `200`: `StudyArm[]`
- POST response `201`: `StudyArm`

### `GET/PUT/DELETE /api/study-arms/:id`

- GET response `200`: `StudyArm`
- PUT response `200`: updated `StudyArm`
- DELETE response `200`: `null`

### `GET/POST /api/visit-definitions`

- GET response `200`: `VisitDefinition[]`
- POST response `201`: `VisitDefinition`

### `GET/PUT/DELETE /api/visit-definitions/:id`

- GET response `200`: `VisitDefinition`
- PUT response `200`: updated `VisitDefinition`
- DELETE response `200`: `null`

### `GET/POST /api/protocol-endpoints`

- GET response `200`: `ProtocolEndpoint[]`
- POST response `201`: `ProtocolEndpoint`

### `GET/PUT/DELETE /api/protocol-endpoints/:id`

- GET response `200`: `ProtocolEndpoint`
- PUT response `200`: updated `ProtocolEndpoint`
- DELETE response `200`: `null`

### `GET/POST /api/protocol-amendments`

- GET response `200`: `ProtocolAmendment[]`
- POST response `201`: `ProtocolAmendment`

### `GET/PUT/DELETE /api/protocol-amendments/:id`

- GET response `200`: `ProtocolAmendment`
- PUT response `200`: updated `ProtocolAmendment`
- DELETE response `200`: `null`

## Users / Profile

### `GET /api/profile/current`

- Returns current auth user + profile.

### `GET /api/users`

- Admin-only paginated profile list.

### `PATCH /api/users/:id/role`

- Admin-only role update on `profiles.role`.
