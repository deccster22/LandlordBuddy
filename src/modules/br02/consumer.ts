import type {
  ConsentProof,
  DateTimeString,
  EvidenceTimingInstruction,
  EvidenceTimingState,
  ServiceEvent,
  ServiceMethod
} from "../../domain/model.js";
import type { ThresholdState } from "../arrears/index.js";
import type {
  Br02FreshnessSnapshot,
  Br02ValidationIssue
} from "./models.js";
import {
  br02FreshnessMonitorRegistry,
  br02FreshnessStateRegistry,
  br02ServiceMethodRegistry,
  br02ValidatorSeverityRegistry,
  type Br02FreshnessMonitorRegistryEntry,
  type Br02ServiceMethodChannel,
  type Br02ServiceMethodRegistryEntry,
  type Br02ServiceProofPosture,
  type Br02ValidatorCode,
  type Br02FreshnessStateCode
} from "./registries.js";

export const br02ConsumerDispositions = [
  "HARD_STOP",
  "NEEDS_REVIEW",
  "REVIEW_LED_CAUTION",
  "NEXT_STEP_READY"
] as const;

export type Br02ConsumerDisposition = (typeof br02ConsumerDispositions)[number];

export const br02EvidenceDeadlineTargets = Object.freeze({
  sendShareTargetDays: 7,
  uploadTargetBusinessDays: 3
});

export interface Br02ServiceMethodOffset {
  serviceMethod: ServiceMethod;
  offsetDays: number;
  dayCountKind: "CALENDAR" | "BUSINESS";
  summary: string;
}

export const br02ServiceMethodOffsetTable: readonly Br02ServiceMethodOffset[] = Object.freeze([
  {
    serviceMethod: "REGISTERED_POST",
    offsetDays: 2,
    dayCountKind: "BUSINESS",
    summary: "Preferred deterministic postal path with the shortest postal offset in the consumer layer."
  },
  {
    serviceMethod: "POST",
    offsetDays: 4,
    dayCountKind: "BUSINESS",
    summary: "Unspecified postal service stays distinct from registered post and carries a longer offset."
  },
  {
    serviceMethod: "ORDINARY_POST",
    offsetDays: 4,
    dayCountKind: "BUSINESS",
    summary: "Ordinary post remains distinct from registered post and carries a longer offset."
  },
  {
    serviceMethod: "EMAIL",
    offsetDays: 0,
    dayCountKind: "CALENDAR",
    summary: "Email is consent-gated and does not add extra offset time in the consumer layer."
  },
  {
    serviceMethod: "HAND_DELIVERY",
    offsetDays: 0,
    dayCountKind: "CALENDAR",
    summary: "Hand delivery is review-led and does not add extra offset time in the consumer layer."
  },
  {
    serviceMethod: "COURIER",
    offsetDays: 1,
    dayCountKind: "BUSINESS",
    summary: "Courier remains a guarded extension point and carries a small review offset."
  },
  {
    serviceMethod: "PORTAL_OR_OFFICIAL_SYSTEM",
    offsetDays: 0,
    dayCountKind: "CALENDAR",
    summary: "Official-system handoff stays external and is not modelled as extra offset time."
  },
  {
    serviceMethod: "UNKNOWN",
    offsetDays: 0,
    dayCountKind: "CALENDAR",
    summary: "Unknown service method stays unresolved and should not invent offset certainty."
  }
]);

export interface Br02OutcomeBase {
  disposition: Br02ConsumerDisposition;
  readyForNextStep: boolean;
  deterministicSuccess: boolean;
  issues: Br02ValidationIssue[];
  hardStops: Br02ValidationIssue[];
  warnings: Br02ValidationIssue[];
  cautions: Br02ValidationIssue[];
  appliedRuleCodes: string[];
  summary: string;
}

export type Br02ThresholdStateInput = ThresholdState | ThresholdState["kind"];

export interface AssessBr02NoticeEligibilityTimingInput {
  thresholdState: Br02ThresholdStateInput;
}

