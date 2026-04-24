import {
  GUARDED_INSERTION_POINTS,
  type ConsentProof,
  type DateTimeString,
  type EvidenceTimingState,
  type PaymentPlanRecord,
  type ServiceEvent
} from "../../domain/model.js";
import type { ThresholdState } from "../arrears/index.js";
import {
  assessBr02ConsumerAssessment,
  type Br02ConsumerAssessment,
  type Br02EvidenceDeadlineResult,
  type Br02NoticeEligibilityTimingResult,
  type Br02OutcomeBase,
  type Br02ServiceProofResult,
  type Br02TerminationDateResult
} from "./consumer.js";
import type { Br02FreshnessSnapshot, Br02ValidationIssue } from "./models.js";

export const br02RuntimeBridgeResultKinds = [
  "DETERMINISTIC_RESULT",
  "GUARDED_WARNING_OR_REVIEW",
  "OVERRIDE_SENSITIVE_RESULT",
  "HARD_STOP"
] as const;

export type Br02RuntimeBridgeResultKind =
  (typeof br02RuntimeBridgeResultKinds)[number];

export interface Br02RuntimeBridgeSegment<TResult> {
  kind: Br02RuntimeBridgeResultKind;
  deterministicResult: boolean;
  guardedWarningOrReview: boolean;
  overrideSensitiveResult: boolean;
  hardStop: boolean;
  issueCodes: string[];
  summary: string;
  result: TResult;
}

export const br02PaymentPlanTimingBranchCodes = [
  "NO_PAYMENT_PLAN_BRANCH",
  "PAYMENT_PLAN_MINIMUM_WINDOW_PENDING",
  "PAYMENT_PLAN_MINIMUM_WINDOW_MET",
  "PAYMENT_PLAN_REVIEW_REQUIRED"
] as const;

export type Br02PaymentPlanTimingBranchCode =
  (typeof br02PaymentPlanTimingBranchCodes)[number];

export const br02PaymentPlanTimingTargets = Object.freeze({
  minimumBusinessDays: 7
});

export interface AssessBr02PaymentPlanTimingBranchInput {
  paymentPlan?: PaymentPlanRecord;
  serviceEvent: ServiceEvent;
}

export interface Br02PaymentPlanTimingBranchResult extends Br02OutcomeBase {
  paymentPlanId?: string;
  paymentPlanStatus: PaymentPlanRecord["status"] | "NOT_PRESENT";
  branchCode: Br02PaymentPlanTimingBranchCode;
  minimumBusinessDays: number;
  agreedAt?: DateTimeString;
  referenceDateAt?: DateTimeString;
  eligibleAfterAt?: DateTimeString;
  businessDaysElapsed?: number;
}

export interface ResolveBr02RuntimeBridgeInput {
  thresholdState: ThresholdState | ThresholdState["kind"];
  serviceEvent: ServiceEvent;
  consentProofs?: readonly ConsentProof[];
  freshnessSnapshots?: readonly Br02FreshnessSnapshot[];
  evidenceTimingState?: EvidenceTimingState;
  hearingDateAt?: DateTimeString;
  hearingNoticeAt?: DateTimeString;
  paymentPlan?: PaymentPlanRecord;
}

export interface Br02RuntimeBridgeAssessment {
  kind: Br02RuntimeBridgeResultKind;
  deterministicResult: boolean;
  guardedWarningOrReview: boolean;
  overrideSensitiveResult: boolean;
  hardStop: boolean;
  readyForNextStep: boolean;
  issueCodes: string[];
  summary: string;
  noEarlyNoticeGate: Br02RuntimeBridgeSegment<Br02NoticeEligibilityTimingResult>;
  serviceProof: Br02RuntimeBridgeSegment<Br02ServiceProofResult>;
  terminationDate: Br02RuntimeBridgeSegment<Br02TerminationDateResult>;
  evidenceDeadline?: Br02RuntimeBridgeSegment<Br02EvidenceDeadlineResult>;
  paymentPlanTiming: Br02RuntimeBridgeSegment<Br02PaymentPlanTimingBranchResult>;
  consumerAssessment: Br02ConsumerAssessment;
}

