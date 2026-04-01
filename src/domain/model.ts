export const forumPaths = [
  "NSW_CIVIL_RENT_ARREARS",
  "QLD_QCAT_RENT_ARREARS",
  "VIC_VCAT_RENT_ARREARS",
  "OTHER_OR_UNRESOLVED"
] as const;

export type ForumPath = (typeof forumPaths)[number];

export const outputModes = [
  "SELF_SERVICE_PACK",
  "PROFESSIONAL_REVIEW_PACK",
  "READ_ONLY_SUMMARY"
] as const;

export type OutputMode = (typeof outputModes)[number];

export const officialHandoffStates = [
  "NOT_STARTED",
  "READY_FOR_OPERATOR",
  "HANDED_OFF",
  "ACKNOWLEDGED_BY_OPERATOR",
  "COMPLETED_OUTSIDE_SYSTEM"
] as const;

export type OfficialHandoffState = (typeof officialHandoffStates)[number];

export const controlSeverities = [
  "INFO",
  "WARNING",
  "SLOWDOWN",
  "REFERRAL"
] as const;

export type ControlSeverity = (typeof controlSeverities)[number];

export const sourceSensitivities = [
  "LOW",
  "PERSONAL",
  "SPECIAL_CATEGORY",
  "LEGAL_PRIVILEGE_CANDIDATE"
] as const;

export type SourceSensitivity = (typeof sourceSensitivities)[number];

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
  event: string;
  severity: ControlSeverity;
  detail?: string;
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
  forumPath: ForumPath;
  outputMode: OutputMode;
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
  forumPath: ForumPath;
  outputMode: OutputMode;
  officialHandoffState: OfficialHandoffState;
  severity: ControlSeverity;
  rationale: string;
  guardedReason?: string;
  decidedAt: DateTimeString;
}

export interface OutputPackage {
  id: EntityId;
  matterId: EntityId;
  outputMode: OutputMode;
  noticeDraftId?: EntityId;
  evidenceItemIds: EntityId[];
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
  forumPath: ForumPath;
  outputMode: OutputMode;
  officialHandoffState: OfficialHandoffState;
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
  portalBehavior: "Authenticated portal behavior remains official handoff only."
});

export function validateMatterSeparation(matter: Matter): string[] {
  const issues: string[] = [];

  if (!forumPaths.includes(matter.forumPath)) {
    issues.push("Matter forumPath must be one of the supported forum paths.");
  }

  if (!outputModes.includes(matter.outputMode)) {
    issues.push("Matter outputMode must be one of the supported output modes.");
  }

  if (!officialHandoffStates.includes(matter.officialHandoffState)) {
    issues.push("Matter officialHandoffState must be one of the supported handoff states.");
  }

  return issues;
}
