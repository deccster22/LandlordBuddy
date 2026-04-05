import type {
  ConsentProof,
  ControlSeverity,
  DateTimeString,
  EntityId,
  EvidenceTimingState,
  RulePosture,
  ServiceEvent,
  ServiceMethod
} from "../../domain/model.js";
import type { NoticeReadinessIssueSeverity } from "../notice-readiness/index.js";

export type Br02ServiceEvent = ServiceEvent;
export type Br02ConsentProof = ConsentProof;
export type Br02EvidenceTimingState = EvidenceTimingState;

export const br02ValidatorAreas = [
  "DATE",
  "SERVICE",
  "CONSENT",
  "EVIDENCE_TIMING",
  "FRESHNESS"
] as const;

export type Br02ValidatorArea = (typeof br02ValidatorAreas)[number];

export interface Br02ValidationIssue {
  code: string;
  severity: NoticeReadinessIssueSeverity;
  area: Br02ValidatorArea;
  posture: RulePosture;
  summary: string;
  guardedInsertionPoint?: string;
}

export interface Br02ServiceAssessment {
  thresholdGateOpen: boolean;
  serviceMethod: ServiceMethod;
  appliedDateRuleCodes: string[];
  preferredDeterministicPath: ServiceMethod | null;
  issues: Br02ValidationIssue[];
  readyForDeterministicDateHandling: boolean;
}

export const br02FreshnessAuthorities = [
  "NON_AUTHORITATIVE",
  "EXTERNAL_CHECK_REQUIRED"
] as const;

export type Br02FreshnessAuthority = (typeof br02FreshnessAuthorities)[number];

export interface Br02FreshnessSnapshot {
  monitorCode: string;
  stateCode: string;
  authority: Br02FreshnessAuthority;
  neverUniversalDeadlineTruth: boolean;
  summary: string;
}

export interface Br02HearingSpecificOverrideInput {
  code?: string;
  label: string;
  relativeTo?: "HEARING_DATE" | "HEARING_NOTICE";
  offsetDays?: number;
  dayCountKind?: "CALENDAR" | "BUSINESS";
  summary?: string;
}

export const br02AuditOutcomes = [
  "RECORDED",
  "REVIEW_REQUIRED",
  "BLOCKED"
] as const;

export type Br02AuditOutcome = (typeof br02AuditOutcomes)[number];

export const br02AuditControlAreas = [
  "SERVICE",
  "CONSENT",
  "EVIDENCE_TIMING",
  "FRESHNESS"
] as const;

export type Br02AuditControlArea = (typeof br02AuditControlAreas)[number];

export interface Br02AuditEvent {
  id: EntityId;
  at: DateTimeString;
  actor: string;
  actorType?: "SYSTEM" | "USER" | "OPERATOR" | "EXTERNAL_CHANNEL";
  event: string;
  matterId: EntityId;
  controlArea: Br02AuditControlArea;
  action: string;
  severity: ControlSeverity;
  outcome: Br02AuditOutcome;
  subjectType: "SERVICE_EVENT" | "CONSENT_PROOF" | "EVIDENCE_TIMING" | "FRESHNESS_MONITOR";
  subjectId: EntityId;
  deterministic: boolean;
  ruleCodes: string[];
  staleStateCode?: string;
  detail?: string;
  metadata?: Record<string, string | number | boolean | null>;
  sourceReferenceIds: EntityId[];
}
