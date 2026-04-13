import type {
  WorkflowState
} from "../../domain/model.js";
import type {
  CarryForwardControl,
  ControlSeverity
} from "../../domain/posture.js";
import type {
  Br02ConsumerAssessment,
  Br02ValidationIssue
} from "./consumer.js";
import type { OutputPackageReadinessContent } from "../output/readinessAdapter.js";

export const br02DownstreamStatuses = [
  "HARD_STOP",
  "NEEDS_REVIEW",
  "REVIEW_LED_CAUTION",
  "NEXT_STEP_READY"
] as const;

export type Br02DownstreamStatus = (typeof br02DownstreamStatuses)[number];

export interface AssessBr02DownstreamInput {
  consumerAssessment: Br02ConsumerAssessment;
}

export interface Br02DownstreamAssessment {
  status: Br02DownstreamStatus;
  readinessOutcome: "BLOCKED" | "REVIEW_REQUIRED" | "READY_FOR_REVIEW";
  workflowState: WorkflowState;
  readyForProgression: boolean;
  hardStop: boolean;
  needsReview: boolean;
  reviewLedCaution: boolean;
  nextStepReady: boolean;
  issueCodes: string[];
  hardStopIssueCodes: string[];
  reviewIssueCodes: string[];
  cautionIssueCodes: string[];
  carryForwardControls: CarryForwardControl[];
  readinessContent: OutputPackageReadinessContent;
  summary: string;
}

export function deriveBr02DownstreamAssessment(
  input: AssessBr02DownstreamInput
): Br02DownstreamAssessment {
  const { consumerAssessment } = input;
  const status = consumerAssessment.disposition;
  const carryForwardControls = buildBr02CarryForwardControls(consumerAssessment.issues);
  const readinessOutcome = mapDownstreamStatusToReadinessOutcome(status);
  const workflowState = mapDownstreamStatusToWorkflowState(status);
  const nextStepReady = status === "NEXT_STEP_READY";
  const readinessContent = buildBr02ReadinessContent({
    carryForwardControls,
    nextStepReady,
    hardStop: status === "HARD_STOP"
  });

  return {
    status,
    readinessOutcome,
    workflowState,
    readyForProgression: nextStepReady,
    hardStop: status === "HARD_STOP",
    needsReview: status === "NEEDS_REVIEW",
    reviewLedCaution: status === "REVIEW_LED_CAUTION",
    nextStepReady,
    issueCodes: consumerAssessment.issues.map((issue) => issue.code),
    hardStopIssueCodes: consumerAssessment.hardStops.map((issue) => issue.code),
    reviewIssueCodes: consumerAssessment.warnings.map((issue) => issue.code),
    cautionIssueCodes: consumerAssessment.cautions.map((issue) => issue.code),
    carryForwardControls,
    readinessContent,
    summary: consumerAssessment.summary
  };
}

function buildBr02CarryForwardControls(
  issues: readonly Br02ValidationIssue[]
): CarryForwardControl[] {
  return issues.map((issue) => ({
    code: issue.code,
    severity: mapIssueSeverityToControlSeverity(issue.severity),
    summary: issue.summary,
    visibleSourceType: issue.posture === "DETERMINISTIC"
      ? "STABLE_RULE"
      : "UNRESOLVED_ITEM",
    deterministic: issue.posture === "DETERMINISTIC",
    ...(issue.guardedInsertionPoint
      ? { guardedInsertionPoint: issue.guardedInsertionPoint }
      : {})
  }));
}

function buildBr02ReadinessContent(input: {
  carryForwardControls: CarryForwardControl[];
  hardStop: boolean;
  nextStepReady: boolean;
}): OutputPackageReadinessContent {
  return {
    carryForwardControls: input.carryForwardControls,
    showReadinessSummary: true,
    showBlockerSummary: input.hardStop,
    showReviewHoldPoints: !input.nextStepReady,
    showGuardedIssueSection: !input.nextStepReady,
    showReferralStop: input.carryForwardControls.some((control) => control.severity === "REFERRAL"),
    allowCopyReadyFacts: input.nextStepReady
  };
}

function mapDownstreamStatusToReadinessOutcome(
  status: Br02DownstreamStatus
): Br02DownstreamAssessment["readinessOutcome"] {
  switch (status) {
    case "HARD_STOP":
      return "BLOCKED";
    case "NEEDS_REVIEW":
    case "REVIEW_LED_CAUTION":
      return "REVIEW_REQUIRED";
    case "NEXT_STEP_READY":
      return "READY_FOR_REVIEW";
  }
}

function mapDownstreamStatusToWorkflowState(
  status: Br02DownstreamStatus
): WorkflowState {
  switch (status) {
    case "HARD_STOP":
      return "STOPPED_PENDING_EXTERNAL_INPUT";
    case "NEEDS_REVIEW":
      return "NOTICE_DRAFTING_GUARDED";
    case "REVIEW_LED_CAUTION":
      return "ARREARS_FACTS_GUARDED";
    case "NEXT_STEP_READY":
      return "NOTICE_DRAFTING_READY";
  }
}

function mapIssueSeverityToControlSeverity(
  severity: Br02ValidationIssue["severity"]
): ControlSeverity {
  // The carry-forward control family has no hard-stop tier, so BR02 hard stops
  // stay visible as slowdown controls while the downstream readiness outcome carries the block.
  switch (severity) {
    case "hard-stop":
    case "slowdown":
      return "SLOWDOWN";
    case "warning":
      return "WARNING";
    case "referral":
      return "REFERRAL";
  }
}
