import type { Br02AuditEvent } from "./models.js";

export interface CreateBr02AuditEventInput extends Omit<Br02AuditEvent, "event" | "ruleCodes" | "sourceReferenceIds"> {
  ruleCodes?: string[];
  sourceReferenceIds?: string[];
}

export function createBr02AuditEvent(input: CreateBr02AuditEventInput): Br02AuditEvent {
  return {
    id: input.id,
    at: input.at,
    actor: input.actor,
    ...(input.actorType ? { actorType: input.actorType } : {}),
    event: `${input.controlArea}:${input.action}`,
    matterId: input.matterId,
    controlArea: input.controlArea,
    action: input.action,
    severity: input.severity,
    outcome: input.outcome,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    deterministic: input.deterministic,
    ruleCodes: input.ruleCodes ?? [],
    ...(input.staleStateCode ? { staleStateCode: input.staleStateCode } : {}),
    ...(input.detail ? { detail: input.detail } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
    sourceReferenceIds: input.sourceReferenceIds ?? []
  };
}