export interface Br02NoticeEligibilityTimingResult extends Br02OutcomeBase {
  thresholdState: ThresholdState;
  canPrepareNotice: boolean;
  thresholdGateRuleCode: "NO_EARLY_NOTICE_THRESHOLD_GATE";
}

export interface AssessBr02ServiceProofInput {
  serviceEvent: ServiceEvent;
  consentProofs?: readonly ConsentProof[];
  freshnessSnapshots?: readonly Br02FreshnessSnapshot[];
}

export interface Br02ServiceProofResult extends Br02OutcomeBase {
  serviceEventId: ServiceEvent["id"];
  serviceMethod: ServiceMethod;
  serviceMethodChannel: Br02ServiceMethodChannel;
  serviceMethodPosture: Br02ServiceMethodRegistryEntry["posture"];
  proofPosture: Br02ServiceProofPosture;
  consentProofRequired: boolean;
  consentProofLinked: boolean;
  linkedConsentProofIds: string[];
  linkedConsentProofScopeVariationKeys: string[];
  preferredDeterministicPath: ServiceMethod | null;
}

export interface CalculateBr02TerminationDateInput {
  serviceEvent: ServiceEvent;
  serviceProof?: Br02ServiceProofResult;
  consentProofs?: readonly ConsentProof[];
}

export interface Br02TerminationDateResult extends Br02OutcomeBase {
  serviceEventId: ServiceEvent["id"];
  serviceMethod: ServiceMethod;
  serviceMethodOffset: Br02ServiceMethodOffset;
  serviceDateAt?: DateTimeString;
  terminationDateAt?: DateTimeString;
}

export interface Br02EvidenceDeadlineCandidate {
  code: string;
  label: string;
  relativeTo: EvidenceTimingInstruction["relativeTo"];
  dayCountKind: EvidenceTimingInstruction["dayCountKind"];
  targetAt?: DateTimeString;
  summary: string;
}

export interface AssessBr02EvidenceDeadlineInput {
  serviceEvent: ServiceEvent;
  evidenceTimingState: EvidenceTimingState;
  serviceProof?: Br02ServiceProofResult;
  consentProofs?: readonly ConsentProof[];
  hearingDateAt?: DateTimeString;
  hearingNoticeAt?: DateTimeString;
}

export interface Br02EvidenceDeadlineResult extends Br02OutcomeBase {
  serviceEventId: ServiceEvent["id"];
  serviceMethod: ServiceMethod;
  evidenceTimingStateId: EvidenceTimingState["id"];
  evidenceTimingStateStatus: EvidenceTimingState["status"];
  sendShareTargetAt?: DateTimeString;
  uploadTargetAt?: DateTimeString;
  genericEarliestDeadlineAt?: DateTimeString;
  hearingOverrideDeadlineAt?: DateTimeString;
  controllingDeadlineAt?: DateTimeString;
  controllingDeadlineSource:
    | "SEND_SHARE_TARGET"
    | "UPLOAD_TARGET"
    | "HEARING_OVERRIDE"
    | "UNAVAILABLE";
  deadlineCandidates: Br02EvidenceDeadlineCandidate[];
}

export interface AssessBr02ConsumerAssessmentInput {
  thresholdState: Br02ThresholdStateInput;
  serviceEvent: ServiceEvent;
  consentProofs?: readonly ConsentProof[];
  freshnessSnapshots?: readonly Br02FreshnessSnapshot[];
  evidenceTimingState?: EvidenceTimingState;
  hearingDateAt?: DateTimeString;
  hearingNoticeAt?: DateTimeString;
}

export interface Br02ConsumerAssessment extends Br02OutcomeBase {
  thresholdState: ThresholdState;
  noticeEligibility: Br02NoticeEligibilityTimingResult;
  serviceProof: Br02ServiceProofResult;
  terminationDate: Br02TerminationDateResult;
  evidenceDeadline?: Br02EvidenceDeadlineResult;
}

export function lookupBr02ServiceMethodOffset(
  serviceMethod: ServiceMethod
): Br02ServiceMethodOffset | undefined {
  return br02ServiceMethodOffsetTable.find((entry) => entry.serviceMethod === serviceMethod);
}

