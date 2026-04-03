import {
  GUARDED_INSERTION_POINTS,
  type DateTimeString
} from "../../domain/model.js";
import type { ArrearsCalculationShell, ThresholdState } from "../arrears/index.js";
import type { NoticeReadinessResult } from "../notice-readiness/index.js";

export const timelineMilestoneCategories = [
  "ARREARS_THRESHOLD",
  "NOTICE",
  "PAYMENT_PLAN",
  "EVIDENCE",
  "HEARING"
] as const;

export type TimelineMilestoneCategory = (typeof timelineMilestoneCategories)[number];

export const timelineMilestoneKinds = [
  "DETERMINISTIC_MILESTONE",
  "ADVISORY_MILESTONE",
  "GUARDED_PLACEHOLDER"
] as const;

export type TimelineMilestoneKind = (typeof timelineMilestoneKinds)[number];

export const timelineMilestoneStatuses = [
  "PENDING",
  "ELIGIBLE",
  "BLOCKED",
  "GUARDED",
  "EXTERNAL"
] as const;

export type TimelineMilestoneStatus = (typeof timelineMilestoneStatuses)[number];

export const timelineMilestoneConfidences = [
  "DETERMINISTIC",
  "ADVISORY_ONLY",
  "GUARDED",
  "EXTERNAL_DEPENDENT"
] as const;

export type TimelineMilestoneConfidence = (typeof timelineMilestoneConfidences)[number];

export const timelineMilestoneSourceSensitivities = [
  "STABLE_RULE",
  "GUARDED_DOCTRINE",
  "EXTERNAL_OFFICIAL_INSTRUCTION"
] as const;

export type TimelineMilestoneSourceSensitivity =
  (typeof timelineMilestoneSourceSensitivities)[number];

export const timelineDependencyKinds = [
  "DETERMINISTIC_GATE",
  "READINESS_REVIEW",
  "GUARDED_REVIEW",
  "EXTERNAL_HANDOFF"
] as const;

export type TimelineDependencyKind = (typeof timelineDependencyKinds)[number];

export const timelineDependencyStatuses = [
  "SATISFIED",
  "PENDING",
  "BLOCKED",
  "GUARDED",
  "EXTERNAL"
] as const;

export type TimelineDependencyStatus = (typeof timelineDependencyStatuses)[number];

export type TimelineNoticeReadinessInput =
  Pick<NoticeReadinessResult, "outcome" | "readyForProgression">;

export interface TimelineMilestoneDependency {
  code: string;
  label: string;
  kind: TimelineDependencyKind;
  status: TimelineDependencyStatus;
  reason: string;
}

export interface ReminderEventHook {
  code: string;
  status: "PENDING" | "AVAILABLE" | "BLOCKED" | "GUARDED" | "EXTERNAL";
  notes: string[];
}

export interface TimelineMilestone {
  id: string;
  category: TimelineMilestoneCategory;
  label: string;
  kind: TimelineMilestoneKind;
  status: TimelineMilestoneStatus;
  confidence: TimelineMilestoneConfidence;
  visibilityReason: string;
  sourceSensitivity: TimelineMilestoneSourceSensitivity;
  dependsOn: TimelineMilestoneDependency[];
  guardedInsertionPoint?: string;
  targetAt?: DateTimeString;
  earliestAt?: DateTimeString;
  latestAt?: DateTimeString;
  notes: string[];
  reminderHooks: ReminderEventHook[];
}

export interface TimelineShell {
  asAt: DateTimeString;
  thresholdState: ThresholdState;
  noEarlyNoticeGate: {
    canPrepareNotice: boolean;
    reason: string;
  };
  milestones: TimelineMilestone[];
}

const timelineGuardedInsertionPoints = Object.freeze({
  paymentPlan: "Payment-plan sequencing remains operator-reviewable and intentionally unsettled.",
  hearing: "Hearing sequencing remains external and operator-reviewable in this phase."
});

/**
 * Milestone placeholders deliberately stop short of final doctrine.
 * Evidence timing, payment-plan discretion, and hearing sequencing stay guarded.
 */
