import type {
  CarryForwardControl,
  ControlSeverity
} from "./posture.js";
import { validatePreparationSeparation } from "./preparation.js";
import type {
  ForumPathState,
  OfficialHandoffStateRecord,
  OutputModeState
} from "./preparation.js";

export * from "./posture.js";
export * from "./preparation.js";

export const sourceSensitivities = [
  "LOW",
  "PERSONAL",
  "SPECIAL_CATEGORY",
  "LEGAL_PRIVILEGE_CANDIDATE"
] as const;

export type SourceSensitivity = (typeof sourceSensitivities)[number];

export const evidencePrivacyClasses = [
  "TENANCY_OPERATIONAL",
  "PERSONAL",
  "SENSITIVE_REVIEW",
  "PRIVILEGE_REVIEW"
] as const;

export type EvidencePrivacyClass = (typeof evidencePrivacyClasses)[number];

export const evidenceRetentionClasses = [
  "UNCLASSIFIED_PENDING_POLICY",
  "ARREARS_MVP_WORKING",
  "REVIEW_REQUIRED"
] as const;

export type EvidenceRetentionClass = (typeof evidenceRetentionClasses)[number];

export const evidenceHoldStatuses = [
  "NONE",
  "PRESERVE",
  "REVIEW_REQUIRED"
] as const;

export type EvidenceHoldStatus = (typeof evidenceHoldStatuses)[number];

export const privacyLifecycleStates = [
  "NORMAL_LIFECYCLE",
  "REVIEW_NEEDED",
  "HOLD_AFFECTED",
  "DELETION_REQUESTED"
] as const;

export type PrivacyLifecycleState = (typeof privacyLifecycleStates)[number];

export const privacyLifecycleHookTargets = [
  "MATTER",
  "EVIDENCE_ITEM",
  "NOTICE_DRAFT",
  "OUTPUT_PACKAGE"
] as const;

export type PrivacyLifecycleHookTarget =
  (typeof privacyLifecycleHookTargets)[number];

export const privacyAuditSubjectTypes = [
  "MATTER",
  "EVIDENCE_ITEM",
  "NOTICE_DRAFT",
  "OUTPUT_PACKAGE",
  "DATA_CLASS",
  "RETENTION_POLICY",
  "HOLD_FLAG",
  "LIFECYCLE_ACTION",
  "DELETION_REQUEST",
  "DEIDENTIFICATION_ACTION",
  "ACCESS_SCOPE"
] as const;

export type PrivacyAuditSubjectType =
  (typeof privacyAuditSubjectTypes)[number];

export const privacyRoles = [
  "MATTER_OPERATOR",
  "PRIVACY_REVIEWER",
  "SYSTEM_PROCESS",
  "AUDIT_READER"
] as const;

export type PrivacyRole = (typeof privacyRoles)[number];

export const privacyOperations = [
  "CLASSIFY_DATA",
  "ATTACH_RETENTION_POLICY",
  "APPLY_HOLD",
  "REQUEST_HOLD_RELEASE",
  "REQUEST_DELETION",
  "REQUEST_DEIDENTIFICATION",
  "REVIEW_LIFECYCLE",
  "VIEW_AUDIT_LOG"
] as const;

export type PrivacyOperation = (typeof privacyOperations)[number];

export const privacyAuditControlAreas = [
  "CLASSIFICATION",
  "RETENTION",
  "HOLD",
  "LIFECYCLE",
  "ACCESS"
] as const;

export type PrivacyAuditControlArea =
  (typeof privacyAuditControlAreas)[number];

export const evidenceUploadStatuses = [
  "NOT_STARTED",
  "LOCAL_VALIDATION_READY",
  "LOCAL_VALIDATION_BLOCKED",
  "PENDING_EXTERNAL_UPLOAD",
  "EXTERNAL_STATUS_UNCONFIRMED"
] as const;

export type EvidenceUploadStatus = (typeof evidenceUploadStatuses)[number];

export const attachmentSeparationStatuses = [
  "SEPARATE",
  "COMBINED",
  "REVIEW_REQUIRED",
  "UNKNOWN"
] as const;

export type AttachmentSeparationStatus = (typeof attachmentSeparationStatuses)[number];

export const proofOfSendingStatuses = [
  "NOT_LINKED",
  "LINKED",
  "REVIEW_REQUIRED",
  "NOT_APPLICABLE"
] as const;