export function assessBr02NoticeEligibilityTiming(
  input: AssessBr02NoticeEligibilityTimingInput
): Br02NoticeEligibilityTimingResult {
  const thresholdState = normalizeThresholdState(input.thresholdState);

  if (thresholdState.kind === "THRESHOLD_MET") {
    return {
      ...buildOutcomeBase({
        issues: [],
        summary: "Arrears threshold shell is met and the no-early-notice gate can open.",
        appliedRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE"]
      }),
      thresholdState,
      canPrepareNotice: true,
      thresholdGateRuleCode: "NO_EARLY_NOTICE_THRESHOLD_GATE"
    };
  }

  return {
    ...buildOutcomeBase({
      issues: [issueFromValidatorCode("NO_EARLY_NOTICE_GATE")],
      summary: thresholdState.reasons.length > 0
        ? thresholdState.reasons.join(" ")
        : "No early notice gate remains closed until the threshold shell is met.",
      appliedRuleCodes: ["NO_EARLY_NOTICE_THRESHOLD_GATE"]
    }),
    thresholdState,
    canPrepareNotice: false,
    thresholdGateRuleCode: "NO_EARLY_NOTICE_THRESHOLD_GATE"
  };
}

export function assessBr02ServiceProof(
  input: AssessBr02ServiceProofInput
): Br02ServiceProofResult {
  const serviceMethod = requireServiceMethod(input.serviceEvent.serviceMethod);
  const issues: Br02ValidationIssue[] = [];
  const linkedConsentProofs = selectLinkedConsentProofs(
    input.serviceEvent,
    input.consentProofs ?? []
  );

  if (serviceMethod.requiresConsentProof && linkedConsentProofs.length === 0) {
    issues.push(issueFromValidatorCode("EMAIL_CONSENT_PROOF_REQUIRED"));
  }

  if (input.serviceEvent.serviceMethod === "HAND_DELIVERY") {
    issues.push(issueFromValidatorCode("HAND_SERVICE_REVIEW_REQUIRED"));
  }

  if (
    input.serviceEvent.serviceMethod === "POST"
    || input.serviceEvent.serviceMethod === "ORDINARY_POST"
  ) {
    issues.push(issueFromValidatorCode("REGISTERED_POST_PREFERRED_PATH"));
  }

  for (const snapshot of input.freshnessSnapshots ?? []) {
    const monitor = lookupFreshnessMonitor(snapshot.monitorCode);

    if (!monitor) {
      continue;
    }

    if (monitor.area === "REGISTERED_POST_ASSUMPTION" && snapshot.stateCode !== "CURRENT") {
      issues.push(issueFromValidatorCode("STALE_REGISTERED_POST_ASSUMPTION"));
    }

    if (monitor.area === "GENERIC_EVIDENCE_TIMING" && snapshot.stateCode !== "CURRENT") {
      issues.push(issueFromValidatorCode("STALE_GENERIC_TIMING_SURFACE"));
    }

    if (monitor.area === "HEARING_SPECIFIC_OVERRIDE" && snapshot.stateCode !== "CURRENT") {
      issues.push(createLocalIssue({
        code: "HEARING_SPECIFIC_OVERRIDE_STALE",
        severity: snapshot.stateCode === "STALE_SLOWDOWN" ? "slowdown" : "warning",
        area: "FRESHNESS",
        posture: "GUARDED",
        summary: "Hearing-specific timing remains external and freshness-sensitive."
      }));
    }
  }

  return {
    ...buildOutcomeBase({
      issues,
      summary: buildServiceProofSummary({
        serviceMethod,
        linkedConsentProofs,
        issues
      }),
      appliedRuleCodes: uniqueStrings([
        ...serviceMethod.dateRuleCodes,
        ...issues.map((issue) => issue.code)
      ])
    }),
    serviceEventId: input.serviceEvent.id,
    serviceMethod: input.serviceEvent.serviceMethod,
    serviceMethodChannel: serviceMethod.channel,
    serviceMethodPosture: serviceMethod.posture,
    proofPosture: serviceMethod.proofPosture,
    consentProofRequired: serviceMethod.requiresConsentProof,
    consentProofLinked: linkedConsentProofs.length > 0,
    linkedConsentProofIds: linkedConsentProofs.map((proof) => proof.id),
    linkedConsentProofScopeVariationKeys: linkedConsentProofs.map(
      (proof) => proof.scopeVariationKey
    ),
    preferredDeterministicPath: serviceMethod.preferredDeterministicPath
      ? input.serviceEvent.serviceMethod
      : (serviceMethod.channel === "POSTAL" ? "REGISTERED_POST" : null)
  };
}

