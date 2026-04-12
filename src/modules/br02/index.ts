import type {
  ConsentProof,
  EntityId,
  EvidenceTimingInstruction,
  EvidenceTimingState,
  ServiceEvent,
  ServiceEventScope,
  ServiceEventStatus,
  ServiceMethod
} from "../../domain/model.js";
import {
  assessBr02ConsumerAssessment,
  assessBr02EvidenceDeadline,
  assessBr02NoticeEligibilityTiming,
  assessBr02ServiceProof,
  calculateBr02TerminationDate,
  type Br02ConsumerAssessment,
  type Br02EvidenceDeadlineResult,
  type Br02NoticeEligibilityTimingResult,
  type Br02ServiceProofResult,
  type Br02TerminationDateResult
} from "./consumer.js";
import type {
  Br02FreshnessSnapshot,
  Br02HearingSpecificOverrideInput,
  Br02ServiceAssessment,
  Br02ValidationIssue
} from "./models.js";
import {
  br02DateRuleRegistry,
  br02EvidenceTimingPrecedenceRegistry,
  br02FreshnessMonitorRegistry,
  br02FreshnessStateRegistry,
  br02ServiceMethodRegistry,
  br02ValidatorSeverityRegistry,
  type Br02DateRuleRegistryEntry,
  type Br02EvidenceTimingPrecedenceRegistryEntry,
  type Br02FreshnessMonitorRegistryEntry,
  type Br02FreshnessStateCode,
  type Br02FreshnessStateDefinition,
  type Br02ServiceMethodRegistryEntry,
  type Br02ValidatorCode,
  type Br02ValidatorSeverityRegistryEntry
} from "./registries.js";

export interface CreateBr02ServiceEventInput {
  id: EntityId;
  matterId: EntityId;
  renterPartyId: EntityId;
  serviceMethod: ServiceMethod;
  serviceScope?: ServiceEventScope;
  serviceAttempt?: number;
  eventStatus?: ServiceEventStatus;
  occurredAt?: string;
  proofStatus?: ServiceEvent["proofStatus"];
  consentProofId?: EntityId;
  evidenceTimingStateId?: EntityId;
  proofEvidenceItemIds?: EntityId[];
  notes?: string;
  sourceReferenceIds?: EntityId[];
}

export interface CreateBr02ConsentProofInput {
  id: EntityId;
  renterPartyId: EntityId;
  scopeVariationKey: string;
  capturedAt?: string;
  status?: ConsentProof["status"];
  revokedAt?: string;
  evidenceItemIds?: EntityId[];
  sourceReferenceIds?: EntityId[];
  notes?: string;
}

export interface BuildBr02EvidenceTimingStateInput {
  id: EntityId;
  matterId: EntityId;
  renterPartyId: EntityId;
  serviceEventId?: EntityId;
  staleStateCode?: Br02FreshnessStateCode;
  hearingSpecificOverride?: Br02HearingSpecificOverrideInput;
}

export interface AssessBr02ServiceEventInput {
  thresholdState: "THRESHOLD_MET" | "BELOW_THRESHOLD" | "BLOCKED_INVALID";
  serviceEvent: ServiceEvent;
  consentProofs?: readonly ConsentProof[];
  freshnessSnapshots?: readonly Br02FreshnessSnapshot[];
  evidenceTimingState?: EvidenceTimingState;
  hearingDateAt?: string;
  hearingNoticeAt?: string;
}

export interface Br02ServiceEventAssessment extends Br02ServiceAssessment, Br02ConsumerAssessment {
  consumerAssessment: Br02ConsumerAssessment;
}

const blockedSeverities = new Set(["hard-stop", "slowdown"]);

export function lookupBr02DateRule(code: string): Br02DateRuleRegistryEntry | undefined {
  return br02DateRuleRegistry.find((entry) => entry.code === code);
}

export function lookupBr02ServiceMethod(code: ServiceMethod): Br02ServiceMethodRegistryEntry | undefined {
  return br02ServiceMethodRegistry.find((entry) => entry.code === code);
}

