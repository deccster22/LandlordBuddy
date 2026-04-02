import type {
  CarryForwardControl,
  ControlSeverity,
  VisibleSourceType
} from "../../domain/posture.js";
import type {
  NoticeReadinessIssue,
  NoticeReadinessResult
} from "../notice-readiness/index.js";

export interface OutputPackageReadinessContent {
  carryForwardControls: CarryForwardControl[];
  showReadinessSummary: boolean;
  showBlockerSummary: boolean;
  showReviewHoldPoints: boolean;
  showGuardedIssueSection: boolean;
  showReferralStop: boolean;
  allowCopyReadyFacts: boolean;
}

export function deriveOutputPackageReadinessContent(
  readiness: NoticeReadinessResult
): OutputPackageReadinessContent {
  return {
    // Blocked readiness stays blocker-oriented instead of being reframed as
    // slowdown or referral handoff posture.
    carryForwardControls: readiness.outcome === "BLOCKED"
      ? []
      : [...readiness.warnings, ...readiness.slowdowns, ...readiness.referrals]
          .map(mapIssueToCarryForwardControl),
    showReadinessSummary: true,
    showBlockerSummary: readiness.outcome === "BLOCKED",
    showReviewHoldPoints:
      readiness.outcome === "BLOCKED"
      || readiness.outcome === "REVIEW_REQUIRED"
      || readiness.outcome === "REFER_OUT",
    showGuardedIssueSection:
      readiness.warnings.length > 0
      || readiness.slowdowns.length > 0
      || readiness.referrals.some((issue) => issue.category === "guarded"),
    showReferralStop: readiness.outcome === "REFER_OUT",
    allowCopyReadyFacts:
      readiness.outcome === "READY_FOR_REVIEW"
      || readiness.outcome === "REVIEW_REQUIRED"
  };
}

function mapIssueToCarryForwardControl(
  issue: NoticeReadinessIssue
): CarryForwardControl {
  return {
    code: issue.code,
    severity: mapControlSeverity(issue.severity),
    summary: issue.message,
    visibleSourceType: mapVisibleSourceType(issue),
    deterministic: issue.category === "deterministic",
    ...(issue.category === "guarded"
      ? { guardedInsertionPoint: issue.guardedInsertionPoint }
      : {})
  };
}

function mapControlSeverity(
  severity: NoticeReadinessIssue["severity"]
): ControlSeverity {
  switch (severity) {
    case "warning":
      return "WARNING";
    case "slowdown":
      return "SLOWDOWN";
    case "referral":
      return "REFERRAL";
    case "hard-stop":
      return "SLOWDOWN";
  }
}

function mapVisibleSourceType(
  issue: NoticeReadinessIssue
): VisibleSourceType {
  return issue.category === "deterministic" ? "STABLE_RULE" : "UNRESOLVED_ITEM";
}