export function calculateBr02TerminationDate(
  input: CalculateBr02TerminationDateInput
): Br02TerminationDateResult {
  const serviceProof = input.serviceProof
    ?? assessBr02ServiceProof({
      serviceEvent: input.serviceEvent,
      ...(input.consentProofs ? { consentProofs: input.consentProofs } : {})
    });
  const serviceMethod = requireServiceMethod(input.serviceEvent.serviceMethod);
  const offset = lookupBr02ServiceMethodOffset(serviceMethod.code);

  if (!offset) {
    throw new Error(`Unknown BR02 service-method offset for ${serviceMethod.code}.`);
  }

  const issues = [...serviceProof.issues];

  if (!input.serviceEvent.occurredAt) {
    issues.push(createLocalIssue({
      code: "MISSING_SERVICE_DATE",
      severity: "hard-stop",
      area: "DATE",
      posture: "DETERMINISTIC",
      summary: "Service date is required before a termination-date calculation can be made."
    }));
  }

  const serviceDateAt = input.serviceEvent.occurredAt;
  const terminationDateAt = serviceDateAt && issues.every((issue) => issue.severity !== "hard-stop")
    ? applyDateOffset(serviceDateAt, offset)
    : undefined;
  const summary = terminationDateAt
    ? `Termination date uses the ${serviceMethod.label.toLowerCase()} offset in the current BR02 consumer layer.`
    : "Termination date could not be calculated because service date or proof inputs are incomplete.";

  return {
    ...buildOutcomeBase({
      issues,
      summary,
      appliedRuleCodes: uniqueStrings(serviceProof.appliedRuleCodes)
    }),
    serviceEventId: input.serviceEvent.id,
    serviceMethod: input.serviceEvent.serviceMethod,
    serviceMethodOffset: offset,
    ...(serviceDateAt ? { serviceDateAt } : {}),
    ...(terminationDateAt ? { terminationDateAt } : {})
  };
}