export type ProofOfSendingStatus = (typeof proofOfSendingStatuses)[number];

export const evidenceValidationFlagKinds = [
  "FILE_TYPE",
  "FILE_SIZE",
  "FILENAME_CLARITY",
  "ATTACHMENT_SEPARATION",
  "PROOF_LINKAGE",
  "PRIVACY_REVIEW",
  "RETENTION_REVIEW"
] as const;

export type EvidenceValidationFlagKind = (typeof evidenceValidationFlagKinds)[number];

export const matterStatuses = [
  "INTAKE",
  "TRIAGE",
  "ARREARS_REVIEW",
  "NOTICE_PREPARATION",
  "NOTICE_READY",
  "STOPPED",
  "REFERRED"
] as const;

export type MatterStatus = (typeof matterStatuses)[number];

export type WorkflowState =
  | "INTAKE_OPEN"
  | "INTAKE_INCOMPLETE"
  | "TRIAGE_READY"
  | "TRIAGE_SLOWDOWN"
  | "ARREARS_FACTS_READY"
  | "ARREARS_FACTS_GUARDED"
  | "NOTICE_DRAFTING_READY"
  | "NOTICE_DRAFTING_GUARDED"
  | "NOTICE_READY_FOR_REVIEW"
  | "REFER_OUT"
  | "STOPPED_PENDING_EXTERNAL_INPUT";

export type EntityId = string;
export type ISODate = string;
export type DateTimeString = string;
export type CurrencyCode = "AUD";

export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export interface SourceReference {
  id: EntityId;
  label: string;
  locator: string;
  sensitivity: SourceSensitivity;
  capturedAt: DateTimeString;
  notes?: string;
}

export interface AuditLogEntry {
  id: EntityId;
  at: DateTimeString;
  actor: string;
  actorType?: "SYSTEM" | "USER" | "OPERATOR" | "EXTERNAL_CHANNEL";
  event: string;
  severity: ControlSeverity;
  matterId?: EntityId;
  subjectType?:
    | "MATTER"
    | "EVIDENCE_ITEM"
    | "NOTICE_DRAFT"
    | "OUTPUT_PACKAGE"
    | "HANDOFF_GUIDANCE"
    | "WORKFLOW"
    | "SERVICE_EVENT"
    | "CONSENT_PROOF"
    | "EVIDENCE_TIMING"
    | "FRESHNESS_MONITOR"
    | "DATA_CLASS"
    | "RETENTION_POLICY"
    | "HOLD_FLAG"
    | "LIFECYCLE_ACTION"
    | "DELETION_REQUEST"
    | "DEIDENTIFICATION_ACTION"
    | "ACCESS_SCOPE";
  subjectId?: EntityId;
  detail?: string;
  metadata?: Record<string, string | number | boolean | null>;
  sourceReferenceIds: EntityId[];
}

export interface Property {
  id: EntityId;
  addressLine1: string;
  suburb: string;
  stateOrTerritory: string;
  postcode: string;
  countryCode: "AU";
  sourceReferenceIds: EntityId[];
}

export interface Party {
  id: EntityId;
  kind: "LANDLORD" | "AGENT" | "TENANT" | "OTHER";
  displayName: string;
  contactEmail?: string;
  contactPhone?: string;
  sourceReferenceIds: EntityId[];
}

export interface Tenancy {
  id: EntityId;
  propertyId: EntityId;
  landlordPartyIds: EntityId[];
  tenantPartyIds: EntityId[];
  managingAgentPartyId?: EntityId;
  agreementStartDate: ISODate;
  agreementEndDate?: ISODate;
  rentCycle: "WEEKLY" | "FORTNIGHTLY" | "MONTHLY" | "OTHER";
  sourceReferenceIds: EntityId[];
}

export interface RentCharge {
  id: EntityId;
  tenancyId: EntityId;
  dueDate: ISODate;
  amount: Money;
  periodStartDate: ISODate;
  periodEndDate: ISODate;
  sourceReferenceIds: EntityId[];
}

export interface PaymentRecord {
  id: EntityId;
  tenancyId: EntityId;
  receivedAt: DateTimeString;
  amount: Money;
  method?: "BANK_TRANSFER" | "CASH" | "CARD" | "OTHER";
  reference?: string;
  sourceReferenceIds: EntityId[];
}

