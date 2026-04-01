import type { DateTimeString } from "../../domain/model.js";
import type { ArrearsCalculationShell, ThresholdState } from "../arrears/index.js";

export const timelineMilestoneCategories = [
  "ARREARS_THRESHOLD",
  "NOTICE",
  "PAYMENT_PLAN",
  "EVIDENCE",
  "HEARING"
] as const;

export type TimelineMilestoneCategory = (typeof timelineMilestoneCategories)[number];
export type TimelineMilestoneStatus = "PENDING" | "ELIGIBLE" | "BLOCKED";
export type TimelineMilestoneKind = "COMPUTED_GATE" | "GUARDED_PLACEHOLDER";

export interface ReminderEventHook {
  code: string;
  status: "PENDING" | "AVAILABLE" | "BLOCKED";
  notes: string[];
}

export interface TimelineMilestone {
  id: string;
  category: TimelineMilestoneCategory;
  label: string;
  kind: TimelineMilestoneKind;
  status: TimelineMilestoneStatus;
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

/**
 * Milestone placeholders deliberately stop short of final doctrine.
 * Evidence timing, payment-plan discretion, and hearing sequencing stay guarded.
 */
export function buildTimelineEngineShell(input: {
  arrears: ArrearsCalculationShell;
  asAt?: DateTimeString;
}): TimelineShell {
  const asAt = input.asAt ?? input.arrears.asAt;
  const thresholdState = input.arrears.thresholdState;
  const noticeEligible = thresholdState.kind === "THRESHOLD_MET";
  const blocked = thresholdState.kind === "BLOCKED_INVALID";

  return {
    asAt,
    thresholdState,
    noEarlyNoticeGate: {
      canPrepareNotice: noticeEligible,
      reason: blocked
        ? "Threshold state is blocked because core arrears inputs are insufficient."
        : noticeEligible
          ? "Threshold shell is met. Notice sequencing remains operator-reviewable."
          : "Threshold shell is not yet met, so early notice is not available."
    },
    milestones: [
      {
        id: "arrears-threshold-moment",
        category: "ARREARS_THRESHOLD",
        label: "Arrears threshold moment",
        kind: "COMPUTED_GATE",
        status: toMilestoneStatus(thresholdState),
        ...(input.arrears.thresholdMoment ? {
          targetAt: input.arrears.thresholdMoment,
          earliestAt: input.arrears.thresholdMoment
        } : {}),
        notes: [
          "Computed from threshold shell inputs only.",
          "This does not imply tribunal filing, validity, or settled notice doctrine."
        ],
        reminderHooks: [
          buildReminderHook("ARREARS_THRESHOLD_REVIEW", thresholdState)
        ]
      },
      {
        id: "notice-window-placeholder",
        category: "NOTICE",
        label: "Notice preparation placeholder",
        kind: "GUARDED_PLACEHOLDER",
        status: toMilestoneStatus(thresholdState),
        ...(noticeEligible && input.arrears.thresholdMoment ? {
          earliestAt: input.arrears.thresholdMoment
        } : {}),
        notes: [
          "Represents the no-early-notice gate without settling final notice wording.",
          "Notice-related milestones remain reviewable rather than legally final."
        ],
        reminderHooks: [
          buildReminderHook("NOTICE_GATE_CHECK", thresholdState),
          buildReminderHook("NOTICE_REVIEW_PREP", thresholdState)
        ]
      },
      {
        id: "payment-plan-placeholder",
        category: "PAYMENT_PLAN",
        label: "Payment plan review placeholder",
        kind: "GUARDED_PLACEHOLDER",
        status: blocked ? "BLOCKED" : "PENDING",
        notes: [
          "Payment-plan discretion handling is intentionally deferred.",
          "This shell reserves timeline space without encoding final exceptions."
        ],
        reminderHooks: [
          buildReminderHook("PAYMENT_PLAN_CHECK", thresholdState)
        ]
      },
      {
        id: "evidence-placeholder",
        category: "EVIDENCE",
        label: "Evidence readiness placeholder",
        kind: "GUARDED_PLACEHOLDER",
        status: blocked ? "BLOCKED" : "PENDING",
        notes: [
          "Guarded area: no final evidence-deadline sentence is baked into logic.",
          "Evidence milestone timing is a placeholder pending later doctrine work."
        ],
        reminderHooks: [
          buildReminderHook("EVIDENCE_REVIEW", thresholdState)
        ]
      },
      {
        id: "hearing-placeholder",
        category: "HEARING",
        label: "Hearing preparation placeholder",
        kind: "GUARDED_PLACEHOLDER",
        status: blocked ? "BLOCKED" : "PENDING",
        notes: [
          "Hearing-related dates are placeholders only.",
          "No output here should be read as filing posture or guaranteed procedural validity."
        ],
        reminderHooks: [
          buildReminderHook("HEARING_READINESS", thresholdState)
        ]
      }
    ]
  };
}

function toMilestoneStatus(thresholdState: ThresholdState): TimelineMilestoneStatus {
  if (thresholdState.kind === "BLOCKED_INVALID") {
    return "BLOCKED";
  }

  if (thresholdState.kind === "THRESHOLD_MET") {
    return "ELIGIBLE";
  }

  return "PENDING";
}

function buildReminderHook(code: string, thresholdState: ThresholdState): ReminderEventHook {
  return {
    code,
    status: thresholdState.kind === "BLOCKED_INVALID"
      ? "BLOCKED"
      : thresholdState.kind === "THRESHOLD_MET"
        ? "AVAILABLE"
        : "PENDING",
    notes: ["Reminder/event infrastructure is intentionally left as a shell hook."]
  };
}