export function lookupBr02ValidatorSeverity(
  code: Br02ValidatorCode
): Br02ValidatorSeverityRegistryEntry | undefined {
  return br02ValidatorSeverityRegistry.find((entry) => entry.code === code);
}

export function lookupBr02EvidenceTimingRule(
  code: string
): Br02EvidenceTimingPrecedenceRegistryEntry | undefined {
  return br02EvidenceTimingPrecedenceRegistry.find((entry) => entry.code === code);
}

export function lookupBr02FreshnessState(
  code: Br02FreshnessStateCode
): Br02FreshnessStateDefinition | undefined {
  return br02FreshnessStateRegistry.find((entry) => entry.code === code);
}

export function lookupBr02FreshnessMonitor(
  code: string
): Br02FreshnessMonitorRegistryEntry | undefined {
  return br02FreshnessMonitorRegistry.find((entry) => entry.code === code);
}

export function createBr02ServiceEventRecord(
  input: CreateBr02ServiceEventInput
): ServiceEvent {
  const method = lookupBr02ServiceMethod(input.serviceMethod);
  const guardedInsertionPoints = method?.guardedInsertionPoint
    ? [method.guardedInsertionPoint]
    : [];

  return {
    id: input.id,
    matterId: input.matterId,
    renterPartyId: input.renterPartyId,
    serviceScope: input.serviceScope ?? "NOTICE",
    serviceMethod: input.serviceMethod,
    serviceAttempt: input.serviceAttempt ?? 1,
    eventStatus: input.eventStatus ?? (input.occurredAt ? "SENT" : "ATTEMPTED"),
    ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
    proofStatus: input.proofStatus ?? defaultProofStatus(method?.posture),
    ...(input.consentProofId ? { consentProofId: input.consentProofId } : {}),
    ...(input.evidenceTimingStateId
      ? { evidenceTimingStateId: input.evidenceTimingStateId }
      : {}),
    proofEvidenceItemIds: input.proofEvidenceItemIds ?? [],
    rulePosture: method?.posture ?? "GUARDED",
    guardedInsertionPoints,
    ...(input.notes ? { notes: input.notes } : {}),
    sourceReferenceIds: input.sourceReferenceIds ?? []
  };
}

export function createBr02ConsentProofRecord(
  input: CreateBr02ConsentProofInput
): ConsentProof {
  return {
    id: input.id,
    renterPartyId: input.renterPartyId,
    scope: "EMAIL_SERVICE",
    scopeVariationKey: input.scopeVariationKey,
    channel: "EMAIL",
    status: input.status ?? "PROVIDED",
    ...(input.capturedAt ? { capturedAt: input.capturedAt } : {}),
    ...(input.revokedAt ? { revokedAt: input.revokedAt } : {}),
    evidenceItemIds: input.evidenceItemIds ?? [],
    sourceReferenceIds: input.sourceReferenceIds ?? [],
    ...(input.notes ? { notes: input.notes } : {})
  };
}

export function createBr02FreshnessSnapshot(input: {
  monitorCode: string;
  stateCode?: Br02FreshnessStateCode;
}): Br02FreshnessSnapshot {
  const monitor = requireFreshnessMonitor(input.monitorCode);
  const state = requireFreshnessState(input.stateCode ?? monitor.defaultStateCode);

  return {
    monitorCode: monitor.code,
    stateCode: state.code,
    authority: monitor.authority,
    neverUniversalDeadlineTruth: monitor.neverUniversalDeadlineTruth,
    summary: state.summary
  };
}

