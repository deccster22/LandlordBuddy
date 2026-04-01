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
  subjectType?: "MATTER" | "EVIDENCE_ITEM" | "OUTPUT_PACKAGE" | "HANDOFF_GUIDANCE" | "WORKFLOW";
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

export interface PriorNoticeRecord {
  id: EntityId;
  matterId: EntityId;
  noticeType: "BREACH" | "TERMINATION" | "OTHER";
  issuedAt?: DateTimeString;
  serviceEventIds: EntityId[];
  wordingStatus: "CAPTURED" | "PARTIAL" | "UNKNOWN";
  sourceReferenceIds: EntityId[];
}

export interface NoticeDraft {
  id: EntityId;
  matterId: EntityId;
  version: number;
  preparedAt?: DateTimeString;
  draftStatus: "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_REVIEW";
  forumPath: ForumPathState;
  outputMode: OutputModeState;
  unresolvedIssueIds: EntityId[];
  sourceReferenceIds: EntityId[];
}

export interface ServiceEvent {
  id: EntityId;
  matterId: EntityId;
  serviceMethod:
    | "EMAIL"
    | "POST"
    | "HAND_DELIVERY"
    | "COURIER"
    | "PORTAL_OR_OFFICIAL_SYSTEM"
    | "UNKNOWN";
  occurredAt?: DateTimeString;
  proofStatus: "PROVIDED" | "PARTIAL" | "MISSING" | "GUARDED";
  notes?: string;
  sourceReferenceIds: EntityId[];
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
}

export interface ReferralFlag {
  id: EntityId;
  matterId: EntityId;
  severity: ControlSeverity;
  reasonCode:
    | "MIXED_CLAIM_GUARDED"
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
  evidenceItems: EvidenceItem[];
  paymentPlans: PaymentPlanRecord[];
  routingDecisions: RoutingDecision[];
  outputPackages: OutputPackage[];
  referralFlags: ReferralFlag[];
  auditLog: AuditLogEntry[];
  sourceReferences: SourceReference[];
}

export const GUARDED_INSERTION_POINTS = Object.freeze({
  mixedClaimRouting: "Represent as referral or slowdown until doctrine is settled.",
  evidenceTiming: "Keep timing-specific rules guarded and operator-reviewable.",
  handServiceProof: "Do not encode final proof sufficiency thresholds.",
  privacyRetention: "Keep retention and deletion handling behind future privacy engine work.",
  portalBehavior: "Authenticated portal behavior remains official handoff only.",
  touchpointFreshness: "Live official surface behavior and cadence remain freshness-sensitive."
});

export function validateMatterSeparation(matter: Matter): string[] {
  return validatePreparationSeparation({
    forumPath: matter.forumPath,
    outputMode: matter.outputMode,
    officialHandoff: matter.officialHandoff
  });
}
