import type { AuditLog } from "@/types/database";

export interface ActivityActor {
  fullName: string | null;
  email: string | null;
}

export interface FormattedAuditActivity {
  actorName: string;
  actorEmail: string | null;
  entityLabel: string;
  entityName: string | null;
  message: string;
}

const ENTITY_CONFIG: Record<string, { label: string; identifierKeys: string[] }> = {
  studies: { label: "study", identifierKeys: ["protocol_number", "title", "id"] },
  sites: { label: "site", identifierKeys: ["site_number", "name", "id"] },
  subjects: { label: "subject", identifierKeys: ["subject_number", "id"] },
  monitoring_visits: { label: "monitoring visit", identifierKeys: ["visit_type", "id"] },
  deviations: { label: "deviation", identifierKeys: ["deviation_number", "id"] },
  milestones: { label: "milestone", identifierKeys: ["name", "id"] },
  documents: { label: "document", identifierKeys: ["name", "doc_type", "id"] },
};

const NON_MEANINGFUL_UPDATE_KEYS = new Set(["updated_at", "created_at"]);

function normalizeRecord(payload: Record<string, unknown> | null | undefined): Record<string, unknown> {
  return payload ?? {};
}

function asReadableString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}

function humanizeKey(key: string): string {
  return key.replace(/_/g, " ");
}

function pickEntityName(
  tableName: string,
  newData: Record<string, unknown>,
  oldData: Record<string, unknown>
): string | null {
  const config = ENTITY_CONFIG[tableName];
  if (!config) return asReadableString(newData.id) ?? asReadableString(oldData.id);

  for (const key of config.identifierKeys) {
    const value = asReadableString(newData[key]) ?? asReadableString(oldData[key]);
    if (value) return value;
  }

  return null;
}

function detectUpdatedField(newData: Record<string, unknown>, oldData: Record<string, unknown>): string | null {
  const candidateKeys = new Set([...Object.keys(newData), ...Object.keys(oldData)]);

  for (const key of candidateKeys) {
    if (NON_MEANINGFUL_UPDATE_KEYS.has(key)) continue;
    if (JSON.stringify(newData[key]) !== JSON.stringify(oldData[key])) {
      return key;
    }
  }

  return null;
}

function buildMessage(log: AuditLog, actorName: string, entityLabel: string, entityName: string | null): string {
  const newData = normalizeRecord(log.new_data);
  const oldData = normalizeRecord(log.old_data);
  const namePart = entityName ? ` ${entityName}` : "";

  if (log.action === "INSERT") {
    return `${actorName} added ${entityLabel}${namePart}`;
  }

  if (log.action === "DELETE") {
    return `${actorName} deleted ${entityLabel}${namePart}`;
  }

  const updatedField = detectUpdatedField(newData, oldData);
  if (!updatedField) {
    return `${actorName} updated ${entityLabel}${namePart}`;
  }

  const fieldValue = asReadableString(newData[updatedField]);
  if (!fieldValue) {
    return `${actorName} updated ${entityLabel}${namePart} (${humanizeKey(updatedField)})`;
  }

  return `${actorName} updated ${entityLabel}${namePart}: ${humanizeKey(updatedField)} set to ${fieldValue}`;
}

export function formatAuditActivity(log: AuditLog, actor?: ActivityActor): FormattedAuditActivity {
  const actorName = actor?.fullName?.trim() || actor?.email?.trim() || "A user";
  const newData = normalizeRecord(log.new_data);
  const oldData = normalizeRecord(log.old_data);

  const config = ENTITY_CONFIG[log.table_name];
  const entityLabel = config?.label ?? log.table_name.replace(/_/g, " ");
  const entityName = pickEntityName(log.table_name, newData, oldData);

  return {
    actorName,
    actorEmail: actor?.email ?? null,
    entityLabel,
    entityName,
    message: buildMessage(log, actorName, entityLabel, entityName),
  };
}