export interface ArrearsStatus {
  asAt: DateTimeString;
  outstandingAmount: Money;
  overdueChargeIds: EntityId[];
  unappliedPaymentIds: EntityId[];
  daysInArrears?: number;
  calculationConfidence: "DETERMINISTIC" | "PROVISIONAL";
  warnings: string[];
}

export interface DataClass {
  id: EntityId;
  code: string;
  label: string;
  appliesTo: PrivacyLifecycleHookTarget;
  sensitivity: SourceSensitivity;
  summary: string;
  notes?: string[];
}

// Policy refs attach records to a configurable slot without claiming a settled duration.
export interface RetentionPolicyRef {
  id: EntityId;
  policyKey: string;
  dataClassId: EntityId;
  appliesTo: PrivacyLifecycleHookTarget;
  policyStatus: "CONFIG_PENDING" | "ATTACHED" | "REVIEW_REQUIRED";
  configurable: true;
  guardedInsertionPoint?: string;
  notes?: string[];
}

export interface PreservationScope {
  id: EntityId;
  matterId: EntityId;
  subjectType: PrivacyLifecycleHookTarget;
  subjectId: EntityId;
  scopeLabel: string;
  notes?: string[];
}

export interface HoldReason {
  code: string;
  label: string;
  placeholder: true;
  summary: string;
  guardedInsertionPoint?: string;
}

// Hold scope is explicit now; trigger detail and release authority stay guarded for later BR04 work.
export interface HoldFlag {
  id: EntityId;
  matterId: EntityId;
  scope: PreservationScope;
  reason: HoldReason;
  status: "ACTIVE" | "REVIEW_REQUIRED" | "RELEASE_REVIEW_REQUIRED";
  appliedAt?: DateTimeString;
  releaseRequestedAt?: DateTimeString;
  releaseAuthorityKey?: string;
  notes?: string[];
}

export interface LifecycleAction {
  id: EntityId;
  matterId: EntityId;
  subjectType: PrivacyLifecycleHookTarget;
  subjectId: EntityId;
  action: Exclude<PrivacyOperation, "VIEW_AUDIT_LOG">;
  lifecycleState: PrivacyLifecycleState;
  requestedAt: DateTimeString;
  requestedByRole: PrivacyRole;
  reviewRequired: boolean;
  retentionPolicyRefId?: EntityId;
  holdFlagId?: EntityId;
  notes?: string[];
  sourceReferenceIds: EntityId[];
}

export interface DeletionRequest {
  id: EntityId;
  matterId: EntityId;
  subjectType: PrivacyLifecycleHookTarget;
  subjectId: EntityId;
  lifecycleState: "DELETION_REQUESTED";
  requestedAt: DateTimeString;
  requestedByRole: PrivacyRole;
  blockedByHoldFlagIds: EntityId[];
  reviewRequired: true;
  notes?: string[];
  sourceReferenceIds: EntityId[];
}

export interface DeidentificationAction {
  id: EntityId;
  matterId: EntityId;
  subjectType: PrivacyLifecycleHookTarget;
  subjectId: EntityId;
  lifecycleState: PrivacyLifecycleState;
  requestedAt: DateTimeString;
  requestedByRole: PrivacyRole;
  methodStatus: "PLACEHOLDER_PENDING_POLICY";
  blockedByHoldFlagIds: EntityId[];
  reviewRequired: true;
  notes?: string[];
  sourceReferenceIds: EntityId[];
}

export interface PrivacyAuditEvent {
  id: EntityId;
  at: DateTimeString;
  actor: string;
  actorType?: "SYSTEM" | "USER" | "OPERATOR" | "EXTERNAL_CHANNEL";
  event: string;
  matterId: EntityId;
  controlArea: PrivacyAuditControlArea;
  action: string;
  severity: ControlSeverity;
  outcome: "RECORDED" | "REVIEW_REQUIRED" | "BLOCKED";
  subjectType: PrivacyAuditSubjectType;
  subjectId: EntityId;
  lifecycleState: PrivacyLifecycleState;
  deterministic: boolean;
  accessRole?: PrivacyRole;
  accessScopeId?: EntityId;
  policyKeys: string[];
  holdFlagIds: EntityId[];
  detail?: string;
  metadata?: Record<string, string | number | boolean | null>;
  sourceReferenceIds: EntityId[];
}