export function resolveBr02RuntimeBridge(
  input: ResolveBr02RuntimeBridgeInput
): Br02RuntimeBridgeAssessment {
  const consumerAssessment = assessBr02ConsumerAssessment({
    thresholdState: input.thresholdState,
    serviceEvent: input.serviceEvent,
    ...(input.consentProofs ? { consentProofs: input.consentProofs } : {}),
    ...(input.freshnessSnapshots ? { freshnessSnapshots: input.freshnessSnapshots } : {}),
    ...(input.evidenceTimingState ? { evidenceTimingState: input.evidenceTimingState } : {}),
    ...(input.hearingDateAt ? { hearingDateAt: input.hearingDateAt } : {}),
    ...(input.hearingNoticeAt ? { hearingNoticeAt: input.hearingNoticeAt } : {})
  });
  const paymentPlanTimingResult = assessBr02PaymentPlanTimingBranch({
    serviceEvent: input.serviceEvent,
    ...(input.paymentPlan ? { paymentPlan: input.paymentPlan } : {})
  });

  const noEarlyNoticeGate = buildRuntimeBridgeSegment({
    result: consumerAssessment.noticeEligibility
  });
  const serviceProof = buildRuntimeBridgeSegment({
    result: consumerAssessment.serviceProof
  });
  const terminationDate = buildRuntimeBridgeSegment({
    result: consumerAssessment.terminationDate
  });
  const evidenceDeadline = consumerAssessment.evidenceDeadline
    ? buildRuntimeBridgeSegment({
        result: consumerAssessment.evidenceDeadline,
        overrideSensitive: hasHearingSpecificOverride({
          evidenceTimingState: input.evidenceTimingState,
          evidenceDeadlineResult: consumerAssessment.evidenceDeadline
        })
      })
    : undefined;
  const paymentPlanTiming = buildRuntimeBridgeSegment({
    result: paymentPlanTimingResult
  });
  const segmentKinds = [
    noEarlyNoticeGate.kind,
    serviceProof.kind,
    terminationDate.kind,
    ...(evidenceDeadline ? [evidenceDeadline.kind] : []),
    paymentPlanTiming.kind
  ];
  const kind = selectBridgeKind(segmentKinds);

  return {
    kind,
    deterministicResult: kind === "DETERMINISTIC_RESULT",
    guardedWarningOrReview: kind === "GUARDED_WARNING_OR_REVIEW",
    overrideSensitiveResult: kind === "OVERRIDE_SENSITIVE_RESULT",
    hardStop: kind === "HARD_STOP",
    readyForNextStep: consumerAssessment.readyForNextStep && paymentPlanTimingResult.readyForNextStep,
    issueCodes: uniqueStrings([
      ...consumerAssessment.issues.map((issue) => issue.code),
      ...paymentPlanTimingResult.issues.map((issue) => issue.code)
    ]),
    summary: [
      consumerAssessment.summary,
      paymentPlanTimingResult.summary
    ].filter((summary) => summary.length > 0).join(" | "),
    noEarlyNoticeGate,
    serviceProof,
    terminationDate,
    ...(evidenceDeadline ? { evidenceDeadline } : {}),
    paymentPlanTiming,
    consumerAssessment
  };
}