export function assessBr02EvidenceDeadline(
  input: AssessBr02EvidenceDeadlineInput
): Br02EvidenceDeadlineResult {
  const serviceProof = input.serviceProof
    ?? assessBr02ServiceProof({
      serviceEvent: input.serviceEvent,
      ...(input.consentProofs ? { consentProofs: input.consentProofs } : {})
    });
  const serviceMethod = requireServiceMethod(input.serviceEvent.serviceMethod);
  const issues = [...serviceProof.issues];
  const evidenceTimingState = input.evidenceTimingState;
  const serviceDateAt = input.serviceEvent.occurredAt;
  const deadlineCandidates: Br02EvidenceDeadlineCandidate[] = [];
  let sendShareTargetAt: DateTimeString | undefined;
  let uploadTargetAt: DateTimeString | undefined;
  let genericEarliestDeadlineAt: DateTimeString | undefined;
  let hearingOverrideDeadlineAt: DateTimeString | undefined;
  let controllingDeadlineAt: DateTimeString | undefined;
  let controllingDeadlineSource:
    | "SEND_SHARE_TARGET"
    | "UPLOAD_TARGET"
    | "HEARING_OVERRIDE"
    | "UNAVAILABLE" = "UNAVAILABLE";

  if (!serviceDateAt) {
    issues.push(createLocalIssue({
      code: "MISSING_SERVICE_DATE",
      severity: "hard-stop",
      area: "DATE",
      posture: "DETERMINISTIC",
      summary: "Service date is required before evidence deadlines can be evaluated."
    }));
  } else {
    sendShareTargetAt = applyCalendarDays(serviceDateAt, br02EvidenceDeadlineTargets.sendShareTargetDays);
    uploadTargetAt = applyBusinessDays(serviceDateAt, br02EvidenceDeadlineTargets.uploadTargetBusinessDays);
    genericEarliestDeadlineAt = earliestDateTime(sendShareTargetAt, uploadTargetAt);

    deadlineCandidates.push(
      {
        code: "SEND_SHARE_TARGET",
        label: "7-day send/share target",
        relativeTo: "SERVICE_EVENT",
        dayCountKind: "CALENDAR",
        ...(sendShareTargetAt ? { targetAt: sendShareTargetAt } : {}),
        summary: "The 7-day send/share target remains a prep step rather than a fake universal deadline."
      },
      {
        code: "UPLOAD_TARGET",
        label: "3-business-day upload target",
        relativeTo: "SERVICE_EVENT",
        dayCountKind: "BUSINESS",
        ...(uploadTargetAt ? { targetAt: uploadTargetAt } : {}),
        summary: "The 3-business-day upload target keeps the local deadline separate from hearing-specific control."
      }
    );

    controllingDeadlineAt = sendShareTargetAt;
    controllingDeadlineSource = "SEND_SHARE_TARGET";

    if (uploadTargetAt && (!controllingDeadlineAt || uploadTargetAt < controllingDeadlineAt)) {
      controllingDeadlineAt = uploadTargetAt;
      controllingDeadlineSource = "UPLOAD_TARGET";
    }
  }

  const overrideInstruction = evidenceTimingState.instructions.find(
    (instruction) => instruction.kind === "HEARING_OVERRIDE"
      || instruction.code === evidenceTimingState.precedence.hearingSpecificOverrideCode
  );

  if (overrideInstruction) {
    const hearingReferenceAt = overrideInstruction.relativeTo === "HEARING_NOTICE"
      ? input.hearingNoticeAt
      : input.hearingDateAt;

    deadlineCandidates.push({
      code: overrideInstruction.code,
      label: overrideInstruction.label,
      relativeTo: overrideInstruction.relativeTo,
      dayCountKind: overrideInstruction.dayCountKind ?? "CALENDAR",
      ...(hearingReferenceAt
        ? { targetAt: applyEvidenceTimingOffset(hearingReferenceAt, overrideInstruction) }
        : {}),
      summary: overrideInstruction.summary
    });

    if (hearingReferenceAt) {
      hearingOverrideDeadlineAt = applyEvidenceTimingOffset(hearingReferenceAt, overrideInstruction);
      controllingDeadlineAt = hearingOverrideDeadlineAt;
      controllingDeadlineSource = "HEARING_OVERRIDE";
      issues.push(createLocalIssue({
        code: "HEARING_SPECIFIC_OVERRIDE_PRIORITY",
        severity: evidenceTimingState.staleStateCode === "STALE_SLOWDOWN" ? "slowdown" : "warning",
        area: "EVIDENCE_TIMING",
        posture: "DETERMINISTIC",
        summary: "Hearing-specific timing controls the deadline, but it remains external and freshness-sensitive."
      }));
    } else {
      issues.push(createLocalIssue({
        code: "HEARING_OVERRIDE_REFERENCE_REQUIRED",
        severity: "warning",
        area: "EVIDENCE_TIMING",
        posture: "GUARDED",
        summary: "Hearing-specific timing is attached, but the hearing reference needed to calculate it is missing."
      }));
    }
  }

  const staleIssue = buildEvidenceTimingFreshnessIssue(evidenceTimingState);

  if (staleIssue) {
    issues.push(staleIssue);
  }

  return {
    ...buildOutcomeBase({
      issues,
      summary: buildEvidenceDeadlineSummary({
        evidenceTimingState,
        serviceProof,
        controllingDeadlineAt,
        controllingDeadlineSource
      }),
      appliedRuleCodes: uniqueStrings([
        ...serviceProof.appliedRuleCodes,
        ...evidenceTimingState.precedence.orderedInstructionCodes
      ])
    }),
    serviceEventId: input.serviceEvent.id,
    serviceMethod: input.serviceEvent.serviceMethod,
    evidenceTimingStateId: evidenceTimingState.id,
    evidenceTimingStateStatus: evidenceTimingState.status,
    ...(sendShareTargetAt ? { sendShareTargetAt } : {}),
    ...(uploadTargetAt ? { uploadTargetAt } : {}),
    ...(genericEarliestDeadlineAt ? { genericEarliestDeadlineAt } : {}),
    ...(hearingOverrideDeadlineAt ? { hearingOverrideDeadlineAt } : {}),
    ...(controllingDeadlineAt ? { controllingDeadlineAt } : {}),
    controllingDeadlineSource,
    deadlineCandidates
  };
}

