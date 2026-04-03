import type {
  CarryForwardControl,
  ControlSeverity,
  VisibleSourceType
} from "../../domain/posture.js";
import type {
  NoticeReadinessIssue,
  NoticeReadinessOutcome,
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

const copyReadyFactOutcomes = new Set<NoticeReadinessOutcome>([
  "READY_FOR_REVIEW",
  "REVIEW_REQUIRED"
]);

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
      hasGuardedIssues(readiness.warnings)
      || hasGuardedIssues(readiness.slowdowns)
      || hasGuardedIssues(readiness.referrals),
    showReferralStop: readiness.outcome === "REFER_OUT",
    // Copy-ready facts are a deliberate trust boundary: blocked and refer-out
    // packages may stay reviewable, but they must not imply copy-ready progress.
    allowCopyReadyFacts: copyReadyFactOutcomes.has(readiness.outcome)
  };
}

function hasGuardedIssues(issues: readonly NoticeReadinessIssue[]): boolean {
  return issues.some((issue) => issue.category === "guarded");
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