export interface AccessScope {
  id: EntityId;
  subjectType: PrivacyLifecycleHookTarget | "PRIVACY_AUDIT";
  subjectId?: EntityId;
  scopeLabel: string;
  notes?: string[];
}

export interface PrivacyRoleBoundary {
  id: EntityId;
  role: PrivacyRole;
  accessScopeIds: EntityId[];
  allowedOperations: PrivacyOperation[];
  reviewRequiredOperations: PrivacyOperation[];
  blockedOperations: PrivacyOperation[];
  notes: string[];
}

export interface PrivacyLifecycleHooks {
  lifecycleState: PrivacyLifecycleState;
  dataClassIds: EntityId[];
  retentionPolicyRefs: RetentionPolicyRef[];
  holdFlagIds: EntityId[];
  lifecycleActionIds: EntityId[];
  deletionRequestIds: EntityId[];
  deidentificationActionIds: EntityId[];
  accessScopeIds: EntityId[];
  guardedInsertionPoints: string[];
}

export interface PriorNoticeRecord {
  id: EntityId;
  matterId: EntityId;
  noticeType: "BREACH" | "TERMINATION" | "OTHER";
  issuedAt?: DateTimeString;
  serviceEventIds: EntityId[];
  wordingStatus: "CAPTURED" | "PARTIAL" | "UNKNOWN";
  sourceReferenceIds: EntityId[];
}

export const serviceMethodCodes = [
  "EMAIL",
  "POST",
  "REGISTERED_POST",
  "ORDINARY_POST",
  "HAND_DELIVERY",
  "COURIER",
  "PORTAL_OR_OFFICIAL_SYSTEM",
  "UNKNOWN"
] as const;

export type ServiceMethod = (typeof serviceMethodCodes)[number];

export const rulePostures = [
  "DETERMINISTIC",
  "GUARDED",
  "EXTERNAL"
] as const;

export type RulePosture = (typeof rulePostures)[number];

export const serviceEventScopes = [
  "NOTICE",
  "NOTICE_SERVICE_ATTEMPT",
  "HEARING_NOTICE",
  "EVIDENCE_PACK",
  "OTHER"
] as const;

export type ServiceEventScope = (typeof serviceEventScopes)[number];

export const serviceEventStatuses = [
  "ATTEMPTED",
  "SENT",
  "DELIVERED",
  "UNKNOWN"
] as const;

export type ServiceEventStatus = (typeof serviceEventStatuses)[number];

export const consentProofScopes = [
  "EMAIL_SERVICE",
  "NOTICE_SCOPE_VARIATION",
  "DIGITAL_DELIVERY",
  "OTHER"
] as const;

export type ConsentProofScope = (typeof consentProofScopes)[number];

export const consentProofStatuses = [
  "PROVIDED",
  "REVOKED",
  "UNCONFIRMED",
  "GUARDED"
] as const;

export type ConsentProofStatus = (typeof consentProofStatuses)[number];

export const evidenceTimingInstructionKinds = [
  "SERVICE_BASELINE",
  "PREP_STEP",
  "HEARING_OVERRIDE"
] as const;

export type EvidenceTimingInstructionKind =
  (typeof evidenceTimingInstructionKinds)[number];

export const evidenceTimingStateStatuses = [
  "ACTIVE",
  "OVERRIDDEN",
  "STALE",
  "REVIEW_REQUIRED"
] as const;

export type EvidenceTimingStateStatus =
  (typeof evidenceTimingStateStatuses)[number];

export interface NoticeDraft {
  id: EntityId;
  matterId: EntityId;
  version: number;
  preparedAt?: DateTimeString;
  draftStatus: "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW";
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  unresolvedIssueIds: EntityId[];
  privacyHooks: PrivacyLifecycleHooks;
  sourceReferenceIds: EntityId[];
}

export interface ServiceEvent {
  id: EntityId;
  matterId: EntityId;
  renterPartyId: EntityId;
  serviceScope: ServiceEventScope;
  serviceMethod: ServiceMethod;
  serviceAttempt: number;
  eventStatus: ServiceEventStatus;
  occurredAt?: DateTimeString;
  proofStatus: "PROVIDED" | "PARTIAL" | "MISSING" | "GUARDED";
  consentProofId?: EntityId;
  evidenceTimingStateId?: EntityId;
  proofEvidenceItemIds: EntityId[];
  rulePosture: RulePosture;
  guardedInsertionPoints: string[];
  notes?: string;
  sourceReferenceIds: EntityId[];
}