export function buildBr02EvidenceTimingState(
  input: BuildBr02EvidenceTimingStateInput
): EvidenceTimingState {
  const baselineRule = requireEvidenceTimingRule("SERVICE_EVENT_BASELINE_CAPTURE");
  const prepRule = requireEvidenceTimingRule("EVIDENCE_PREP_REQUIRED_7_DAY_STEP");
  const instructions: EvidenceTimingInstruction[] = [
    toEvidenceTimingInstruction(baselineRule),
    toEvidenceTimingInstruction(prepRule)
  ];
  const orderedInstructionCodes = [baselineRule.code, prepRule.code];
  let effectiveInstructionCode = prepRule.code;
  const staleStateCode = input.staleStateCode ?? "CURRENT";
  const notes = [
    "The 7-day step remains a required prep step, not a universal deadline truth.",
    "Generic timing surfaces stay non-authoritative until checked against hearing-specific instructions."
  ];

  if (input.hearingSpecificOverride) {
    const overrideRule = requireEvidenceTimingRule("HEARING_SPECIFIC_OVERRIDE_PRIORITY");
    const overrideCode = input.hearingSpecificOverride.code ?? overrideRule.code;
    instructions.push({
      ...toEvidenceTimingInstruction(overrideRule),
      code: overrideCode,
      label: input.hearingSpecificOverride.label,
      relativeTo: input.hearingSpecificOverride.relativeTo ?? overrideRule.relativeTo,
      ...(typeof input.hearingSpecificOverride.offsetDays === "number"
        ? { offsetDays: input.hearingSpecificOverride.offsetDays }
        : {}),
      ...(input.hearingSpecificOverride.dayCountKind
        ? { dayCountKind: input.hearingSpecificOverride.dayCountKind }
        : {}),
      summary: input.hearingSpecificOverride.summary
        ?? overrideRule.summary
    });
    orderedInstructionCodes.push(overrideCode);
    effectiveInstructionCode = overrideCode;
    notes.push(
      "Hearing-specific instruction is active and outranks generic timing surfaces."
    );
  } else {
    notes.push(
      "No hearing-specific override is attached yet, so the prep step remains the active structural timing instruction."
    );
  }

  if (staleStateCode !== "CURRENT") {
    notes.push(
      `Freshness state ${staleStateCode} keeps timing output reviewable instead of universal.`
    );
  }

  return {
    id: input.id,
    matterId: input.matterId,
    renterPartyId: input.renterPartyId,
    ...(input.serviceEventId ? { serviceEventId: input.serviceEventId } : {}),
    status: deriveEvidenceTimingStateStatus({
      staleStateCode,
      hasOverride: !!input.hearingSpecificOverride
    }),
    instructions,
    precedence: {
      orderedInstructionCodes,
      ...(input.hearingSpecificOverride
        ? { hearingSpecificOverrideCode: effectiveInstructionCode }
        : {}),
      effectiveInstructionCode,
      reason: input.hearingSpecificOverride
        ? "Hearing-specific instruction outranks generic timing surfaces and generic copy must not outrank it."
        : "Service baseline plus the 7-day prep step remain visible until a hearing-specific instruction exists."
    },
    ...(staleStateCode !== "CURRENT" ? { staleStateCode } : {}),
    notes
  };
}

export function assessBr02ServiceEvent(
  input: AssessBr02ServiceEventInput
): Br02ServiceEventAssessment {
  const consumerAssessment = assessBr02ConsumerAssessment({
    thresholdState: input.thresholdState,
    serviceEvent: input.serviceEvent,
    ...(input.consentProofs ? { consentProofs: input.consentProofs } : {}),
    ...(input.freshnessSnapshots ? { freshnessSnapshots: input.freshnessSnapshots } : {}),
    ...(input.evidenceTimingState ? { evidenceTimingState: input.evidenceTimingState } : {}),
    ...(input.hearingDateAt ? { hearingDateAt: input.hearingDateAt } : {}),
    ...(input.hearingNoticeAt ? { hearingNoticeAt: input.hearingNoticeAt } : {})
  });

  return {
    thresholdGateOpen: consumerAssessment.noticeEligibility.canPrepareNotice,
    serviceMethod: input.serviceEvent.serviceMethod,
    appliedDateRuleCodes: consumerAssessment.appliedRuleCodes,
    preferredDeterministicPath: consumerAssessment.serviceProof.preferredDeterministicPath,
    // Keep the legacy readiness flag aligned to the older service-proof boundary.
    readyForDeterministicDateHandling:
      consumerAssessment.noticeEligibility.readyForNextStep
      && consumerAssessment.serviceProof.readyForNextStep,
    consumerAssessment,
    ...consumerAssessment
  };
}