export function assessBr02ConsumerAssessment(
  input: AssessBr02ConsumerAssessmentInput
): Br02ConsumerAssessment {
  const noticeEligibility = assessBr02NoticeEligibilityTiming({
    thresholdState: input.thresholdState
  });
  const serviceProof = assessBr02ServiceProof({
    serviceEvent: input.serviceEvent,
    ...(input.consentProofs ? { consentProofs: input.consentProofs } : {}),
    ...(input.freshnessSnapshots ? { freshnessSnapshots: input.freshnessSnapshots } : {})
  });
  const terminationDate = calculateBr02TerminationDate({
    serviceEvent: input.serviceEvent,
    serviceProof,
    ...(input.consentProofs ? { consentProofs: input.consentProofs } : {})
  });
  const evidenceDeadline = input.evidenceTimingState
    ? assessBr02EvidenceDeadline({
        serviceEvent: input.serviceEvent,
        evidenceTimingState: input.evidenceTimingState,
        serviceProof,
        ...(input.consentProofs ? { consentProofs: input.consentProofs } : {}),
        ...(input.hearingDateAt ? { hearingDateAt: input.hearingDateAt } : {}),
        ...(input.hearingNoticeAt ? { hearingNoticeAt: input.hearingNoticeAt } : {})
      })
    : undefined;
  const thresholdState = noticeEligibility.thresholdState;
  const issues = uniqueIssues([
    ...noticeEligibility.issues,
    ...serviceProof.issues,
    ...terminationDate.issues,
    ...(evidenceDeadline?.issues ?? [])
  ]);
  const summary = [
    noticeEligibility.summary,
    serviceProof.summary,
    terminationDate.summary,
    evidenceDeadline?.summary
  ].filter(Boolean).join(" | ");

  return {
    ...buildOutcomeBase({
      issues,
      summary,
      appliedRuleCodes: uniqueStrings([
        ...noticeEligibility.appliedRuleCodes,
        ...serviceProof.appliedRuleCodes,
        ...terminationDate.appliedRuleCodes,
        ...(evidenceDeadline?.appliedRuleCodes ?? [])
      ])
    }),
    thresholdState,
    noticeEligibility,
    serviceProof,
    terminationDate,
    ...(evidenceDeadline ? { evidenceDeadline } : {})
  };
}

function normalizeThresholdState(input: Br02ThresholdStateInput): ThresholdState {
  if (typeof input === "string") {
    return {
      kind: input,
      isEligible: input === "THRESHOLD_MET",
      reasons: []
    };
  }

  return input;
}

function buildOutcomeBase(input: {
  issues: Br02ValidationIssue[];
  summary: string;
  appliedRuleCodes?: string[];
}): Br02OutcomeBase {
  const hardStops = input.issues.filter((issue) => issue.severity === "hard-stop");
  const warnings = input.issues.filter((issue) => issue.severity === "warning");
  const cautions = input.issues.filter((issue) => issue.severity === "slowdown");
  const disposition = deriveDisposition({
    hardStops,
    warnings,
    cautions
  });

  return {
    disposition,
    readyForNextStep: hardStops.length === 0 && cautions.length === 0,
    deterministicSuccess: input.issues.length === 0,
    issues: input.issues,
    hardStops,
    warnings,
    cautions,
    appliedRuleCodes: uniqueStrings(input.appliedRuleCodes ?? []),
    summary: input.summary
  };
}