export function buildTimelineEngineShell(input: {
  arrears: ArrearsCalculationShell;
  asAt?: DateTimeString;
  noticeReadiness?: TimelineNoticeReadinessInput;
}): TimelineShell {
  const asAt = input.asAt ?? input.arrears.asAt;
  const thresholdState = input.arrears.thresholdState;

  return {
    asAt,
    thresholdState,
    noEarlyNoticeGate: {
      canPrepareNotice: thresholdState.kind === "THRESHOLD_MET",
      reason: buildNoEarlyNoticeReason({
        thresholdState,
        noticeReadiness: input.noticeReadiness
      })
    },
    milestones: [
      buildThresholdMilestone(input.arrears),
      buildNoticeMilestone({
        arrears: input.arrears,
        noticeReadiness: input.noticeReadiness
      }),
      buildPaymentPlanMilestone(thresholdState),
      buildEvidenceMilestone(thresholdState),
      buildHearingMilestone(thresholdState)
    ]
  };
}

function buildThresholdMilestone(arrears: ArrearsCalculationShell): TimelineMilestone {
  const status = toThresholdMilestoneStatus(arrears.thresholdState);

  return {
    id: "arrears-threshold-moment",
    category: "ARREARS_THRESHOLD",
    label: "Arrears threshold moment",
    kind: "DETERMINISTIC_MILESTONE",
    status,
    confidence: "DETERMINISTIC",
    visibilityReason: buildThresholdVisibilityReason(arrears.thresholdState),
    sourceSensitivity: "STABLE_RULE",
    dependsOn: [],
    ...(arrears.thresholdMoment ? {
      targetAt: arrears.thresholdMoment,
      earliestAt: arrears.thresholdMoment
    } : {}),
    notes: [
      "Computed from threshold shell inputs only.",
      "This does not imply tribunal filing, validity, or settled notice doctrine."
    ],
    reminderHooks: [
      buildReminderHook("ARREARS_THRESHOLD_REVIEW", status)
    ]
  };
}

function buildNoticeMilestone(input: {
  arrears: ArrearsCalculationShell;
  noticeReadiness: TimelineNoticeReadinessInput | undefined;
}): TimelineMilestone {
  const thresholdState = input.arrears.thresholdState;
  const status = resolveNoticeMilestoneStatus({
    thresholdState,
    noticeReadiness: input.noticeReadiness
  });

  return {
    id: "notice-window-placeholder",
    category: "NOTICE",
    label: "Notice preparation placeholder",
    kind: "ADVISORY_MILESTONE",
    status,
    confidence: "ADVISORY_ONLY",
    visibilityReason: buildNoticeVisibilityReason({
      thresholdState,
      noticeReadiness: input.noticeReadiness
    }),
    sourceSensitivity: "GUARDED_DOCTRINE",
    dependsOn: [
      buildThresholdDependency(thresholdState),
      buildNoticeReadinessDependency({
        thresholdState,
        noticeReadiness: input.noticeReadiness
      })
    ],
    ...(thresholdState.kind === "THRESHOLD_MET" && input.arrears.thresholdMoment ? {
      earliestAt: input.arrears.thresholdMoment
    } : {}),
    notes: [
      "Represents the no-early-notice gate without settling final notice wording.",
      "Notice progression remains reviewable and should not be read as an official filing step."
    ],
    reminderHooks: [
      buildReminderHook("NOTICE_GATE_CHECK", status),
      buildReminderHook("NOTICE_REVIEW_PREP", status)
    ]
  };
}

function buildPaymentPlanMilestone(thresholdState: ThresholdState): TimelineMilestone {
  const status = thresholdState.kind === "THRESHOLD_MET" ? "GUARDED" : "BLOCKED";

  return {
    id: "payment-plan-placeholder",
    category: "PAYMENT_PLAN",
    label: "Payment plan review placeholder",
    kind: "GUARDED_PLACEHOLDER",
    status,
    confidence: "GUARDED",
    visibilityReason: buildDownstreamVisibilityReason({
      thresholdState,
      guardedSummary:
        "Payment-plan sequencing stays visible but guarded until doctrine is settled."
    }),
    sourceSensitivity: "GUARDED_DOCTRINE",
    dependsOn: [
      buildThresholdDependency(thresholdState),
      buildGuardedReviewDependency({
        code: "PAYMENT_PLAN_REVIEW",
        label: "Payment-plan review",
        reason: "Payment-plan doctrine remains guarded and cannot be finalized here."
      })
    ],
    guardedInsertionPoint: timelineGuardedInsertionPoints.paymentPlan,
    notes: [
      "Payment-plan discretion handling is intentionally deferred.",
      "This shell reserves timeline space without encoding final exceptions."
    ],
    reminderHooks: [
      buildReminderHook("PAYMENT_PLAN_CHECK", status)
    ]
  };
}