function defaultProofStatus(posture: Br02ServiceMethodRegistryEntry["posture"] | undefined): ServiceEvent["proofStatus"] {
  return posture === "DETERMINISTIC" ? "PARTIAL" : "GUARDED";
}

function toEvidenceTimingInstruction(
  rule: Br02EvidenceTimingPrecedenceRegistryEntry
): EvidenceTimingInstruction {
  return {
    code: rule.code,
    label: rule.label,
    kind: mapEvidenceTimingKind(rule.sourceKind),
    posture: rule.posture,
    relativeTo: rule.relativeTo,
    ...(typeof rule.offsetDays === "number" ? { offsetDays: rule.offsetDays } : {}),
    ...(rule.dayCountKind ? { dayCountKind: rule.dayCountKind } : {}),
    requiredPrepStep: rule.requiredPrepStep,
    universalDeadline: rule.universalDeadline,
    summary: rule.summary
  };
}

function mapEvidenceTimingKind(
  sourceKind: Br02EvidenceTimingPrecedenceRegistryEntry["sourceKind"]
): EvidenceTimingInstruction["kind"] {
  switch (sourceKind) {
    case "SERVICE_EVENT_BASELINE":
      return "SERVICE_BASELINE";
    case "REQUIRED_PREP_STEP":
      return "PREP_STEP";
    case "HEARING_SPECIFIC_OVERRIDE":
      return "HEARING_OVERRIDE";
  }
}

function deriveEvidenceTimingStateStatus(input: {
  staleStateCode: Br02FreshnessStateCode;
  hasOverride: boolean;
}): EvidenceTimingState["status"] {
  if (input.staleStateCode !== "CURRENT") {
    return "STALE";
  }

  return input.hasOverride ? "OVERRIDDEN" : "ACTIVE";
}

function hasLinkedConsentProof(
  serviceEvent: ServiceEvent,
  consentProofs: readonly ConsentProof[]
): boolean {
  const matchingProofs = serviceEvent.consentProofId
    ? consentProofs.filter((proof) => proof.id === serviceEvent.consentProofId)
    : consentProofs.filter((proof) => proof.renterPartyId === serviceEvent.renterPartyId);

  return matchingProofs.some((proof) => (
    proof.renterPartyId === serviceEvent.renterPartyId
    && proof.scope === "EMAIL_SERVICE"
    && proof.channel === "EMAIL"
    && proof.status === "PROVIDED"
  ));
}

function buildValidationIssue(code: Br02ValidatorCode): Br02ValidationIssue {
  const registryEntry = requireValidatorSeverity(code);

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

function requireServiceMethod(code: ServiceMethod): Br02ServiceMethodRegistryEntry {
  const entry = lookupBr02ServiceMethod(code);

  if (!entry) {
    throw new Error(`Unknown BR02 service method: ${code}`);
  }

  return entry;
}

function requireValidatorSeverity(
  code: Br02ValidatorCode
): Br02ValidatorSeverityRegistryEntry {
  const entry = lookupBr02ValidatorSeverity(code);

  if (!entry) {
    throw new Error(`Unknown BR02 validator severity code: ${code}`);
  }

  return entry;
}

function requireEvidenceTimingRule(
  code: string
): Br02EvidenceTimingPrecedenceRegistryEntry {
  const entry = lookupBr02EvidenceTimingRule(code);

  if (!entry) {
    throw new Error(`Unknown BR02 evidence timing rule: ${code}`);
  }

  return entry;
}

function requireFreshnessState(
  code: Br02FreshnessStateCode
): Br02FreshnessStateDefinition {
  const entry = lookupBr02FreshnessState(code);

  if (!entry) {
    throw new Error(`Unknown BR02 freshness state: ${code}`);
  }

  return entry;
}

function requireFreshnessMonitor(
  code: string
): Br02FreshnessMonitorRegistryEntry {
  const entry = lookupBr02FreshnessMonitor(code);

  if (!entry) {
    throw new Error(`Unknown BR02 freshness monitor: ${code}`);
  }

  return entry;
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export * from "./models.js";
export * from "./registries.js";
export * from "./audit.js";
export * from "./qa.js";
export * from "./consumer.js";