export function assessBr02PaymentPlanTimingBranch(
  input: AssessBr02PaymentPlanTimingBranchInput
): Br02PaymentPlanTimingBranchResult {
  const paymentPlan = input.paymentPlan;

  if (!paymentPlan) {
    return {
      ...buildOutcomeBase({
        issues: [],
        summary: "No payment-plan branch is attached, so timing remains on the standard BR02 path.",
        appliedRuleCodes: ["PAYMENT_PLAN_MINIMUM_7_BUSINESS_DAY_BRANCH"]
      }),
      paymentPlanStatus: "NOT_PRESENT",
      branchCode: "NO_PAYMENT_PLAN_BRANCH",
      minimumBusinessDays: br02PaymentPlanTimingTargets.minimumBusinessDays
    };
  }

  const issues: Br02ValidationIssue[] = [];
  const appliedRuleCodes = ["PAYMENT_PLAN_MINIMUM_7_BUSINESS_DAY_BRANCH"];
  const resultBase = {
    paymentPlanId: paymentPlan.id,
    paymentPlanStatus: paymentPlan.status,
    minimumBusinessDays: br02PaymentPlanTimingTargets.minimumBusinessDays,
    ...(paymentPlan.agreedAt ? { agreedAt: paymentPlan.agreedAt } : {}),
    ...(input.serviceEvent.occurredAt ? { referenceDateAt: input.serviceEvent.occurredAt } : {})
  };

  if (paymentPlan.status === "BROKEN" || paymentPlan.status === "COMPLETED") {
    return {
      ...buildOutcomeBase({
        issues,
        summary: "Payment-plan status is no longer active, so the timing branch does not hold progression.",
        appliedRuleCodes
      }),
      ...resultBase,
      branchCode: "PAYMENT_PLAN_MINIMUM_WINDOW_MET"
    };
  }

  if (paymentPlan.status === "UNKNOWN") {
    issues.push(createLocalIssue({
      code: "PAYMENT_PLAN_STATUS_UNKNOWN",
      severity: "warning",
      area: "SERVICE",
      posture: "GUARDED",
      summary: "Payment-plan status is unknown and keeps this timing branch review-led.",
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.evidenceTiming
    }));

    return {
      ...buildOutcomeBase({
        issues,
        summary: "Payment-plan branch is present but unresolved because status is unknown.",
        appliedRuleCodes
      }),
      ...resultBase,
      branchCode: "PAYMENT_PLAN_REVIEW_REQUIRED"
    };
  }

  if (!paymentPlan.agreedAt) {
    issues.push(createLocalIssue({
      code: "PAYMENT_PLAN_AGREED_AT_REQUIRED",
      severity: "warning",
      area: "DATE",
      posture: "GUARDED",
      summary: "Payment-plan agreed date is required to resolve the branch timing window.",
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.evidenceTiming
    }));

    return {
      ...buildOutcomeBase({
        issues,
        summary: "Payment-plan branch remains guarded because the agreed date has not been captured.",
        appliedRuleCodes
      }),
      ...resultBase,
      branchCode: "PAYMENT_PLAN_REVIEW_REQUIRED"
    };
  }

  if (!isValidDateTime(paymentPlan.agreedAt)) {
    issues.push(createLocalIssue({
      code: "PAYMENT_PLAN_AGREED_AT_INVALID",
      severity: "hard-stop",
      area: "DATE",
      posture: "DETERMINISTIC",
      summary: "Payment-plan agreed date must be a valid date-time before branch timing can be resolved."
    }));

    return {
      ...buildOutcomeBase({
        issues,
        summary: "Payment-plan branch is blocked because the agreed date is invalid.",
        appliedRuleCodes
      }),
      ...resultBase,
      branchCode: "PAYMENT_PLAN_REVIEW_REQUIRED"
    };
  }

  if (!input.serviceEvent.occurredAt) {
    issues.push(createLocalIssue({
      code: "PAYMENT_PLAN_REFERENCE_DATE_REQUIRED",
      severity: "hard-stop",
      area: "DATE",
      posture: "DETERMINISTIC",
      summary: "Service date is required to evaluate the payment-plan business-day timing branch."
    }));

    return {
      ...buildOutcomeBase({
        issues,
        summary: "Payment-plan branch is blocked because the service reference date is missing.",
        appliedRuleCodes
      }),
      ...resultBase,
      branchCode: "PAYMENT_PLAN_REVIEW_REQUIRED"
    };
  }

  if (!isValidDateTime(input.serviceEvent.occurredAt)) {
    issues.push(createLocalIssue({
      code: "PAYMENT_PLAN_REFERENCE_DATE_INVALID",
      severity: "hard-stop",
      area: "DATE",
      posture: "DETERMINISTIC",
      summary: "Service date must be a valid date-time before payment-plan branch timing can be resolved."
    }));

    return {
      ...buildOutcomeBase({
        issues,
        summary: "Payment-plan branch is blocked because the service reference date is invalid.",
        appliedRuleCodes
      }),
      ...resultBase,
      branchCode: "PAYMENT_PLAN_REVIEW_REQUIRED"
    };
  }

  const eligibleAfterAt = addBusinessDays(
    paymentPlan.agreedAt,
    br02PaymentPlanTimingTargets.minimumBusinessDays
  );
  const businessDaysElapsed = countBusinessDays(
    paymentPlan.agreedAt,
    input.serviceEvent.occurredAt
  );
  const minimumWindowMet = input.serviceEvent.occurredAt >= eligibleAfterAt;

  if (!minimumWindowMet) {
    issues.push(createLocalIssue({
      code: "PAYMENT_PLAN_MINIMUM_WINDOW_PENDING",
      severity: "slowdown",
      area: "EVIDENCE_TIMING",
      posture: "GUARDED",
      summary: "Payment-plan branch remains review-led until the minimum 7-business-day window is met.",
      guardedInsertionPoint: GUARDED_INSERTION_POINTS.evidenceTiming
    }));
  }

  return {
    ...buildOutcomeBase({
      issues,
      summary: minimumWindowMet
        ? "Payment-plan branch reached the minimum 7-business-day window in this runtime bridge."
        : "Payment-plan branch has not yet reached the minimum 7-business-day window and remains guarded.",
      appliedRuleCodes
    }),
    ...resultBase,
    branchCode: minimumWindowMet
      ? "PAYMENT_PLAN_MINIMUM_WINDOW_MET"
      : "PAYMENT_PLAN_MINIMUM_WINDOW_PENDING",
    eligibleAfterAt,
    businessDaysElapsed
  };
}