function buildEvidenceMilestone(thresholdState: ThresholdState): TimelineMilestone {
  const status = thresholdState.kind === "THRESHOLD_MET" ? "GUARDED" : "BLOCKED";

  return {
    id: "evidence-placeholder",
    category: "EVIDENCE",
    label: "Evidence readiness placeholder",
    kind: "GUARDED_PLACEHOLDER",
    status,
    confidence: "GUARDED",
    visibilityReason: buildDownstreamVisibilityReason({
      thresholdState,
      guardedSummary:
        "Evidence timing stays visible as a guarded review surface, not a final deadline engine."
    }),
    sourceSensitivity: "GUARDED_DOCTRINE",
    dependsOn: [
      buildThresholdDependency(thresholdState),
      buildGuardedReviewDependency({
        code: "EVIDENCE_TIMING_REVIEW",
        label: "Evidence timing review",
        reason: "Evidence timing remains guarded and no final deadline doctrine is encoded."
      })
    ],
    guardedInsertionPoint: GUARDED_INSERTION_POINTS.evidenceTiming,
    notes: [
      "Guarded area: no final evidence-deadline sentence is baked into logic.",
      "Evidence milestone timing is a placeholder pending later doctrine work."
    ],
    reminderHooks: [
      buildReminderHook("EVIDENCE_REVIEW", status)
    ]
  };
}

function buildHearingMilestone(thresholdState: ThresholdState): TimelineMilestone {
  const status = thresholdState.kind === "THRESHOLD_MET" ? "EXTERNAL" : "BLOCKED";

  return {
    id: "hearing-placeholder",
    category: "HEARING",
    label: "Hearing preparation placeholder",
    kind: "GUARDED_PLACEHOLDER",
    status,
    confidence: "EXTERNAL_DEPENDENT",
    visibilityReason: thresholdState.kind === "THRESHOLD_MET"
      ? "Hearing progression remains external and handoff-dependent. The product does not control official scheduling."
      : buildBlockedVisibilityReason(thresholdState),
    sourceSensitivity: "EXTERNAL_OFFICIAL_INSTRUCTION",
    dependsOn: [
      buildThresholdDependency(thresholdState),
      buildGuardedReviewDependency({
        code: "HEARING_SEQUENCE_REVIEW",
        label: "Hearing sequence review",
        reason: "Hearing sequencing remains guarded and should not be treated as settled doctrine."
      }),
      buildExternalHandoffDependency(thresholdState)
    ],
    guardedInsertionPoint: timelineGuardedInsertionPoints.hearing,
    notes: [
      "Hearing-related dates are placeholders only.",
      "Any official listing, filing, or acceptance remains outside the product boundary."
    ],
    reminderHooks: [
      buildReminderHook("HEARING_READINESS", status)
    ]
  };
}

function toThresholdMilestoneStatus(thresholdState: ThresholdState): TimelineMilestoneStatus {
  if (thresholdState.kind === "BLOCKED_INVALID") {
    return "BLOCKED";
  }

  if (thresholdState.kind === "THRESHOLD_MET") {
    return "ELIGIBLE";
  }

  return "PENDING";
}

function buildThresholdVisibilityReason(thresholdState: ThresholdState): string {
  if (thresholdState.kind === "BLOCKED_INVALID") {
    return "Core arrears inputs are insufficient, so the threshold gate cannot be confirmed.";
  }

  if (thresholdState.kind === "THRESHOLD_MET") {
    return "Threshold shell is met from deterministic arrears inputs.";
  }

  return `Threshold shell is not yet met. ${thresholdState.reasons.join(" ")}`.trim();
}