function deriveDisposition(input: {
  hardStops: Br02ValidationIssue[];
  warnings: Br02ValidationIssue[];
  cautions: Br02ValidationIssue[];
}): Br02ConsumerDisposition {
  if (input.hardStops.length > 0) {
    return "HARD_STOP";
  }

  if (input.cautions.length > 0) {
    return "REVIEW_LED_CAUTION";
  }

  if (input.warnings.length > 0) {
    return "NEEDS_REVIEW";
  }

  return "NEXT_STEP_READY";
}

function issueFromValidatorCode(code: Br02ValidatorCode): Br02ValidationIssue {
  const registryEntry = br02ValidatorSeverityRegistry.find((entry) => entry.code === code);

  if (!registryEntry) {
    throw new Error(`Unknown BR02 validator severity code: ${code}`);
  }

  return {
    code: registryEntry.code,
    severity: registryEntry.severity,
    area: registryEntry.area,
    posture: registryEntry.posture,
    summary: registryEntry.summary,
    ...(registryEntry.guardedInsertionPoint
      ? { guardedInsertionPoint: registryEntry.guardedInsertionPoint }
      : {})
  };
}

function createLocalIssue(input: {
  code: string;
  severity: Br02ValidationIssue["severity"];
  area: Br02ValidationIssue["area"];
  posture: Br02ValidationIssue["posture"];
  summary: string;
  guardedInsertionPoint?: string;
}): Br02ValidationIssue {
  return {
    code: input.code,
    severity: input.severity,
    area: input.area,
    posture: input.posture,
    summary: input.summary,
    ...(input.guardedInsertionPoint
      ? { guardedInsertionPoint: input.guardedInsertionPoint }
      : {})
  };
}

function requireServiceMethod(code: ServiceMethod): Br02ServiceMethodRegistryEntry {
  const entry = br02ServiceMethodRegistry.find((candidate) => candidate.code === code);

  if (!entry) {
    throw new Error(`Unknown BR02 service method: ${code}`);
  }

  return entry;
}

function lookupFreshnessMonitor(
  code: string
): Br02FreshnessMonitorRegistryEntry | undefined {
  return br02FreshnessMonitorRegistry.find((candidate) => candidate.code === code);
}

function selectLinkedConsentProofs(
  serviceEvent: ServiceEvent,
  consentProofs: readonly ConsentProof[]
): readonly ConsentProof[] {
  const candidateProofs = serviceEvent.consentProofId
    ? consentProofs.filter((proof) => proof.id === serviceEvent.consentProofId)
    : consentProofs.filter((proof) => proof.renterPartyId === serviceEvent.renterPartyId);

  return candidateProofs.filter((proof) => (
    proof.renterPartyId === serviceEvent.renterPartyId
    && proof.scope === "EMAIL_SERVICE"
    && proof.channel === "EMAIL"
    && proof.status === "PROVIDED"
  ));
}

function buildServiceProofSummary(input: {
  serviceMethod: Br02ServiceMethodRegistryEntry;
  linkedConsentProofs: readonly ConsentProof[];
  issues: readonly Br02ValidationIssue[];
}): string {
  const parts = [input.serviceMethod.label];

  if (input.linkedConsentProofs.length > 0) {
    parts.push(`linked consent proof count ${input.linkedConsentProofs.length}`);
  }

  if (input.issues.length > 0) {
    parts.push(`issues ${input.issues.map((issue) => issue.code).join(", ")}`);
  }

  return parts.join(" | ");
}

function buildEvidenceDeadlineSummary(input: {
  evidenceTimingState: EvidenceTimingState;
  serviceProof: Br02ServiceProofResult;
  controllingDeadlineAt: DateTimeString | undefined;
  controllingDeadlineSource: Br02EvidenceDeadlineResult["controllingDeadlineSource"];
}): string {
  const parts = [
    `Evidence timing status ${input.evidenceTimingState.status}`,
    `service proof ${input.serviceProof.disposition}`
  ];

  if (input.controllingDeadlineAt) {
    parts.push(`controlling deadline ${input.controllingDeadlineSource}`);
  }

  return parts.join(" | ");
}

