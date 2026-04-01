import type { AuditLogEntry, ControlSeverity } from "../../domain/model.js";

export const auditEventDomains = [
  "EVIDENCE",
  "WORKFLOW",
  "OUTPUT",
  "HANDOFF"
] as const;

export type AuditEventDomain = (typeof auditEventDomains)[number];

export const auditEventOutcomes = [
  "RECORDED",
  "REVIEW_REQUIRED",
  "BLOCKED"
] as const;

export type AuditEventOutcome = (typeof auditEventOutcomes)[number];

export interface AuditEventInput {
  id: string;
  at: string;
  actor: string;
  actorType?: AuditLogEntry["actorType"];
  matterId: string;
  domain: AuditEventDomain;
  action: string;
  severity: ControlSeverity;
  outcome: AuditEventOutcome;
  subjectType: NonNullable<AuditLogEntry["subjectType"]>;
  subjectId: string;
  detail?: string;
  metadata?: Record<string, string | number | boolean | null>;
  sourceReferenceIds?: string[];
}

export interface AuditEventRecord extends AuditLogEntry {
  matterId: string;
  domain: AuditEventDomain;
  action: string;
  outcome: AuditEventOutcome;
}

export interface AuditEventRecorder {
  record(input: AuditEventInput): AuditEventRecord;
  listByMatter(matterId: string): AuditEventRecord[];
}

export function createAuditEvent(input: AuditEventInput): AuditEventRecord {
  return {
    id: input.id,
    at: input.at,
    actor: input.actor,
    ...(input.actorType ? { actorType: input.actorType } : {}),
    event: `${input.domain}:${input.action}`,
    severity: input.severity,
    matterId: input.matterId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    ...(input.detail ? { detail: input.detail } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
    sourceReferenceIds: input.sourceReferenceIds ?? [],
    domain: input.domain,
    action: input.action,
    outcome: input.outcome
  };
}

export function createInMemoryAuditRecorder(initial: AuditEventRecord[] = []): AuditEventRecorder {
  const events = [...initial];

  return {
    record(input) {
      const event = createAuditEvent(input);
      events.push(event);
      return event;
    },
    listByMatter(matterId) {
      return events.filter((event) => event.matterId === matterId);
    }
  };
}