function buildNoticeVisibilityReason(input: {
  thresholdState: ThresholdState;
  noticeReadiness: TimelineNoticeReadinessInput | undefined;
}): string {
  if (input.thresholdState.kind !== "THRESHOLD_MET") {
    return buildBlockedVisibilityReason(input.thresholdState);
  }

  if (!input.noticeReadiness) {
    return "Threshold shell is met. Notice preparation can be reviewed, but readiness results are still pending.";
  }

  if (input.noticeReadiness.readyForProgression) {
    return "Threshold shell is met and notice readiness is ready for review.";
  }

  switch (input.noticeReadiness.outcome) {
    case "BLOCKED":
      return "Threshold shell is met, but notice readiness has deterministic blockers.";
    case "REFER_OUT":
      return "Threshold shell is met, but this matter has been referred out of the standard unpaid-rent notice path.";
    case "REVIEW_REQUIRED":
      return "Threshold shell is met, but progression still depends on guarded notice-readiness review.";
    case "READY_FOR_REVIEW":
      return "Threshold shell is met and notice readiness is ready for review.";
  }

  return "Threshold shell is met, but notice progression remains reviewable.";
}

function buildDownstreamVisibilityReason(input: {
  thresholdState: ThresholdState;
  guardedSummary: string;
}): string {
  if (input.thresholdState.kind !== "THRESHOLD_MET") {
    return buildBlockedVisibilityReason(input.thresholdState);
  }

  return input.guardedSummary;
}

function buildBlockedVisibilityReason(thresholdState: ThresholdState): string {
  if (thresholdState.kind === "BLOCKED_INVALID") {
    return "This milestone stays unavailable because core arrears inputs are insufficient.";
  }

  return "This milestone stays unavailable until the arrears threshold shell is met.";
}

function buildThresholdDependency(
  thresholdState: ThresholdState
): TimelineMilestoneDependency {
  if (thresholdState.kind === "THRESHOLD_MET") {
    return {
      code: "ARREARS_THRESHOLD_MET",
      label: "Threshold shell confirmed",
      kind: "DETERMINISTIC_GATE",
      status: "SATISFIED",
      reason: "Arrears threshold shell is met."
    };
  }

  if (thresholdState.kind === "BLOCKED_INVALID") {
    return {
      code: "ARREARS_THRESHOLD_MET",
      label: "Threshold shell confirmed",
      kind: "DETERMINISTIC_GATE",
      status: "BLOCKED",
      reason: thresholdState.reasons.join(" ")
    };
  }

  return {
    code: "ARREARS_THRESHOLD_MET",
    label: "Threshold shell confirmed",
    kind: "DETERMINISTIC_GATE",
    status: "PENDING",
    reason: thresholdState.reasons.join(" ")
  };
}

function buildNoticeReadinessDependency(input: {
  thresholdState: ThresholdState;
  noticeReadiness: TimelineNoticeReadinessInput | undefined;
}): TimelineMilestoneDependency {
  if (input.thresholdState.kind !== "THRESHOLD_MET") {
    return {
      code: "NOTICE_READINESS_REVIEW",
      label: "Notice readiness review",
      kind: "READINESS_REVIEW",
      status: "PENDING",
      reason: "Notice readiness remains downstream of the threshold gate."
    };
  }

  if (!input.noticeReadiness) {
    return {
      code: "NOTICE_READINESS_REVIEW",
      label: "Notice readiness review",
      kind: "READINESS_REVIEW",
      status: "PENDING",
      reason: "Readiness review has not yet been attached to the timeline shell."
    };
  }

  if (input.noticeReadiness.readyForProgression) {
    return {
      code: "NOTICE_READINESS_REVIEW",
      label: "Notice readiness review",
      kind: "READINESS_REVIEW",
      status: "SATISFIED",
      reason: "Notice readiness is ready for review."
    };
  }

  switch (input.noticeReadiness.outcome) {
    case "BLOCKED":
      return {
        code: "NOTICE_READINESS_REVIEW",
        label: "Notice readiness review",
        kind: "READINESS_REVIEW",
        status: "BLOCKED",
        reason: "Deterministic readiness blockers keep notice progression unavailable."
      };
    case "REFER_OUT":
      return {
        code: "NOTICE_READINESS_REVIEW",
        label: "Notice readiness review",
        kind: "READINESS_REVIEW",
        status: "BLOCKED",
        reason: "This matter has been referred out of the standard notice progression path."
      };
    case "REVIEW_REQUIRED":
      return {
        code: "NOTICE_READINESS_REVIEW",
        label: "Notice readiness review",
        kind: "READINESS_REVIEW",
        status: "GUARDED",
        reason: "Guarded review items remain visible before notice progression can be treated as ready."
      };
    case "READY_FOR_REVIEW":
      return {
        code: "NOTICE_READINESS_REVIEW",
        label: "Notice readiness review",
        kind: "READINESS_REVIEW",
        status: "SATISFIED",
        reason: "Notice readiness is ready for review."
      };
  }

  return {
    code: "NOTICE_READINESS_REVIEW",
    label: "Notice readiness review",
    kind: "READINESS_REVIEW",
    status: "PENDING",
    reason: "Notice readiness remains reviewable."
  };
}