function buildEvidenceTimingFreshnessIssue(
  evidenceTimingState: EvidenceTimingState
): Br02ValidationIssue | undefined {
  if (evidenceTimingState.staleStateCode === undefined || evidenceTimingState.staleStateCode === "CURRENT") {
    return undefined;
  }

  const staleState = lookupFreshnessState(
    evidenceTimingState.staleStateCode as Br02FreshnessStateCode
  );

  switch (evidenceTimingState.staleStateCode) {
    case "STALE_WARNING":
      return createLocalIssue({
        code: "GENERIC_EVIDENCE_TIMING_STALE_WARNING",
        severity: "warning",
        area: "FRESHNESS",
        posture: "GUARDED",
        summary: staleState?.summary
          ?? "Generic evidence timing is stale and should remain cautionary."
      });
    case "STALE_SLOWDOWN":
      return issueFromValidatorCode("STALE_GENERIC_TIMING_SURFACE");
    case "SUPERSEDED_BY_HEARING_OVERRIDE":
      return createLocalIssue({
        code: "HEARING_SPECIFIC_OVERRIDE_PRIORITY",
        severity: "warning",
        area: "EVIDENCE_TIMING",
        posture: "DETERMINISTIC",
        summary: staleState?.summary
          ?? "Generic timing has been superseded by a hearing-specific instruction."
      });
    case "UNVERIFIED":
      return createLocalIssue({
        code: "GENERIC_EVIDENCE_TIMING_UNVERIFIED",
        severity: "warning",
        area: "FRESHNESS",
        posture: "GUARDED",
        summary: staleState?.summary
          ?? "Generic evidence timing is unverified and must stay non-authoritative."
      });
    default:
      return issueFromValidatorCode("STALE_GENERIC_TIMING_SURFACE");
  }
}

function applyCalendarDays(baseDateTime: DateTimeString, dayCount: number): DateTimeString {
  const date = new Date(baseDateTime);
  date.setUTCDate(date.getUTCDate() + dayCount);
  return date.toISOString();
}

function applyBusinessDays(baseDateTime: DateTimeString, dayCount: number): DateTimeString {
  const date = new Date(baseDateTime);
  let remaining = dayCount;

  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);

    if (!isWeekend(date)) {
      remaining -= 1;
    }
  }

  return date.toISOString();
}

function applyDateOffset(
  baseDateTime: DateTimeString,
  offset: Br02ServiceMethodOffset
): DateTimeString {
  return offset.dayCountKind === "BUSINESS"
    ? applyBusinessDays(baseDateTime, offset.offsetDays)
    : applyCalendarDays(baseDateTime, offset.offsetDays);
}

function applyEvidenceTimingOffset(
  baseDateTime: DateTimeString,
  instruction: EvidenceTimingInstruction
): DateTimeString {
  const dayCountKind = instruction.dayCountKind ?? "CALENDAR";
  const offsetDays = instruction.offsetDays ?? 0;

  return dayCountKind === "BUSINESS"
    ? applyBusinessDays(baseDateTime, offsetDays)
    : applyCalendarDays(baseDateTime, offsetDays);
}

function earliestDateTime(
  left?: DateTimeString,
  right?: DateTimeString
): DateTimeString | undefined {
  if (left && right) {
    return left <= right ? left : right;
  }

  return left ?? right;
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

function lookupFreshnessState(
  code: Br02FreshnessStateCode
): { summary: string } | undefined {
  return br02FreshnessStateRegistry.find((candidate) => candidate.code === code);
}

function uniqueIssues(issues: readonly Br02ValidationIssue[]): Br02ValidationIssue[] {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    if (seen.has(issue.code)) {
      return false;
    }

    seen.add(issue.code);
    return true;
  });
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export * from "./models.js";
