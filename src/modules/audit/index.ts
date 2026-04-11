import type {
  AuditLogEntry,
  ControlSeverity,
  EntityId,
  PrivacyAuditEvent,
  PrivacyLifecycleHookTarget
} from "../../domain/model.js";
import {
  createPrivacyAuditEvent,
  resolveBr04AccessScopes,
  resolveBr04RetentionPolicyRefs,
  type Br04PolicySource,
  type CreatePrivacyAuditEventInput
} from "../br04/index.js";

export const auditEventDomains = [
  "EVIDENCE",
  "WORKFLOW",
  "OUTPUT",
  "HANDOFF",
  "PRIVACY"
] as const;

export type AuditEventDomain = (typeof auditEventDomains)[number];

export const auditEventOutcomes = [
  "RECORDED",
  "REVIEW_REQUIRED",
  "BLOCKED"
] as const;

export type AuditEventOutcome = (typeof auditEventOutcomes)[number];

export const privacyAuditAccessScopeModes = [
  "TARGET_LANE",
  "AUDIT_ONLY"
] as const;

export type PrivacyAuditAccessScopeMode = (typeof privacyAuditAccessScopeModes)[number];

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

export interface PrivacyAuditSourceLinkInput {
  source?: Br04PolicySource | undefined;
  appliesTo: PrivacyLifecycleHookTarget;
  policyKeys?: readonly string[] | undefined;
  accessScopeMode?: PrivacyAuditAccessScopeMode | undefined;
  accessScopeId?: EntityId | undefined;
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

export function createPrivacyAuditRecord(
  input: CreatePrivacyAuditEventInput,
  sourceLinkInput: PrivacyAuditSourceLinkInput
): PrivacyAuditEvent {
  const policyKeys = resolveBr04RetentionPolicyRefs({
    source: sourceLinkInput.source,
    appliesTo: sourceLinkInput.appliesTo,
    policyKeys: sourceLinkInput.policyKeys
  }).map((policyRef) => policyRef.policyKey);
  const accessScopeId = resolvePrivacyAuditAccessScopeId(sourceLinkInput);

  return createPrivacyAuditEvent({
    ...input,
    accessScopeId,
    policyKeys
  });
}

export function createInMemoryAuditRecorder(
  initial: AuditEventRecord[] = []
): AuditEventRecorder {
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

function resolvePrivacyAuditAccessScopeId(
  input: PrivacyAuditSourceLinkInput
): EntityId {
  const accessScopeMode = input.accessScopeMode ?? "TARGET_LANE";
  const accessScopeSubjectType = resolvePrivacyAuditAccessScopeSubjectType(
    input.appliesTo,
    accessScopeMode
  );
  const accessScopes = input.accessScopeId
    ? resolveBr04AccessScopes({
        source: input.source,
        ids: [input.accessScopeId],
        subjectType: accessScopeSubjectType
      })
    : resolveBr04AccessScopes({
        source: input.source,
        subjectType: accessScopeSubjectType
      });
  const accessScope = accessScopes[0];

  if (!accessScope) {
    throw new Error(
      `BR04 privacy audit records for ${input.appliesTo} require at least one explicit ${describePrivacyAuditAccessScopeMode(accessScopeMode)} access scope ref.`
    );
  }

  return accessScope.id;
}

function resolvePrivacyAuditAccessScopeSubjectType(
  appliesTo: PrivacyLifecycleHookTarget,
  accessScopeMode: PrivacyAuditAccessScopeMode
): PrivacyLifecycleHookTarget | "PRIVACY_AUDIT" {
  return accessScopeMode === "AUDIT_ONLY" ? "PRIVACY_AUDIT" : appliesTo;
}

function describePrivacyAuditAccessScopeMode(
  accessScopeMode: PrivacyAuditAccessScopeMode
): string {
  return accessScopeMode === "AUDIT_ONLY" ? "audit-only" : "target-lane";
}