function buildGuardedReviewDependency(input: {
  code: string;
  label: string;
  reason: string;
}): TimelineMilestoneDependency {
  return {
    code: input.code,
    label: input.label,
    kind: "GUARDED_REVIEW",
    status: "GUARDED",
    reason: input.reason
  };
}

function buildExternalHandoffDependency(
  thresholdState: ThresholdState
): TimelineMilestoneDependency {
  if (thresholdState.kind !== "THRESHOLD_MET") {
    return {
      code: "EXTERNAL_OFFICIAL_HANDOFF",
      label: "External official handoff",
      kind: "EXTERNAL_HANDOFF",
      status: "PENDING",
      reason: "External official steps remain downstream of threshold confirmation."
    };
  }

  return {
    code: "EXTERNAL_OFFICIAL_HANDOFF",
    label: "External official handoff",
    kind: "EXTERNAL_HANDOFF",
    status: "EXTERNAL",
    reason: "Any official action remains outside the product and depends on user or operator handoff."
  };
}

function resolveNoticeMilestoneStatus(input: {
  thresholdState: ThresholdState;
  noticeReadiness: TimelineNoticeReadinessInput | undefined;
}): TimelineMilestoneStatus {
  if (input.thresholdState.kind !== "THRESHOLD_MET") {
    return "BLOCKED";
  }

  if (!input.noticeReadiness) {
    return "PENDING";
  }

  if (input.noticeReadiness.readyForProgression) {
    return "ELIGIBLE";
  }

  if (
    input.noticeReadiness.outcome === "BLOCKED"
    || input.noticeReadiness.outcome === "REFER_OUT"
  ) {
    return "BLOCKED";
  }

  return "PENDING";
}

function buildNoEarlyNoticeReason(input: {
  thresholdState: ThresholdState;
  noticeReadiness: TimelineNoticeReadinessInput | undefined;
}): string {
  if (input.thresholdState.kind === "BLOCKED_INVALID") {
    return "Threshold state is blocked because core arrears inputs are insufficient.";
  }

  if (input.thresholdState.kind !== "THRESHOLD_MET") {
    return "Threshold shell is not yet met, so early notice is not available.";
  }

  if (!input.noticeReadiness) {
    return "Threshold shell is met. Notice sequencing remains operator-reviewable.";
  }

  if (input.noticeReadiness.readyForProgression) {
    return "Threshold shell is met. Notice is ready for review but still not an official filing step.";
  }

  if (input.noticeReadiness.outcome === "REVIEW_REQUIRED") {
    return "Threshold shell is met. Notice preparation can begin, but guarded readiness review still controls progression.";
  }

  if (input.noticeReadiness.outcome === "REFER_OUT") {
    return "Threshold shell is met, but the matter has been referred out of the standard notice progression path.";
  }

  return "Threshold shell is met, but deterministic readiness blockers still prevent notice progression.";
}

function buildReminderHook(
  code: string,
  milestoneStatus: TimelineMilestoneStatus
): ReminderEventHook {
  return {
    code,
    status: toReminderStatus(milestoneStatus),
    notes: ["Reminder/event infrastructure is intentionally left as a shell hook."]
  };
}

function toReminderStatus(
  milestoneStatus: TimelineMilestoneStatus
): ReminderEventHook["status"] {
  switch (milestoneStatus) {
    case "ELIGIBLE":
      return "AVAILABLE";
    case "BLOCKED":
      return "BLOCKED";
    case "GUARDED":
      return "GUARDED";
    case "EXTERNAL":
      return "EXTERNAL";
    case "PENDING":
      return "PENDING";
  }
}