export interface ConsentProof {
  id: EntityId;
  renterPartyId: EntityId;
  scope: ConsentProofScope;
  scopeVariationKey: string;
  channel: "EMAIL" | "OTHER";
  status: ConsentProofStatus;
  capturedAt?: DateTimeString;
  revokedAt?: DateTimeString;
  evidenceItemIds: EntityId[];
  sourceReferenceIds: EntityId[];
  notes?: string;
}

export interface EvidenceTimingInstruction {
  code: string;
  label: string;
  kind: EvidenceTimingInstructionKind;
  posture: RulePosture;
  relativeTo: "SERVICE_EVENT" | "HEARING_DATE" | "HEARING_NOTICE";
  offsetDays?: number;
  dayCountKind?: "CALENDAR" | "BUSINESS";
  requiredPrepStep: boolean;
  universalDeadline: boolean;
  summary: string;
  guardedInsertionPoint?: string;
}

export interface EvidenceTimingPrecedence {
  orderedInstructionCodes: string[];
  hearingSpecificOverrideCode?: string;
  effectiveInstructionCode: string;
  reason: string;
}

export interface EvidenceTimingState {
  id: EntityId;
  matterId: EntityId;
  renterPartyId: EntityId;
  serviceEventId?: EntityId;
  status: EvidenceTimingStateStatus;
  instructions: EvidenceTimingInstruction[];
  precedence: EvidenceTimingPrecedence;
  staleStateCode?: string;
  notes: string[];
}

export interface EvidenceFileMetadata {
  originalFileName?: string;
  normalizedFileName?: string;
  mediaType?: string;
  extension?: string;
  sizeBytes?: number;
}

export interface ProofOfSendingLink {
  status: ProofOfSendingStatus;
  relatedEvidenceItemIds: EntityId[];
  notes?: string;
}

export interface EvidenceValidationFlag {
  code: string;
  kind: EvidenceValidationFlagKind;
  severity: ControlSeverity;
  summary: string;
  deterministic: boolean;
}

export interface EvidenceItem {
  id: EntityId;
  matterId: EntityId;
  kind:
    | "LEDGER"
    | "AGREEMENT"
    | "NOTICE"
    | "SERVICE_PROOF"
    | "COMMUNICATION"
    | "PAYMENT_PLAN"
    | "OTHER";
  title: string;
  storageLocator?: string;
  relevance: "CORE" | "SUPPORTING" | "GUARDED";
  file: EvidenceFileMetadata;
  attachmentSeparationStatus: AttachmentSeparationStatus;
  proofOfSendingLink: ProofOfSendingLink;
  privacyClass: EvidencePrivacyClass;
  retentionClass: EvidenceRetentionClass;
  holdStatus: EvidenceHoldStatus;
  uploadStatus: EvidenceUploadStatus;
  sourceSensitivity: SourceSensitivity;
  privacyHooks: PrivacyLifecycleHooks;
  validationFlags: EvidenceValidationFlag[];
  auditEventIds: EntityId[];
  sourceReferenceIds: EntityId[];
}

export interface PaymentPlanRecord {
  id: EntityId;
  matterId: EntityId;
  status: "PROPOSED" | "ACTIVE" | "BROKEN" | "COMPLETED" | "UNKNOWN";
  agreedAt?: DateTimeString;
  notes?: string;
  sourceReferenceIds: EntityId[];
}

export interface RoutingDecision {
  id: EntityId;
  matterId: EntityId;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  severity: ControlSeverity;
  rationale: string;
  guardedReason?: string;
  decidedAt: DateTimeString;
}

export interface OutputPackage {
  id: EntityId;
  matterId: EntityId;
  outputMode: OutputModeState;
  officialHandoff?: OfficialHandoffStateRecord;
  noticeDraftId?: EntityId;
  evidenceItemIds: EntityId[];
  touchpointIds: EntityId[];
  carryForwardControls: CarryForwardControl[];
  generatedAt?: DateTimeString;
  completeness: "PARTIAL" | "READY_FOR_REVIEW";
  privacyHooks: PrivacyLifecycleHooks;
}