function buildRuntimeBridgeSegment<
  TResult extends { issues: readonly Br02ValidationIssue[]; summary: string }
>(input: {
  result: TResult;
  overrideSensitive?: boolean;
}): Br02RuntimeBridgeSegment<TResult> {
  const kind = deriveRuntimeBridgeResultKind({
    issues: input.result.issues,
    overrideSensitive: input.overrideSensitive ?? false
  });

  return {
    kind,
    deterministicResult: kind === "DETERMINISTIC_RESULT",
    guardedWarningOrReview: kind === "GUARDED_WARNING_OR_REVIEW",
    overrideSensitiveResult: kind === "OVERRIDE_SENSITIVE_RESULT",
    hardStop: kind === "HARD_STOP",
    issueCodes: input.result.issues.map((issue) => issue.code),
    summary: input.result.summary,
    result: input.result
  };
}

function deriveRuntimeBridgeResultKind(input: {
  issues: readonly Br02ValidationIssue[];
  overrideSensitive: boolean;
}): Br02RuntimeBridgeResultKind {
  if (input.issues.some((issue) => issue.severity === "hard-stop")) {
    return "HARD_STOP";
  }

  if (input.overrideSensitive) {
    return "OVERRIDE_SENSITIVE_RESULT";
  }

  if (containsGuardedWarningOrReview(input.issues)) {
    return "GUARDED_WARNING_OR_REVIEW";
  }

  return "DETERMINISTIC_RESULT";
}

function containsGuardedWarningOrReview(
  issues: readonly Br02ValidationIssue[]
): boolean {
  return issues.some((issue) => (
    issue.posture !== "DETERMINISTIC"
    || issue.severity === "slowdown"
    || !!issue.guardedInsertionPoint
  ));
}

function hasHearingSpecificOverride(input: {
  evidenceTimingState: EvidenceTimingState | undefined;
  evidenceDeadlineResult: Br02EvidenceDeadlineResult;
}): boolean {
  return Boolean(
    input.evidenceTimingState?.precedence.hearingSpecificOverrideCode
  ) || input.evidenceDeadlineResult.controllingDeadlineSource === "HEARING_OVERRIDE";
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
}): Br02OutcomeBase["disposition"] {
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

function selectBridgeKind(
  kinds: readonly Br02RuntimeBridgeResultKind[]
): Br02RuntimeBridgeResultKind {
  const [firstKind] = [...kinds].sort((left, right) => (
    br02RuntimeBridgeResultPriority[right] - br02RuntimeBridgeResultPriority[left]
  ));

  return firstKind ?? "DETERMINISTIC_RESULT";
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

function addBusinessDays(
  baseDateTime: DateTimeString,
  dayCount: number
): DateTimeString {
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

function countBusinessDays(
  fromDateTime: DateTimeString,
  toDateTime: DateTimeString
): number {
  const start = new Date(fromDateTime);
  const end = new Date(toDateTime);

  if (end <= start) {
    return 0;
  }

  const cursor = new Date(start);
  let businessDays = 0;

  while (cursor < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);

    if (cursor <= end && !isWeekend(cursor)) {
      businessDays += 1;
    }
  }

  return businessDays;
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

function isValidDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

const br02RuntimeBridgeResultPriority: Record<Br02RuntimeBridgeResultKind, number> = {
  DETERMINISTIC_RESULT: 0,
  GUARDED_WARNING_OR_REVIEW: 1,
  OVERRIDE_SENSITIVE_RESULT: 2,
  HARD_STOP: 3
};