export interface ReferralFlag {
  id: EntityId;
  matterId: EntityId;
  severity: ControlSeverity;
  reasonCode:
    | "MIXED_CLAIM_GUARDED"
    | "BR01_REFERRAL_REQUIRED"
    | "BR01_ROUTE_OUT_REQUIRED"
    | "EVIDENCE_TIMING_GUARDED"
    | "SERVICE_STANDARD_GUARDED"
    | "PRIVACY_HANDLING_PENDING"
    | "FACT_GAP"
    | "OTHER";
  summary: string;
  openedAt: DateTimeString;
  resolvedAt?: DateTimeString;
}

export interface Matter {
  id: EntityId;
  tenancyId: EntityId;
  propertyId: EntityId;
  status: MatterStatus;
  workflowState: WorkflowState;
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  arrearsStatus: ArrearsStatus;
  priorNoticeIds: EntityId[];
  evidenceItemIds: EntityId[];
  paymentPlanIds: EntityId[];
  referralFlagIds: EntityId[];
  routingDecisionIds: EntityId[];
  auditLogIds: EntityId[];
  privacyHooks: PrivacyLifecycleHooks;
  sourceReferenceIds: EntityId[];
}

export interface ArrearsMatterAggregate {
  property: Property;
  parties: Party[];
  tenancy: Tenancy;
  matter: Matter;
  rentCharges: RentCharge[];
  paymentRecords: PaymentRecord[];
  priorNotices: PriorNoticeRecord[];
  noticeDrafts: NoticeDraft[];
  serviceEvents: ServiceEvent[];
  consentProofs: ConsentProof[];
  evidenceItems: EvidenceItem[];
  evidenceTimingStates: EvidenceTimingState[];
  paymentPlans: PaymentPlanRecord[];
  routingDecisions: RoutingDecision[];
  outputPackages: OutputPackage[];
  referralFlags: ReferralFlag[];
  auditLog: AuditLogEntry[];
  dataClasses: DataClass[];
  retentionPolicyRefs: RetentionPolicyRef[];
  holdFlags: HoldFlag[];
  lifecycleActions: LifecycleAction[];
  deletionRequests: DeletionRequest[];
  deidentificationActions: DeidentificationAction[];
  privacyAuditEvents: PrivacyAuditEvent[];
  accessScopes: AccessScope[];
  privacyRoleBoundaries: PrivacyRoleBoundary[];
  sourceReferences: SourceReference[];
}

export const GUARDED_INSERTION_POINTS = Object.freeze({
  mixedClaimRouting: "Represent as referral or slowdown until doctrine is settled.",
  evidenceTiming: "Keep timing-specific rules guarded and operator-reviewable.",
  handServiceProof: "Do not encode final proof sufficiency thresholds.",
  proofLinkageReview: "Keep generic proof-linkage review visible without implying evidentiary sufficiency.",
  privacyRetention: "Keep retention and deletion handling behind future privacy engine work.",
  privacyHoldRelease: "Keep hold trigger detail, release authority, and review cadence behind later BR04 extraction.",
  privacyRoleBoundary: "Keep privacy-role operation limits explicit until role policy is extracted.",
  portalBehavior: "Authenticated portal behavior remains official handoff only.",
  touchpointFreshness: "Live official surface behavior and cadence remain freshness-sensitive."
});

export function createPrivacyLifecycleHooks(
  overrides: Partial<PrivacyLifecycleHooks> = {}
): PrivacyLifecycleHooks {
  return {
    lifecycleState: overrides.lifecycleState ?? "NORMAL_LIFECYCLE",
    dataClassIds: overrides.dataClassIds ?? [],
    retentionPolicyRefs: overrides.retentionPolicyRefs ?? [],
    holdFlagIds: overrides.holdFlagIds ?? [],
    lifecycleActionIds: overrides.lifecycleActionIds ?? [],
    deletionRequestIds: overrides.deletionRequestIds ?? [],
    deidentificationActionIds: overrides.deidentificationActionIds ?? [],
    accessScopeIds: overrides.accessScopeIds ?? [],
    guardedInsertionPoints: overrides.guardedInsertionPoints ?? [
      GUARDED_INSERTION_POINTS.privacyRetention,
      GUARDED_INSERTION_POINTS.privacyHoldRelease,
      GUARDED_INSERTION_POINTS.privacyRoleBoundary
    ]
  };
}

export function validateMatterSeparation(matter: Matter): string[] {
  return validatePreparationSeparation({
    forumPath: matter.forumPath,
    outputMode: matter.outputMode,
    officialHandoff: matter.officialHandoff
  });
}
