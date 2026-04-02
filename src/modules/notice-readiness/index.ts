export const noticeReadinessOutcomes = [
  "READY_FOR_REVIEW",
  "BLOCKED",
  "REVIEW_REQUIRED",
  "REFER_OUT"
] as const;

export type NoticeReadinessOutcome = (typeof noticeReadinessOutcomes)[number];

export const noticeReadinessIssueSeverities = [
  "hard-stop",
  "slowdown",
  "warning",
  "referral"
] as const;

export type NoticeReadinessIssueSeverity =
  (typeof noticeReadinessIssueSeverities)[number];

export const noticeReadinessIssueCategories = [
  "deterministic",
  "guarded"
] as const;

export type NoticeReadinessIssueCategory =
  (typeof noticeReadinessIssueCategories)[number];

interface NoticeReadinessIssueBase {
  code: string;
  severity: NoticeReadinessIssueSeverity;
  category: NoticeReadinessIssueCategory;
  field:
    | "arrearsThresholdStatus"
    | "arrearsAmount"
    | "paidToDate"
    | "noticeNumber"
    | "serviceMethod"
    | "interstateRouteOut"
    | "guarded.serviceProofSufficiency"
    | "guarded.documentaryEvidenceCompleteness"
    | "guarded.handServiceReview"
    | "guarded.mixedClaimRoutingInteraction";
  message: string;
}

export interface DeterministicNoticeReadinessIssue
  extends NoticeReadinessIssueBase {
  category: "deterministic";
  guarded?: false;
  guardedInsertionPoint?: never;
}

export interface GuardedNoticeReadinessIssue
  extends NoticeReadinessIssueBase {
  category: "guarded";
  guarded: true;
  guardedInsertionPoint: string;
}

export type NoticeReadinessIssue =
  | DeterministicNoticeReadinessIssue
  | GuardedNoticeReadinessIssue;

export type Issue = NoticeReadinessIssue;

export interface NoticeReadinessGuardedHooks {
  serviceProofSufficiency?: "cleared" | "unreviewed" | "guarded" | "not_applicable";
  documentaryEvidenceCompleteness?: "cleared" | "unreviewed" | "guarded" | "not_applicable";
  handServiceReview?: "cleared" | "required" | "guarded" | "not_applicable";
  mixedClaimRoutingInteraction?: "cleared" | "unreviewed" | "guarded" | "not_applicable";
}

export interface UnpaidRentNoticeReadinessInput {
  arrearsThresholdStatus?: "threshold_met" | "below_threshold" | "blocked_invalid";
  arrearsAmount?: number | null;
  paidToDate?: string | null;
  noticeNumber?: string | null;
  serviceMethod?: "EMAIL" | "POST" | "HAND_DELIVERY" | "COURIER" | "PORTAL_OR_OFFICIAL_SYSTEM" | "UNKNOWN" | null;
  interstateRouteOut?: boolean;
  guarded?: NoticeReadinessGuardedHooks;
}

export interface NoticeReadinessSummary {
  hardStopCount: number;
  slowdownCount: number;
  warningCount: number;
  referralCount: number;
}

export interface NoticeReadinessResult {
  outcome: NoticeReadinessOutcome;
  noDeterministicFailures: boolean;
  hardStops: Issue[];
  slowdowns: Issue[];
  warnings: Issue[];
  referrals: Issue[];
  summary: NoticeReadinessSummary;
  primaryReason?: string;
  readyForProgression: boolean;
}

const severityRank: Record<NoticeReadinessIssueSeverity, number> = {
  warning: 0,
  slowdown: 1,
  referral: 2,
  "hard-stop": 3
};

const guardedInsertionPoints = Object.freeze({
  serviceProofSufficiency: "Service-proof sufficiency remains guarded until doctrine is settled.",
  documentaryEvidenceCompleteness: "Documentary evidence completeness may expand beyond the current validator shell.",
  handServiceReview: "Hand-service proof rules remain operator-reviewable and intentionally unsettled.",
  mixedClaimRoutingInteraction: "Mixed-claim routing remains guarded and cannot be finalized here."
});

export function validateUnpaidRentNoticeReadiness(
  input: UnpaidRentNoticeReadinessInput
): NoticeReadinessResult {
  const issues: Issue[] = [];
  const guarded = input.guarded ?? {};

  if (input.interstateRouteOut === true) {
    issues.push({
      code: "INTERSTATE_ROUTE_OUT",
      severity: "referral",
      category: "deterministic",
      field: "interstateRouteOut",
      message: "Interstate matters must be referred out of the standard unpaid-rent notice path."
    });
  }

  if (!Number.isFinite(input.arrearsAmount)) {
    issues.push({
      code: "MISSING_ARREARS_AMOUNT",
      severity: "hard-stop",
      category: "deterministic",
      field: "arrearsAmount",
      message: "Arrears amount is required for notice readiness."
    });
  }

  if (!hasText(input.paidToDate)) {
    issues.push({
      code: "MISSING_PAID_TO_DATE",
      severity: "hard-stop",
      category: "deterministic",
      field: "paidToDate",
      message: "Paid-to date is required for notice readiness."
    });
  }

  if (!hasText(input.noticeNumber)) {
    issues.push({
      code: "MISSING_NOTICE_NUMBER",
      severity: "hard-stop",
      category: "deterministic",
      field: "noticeNumber",
      message: "Notice number is required for notice readiness."
    });
  }

  if (!hasText(input.serviceMethod)) {
    issues.push({
      code: "MISSING_SERVICE_METHOD",
      severity: "hard-stop",
      category: "deterministic",
      field: "serviceMethod",
      message: "Service method capture is required for notice readiness."
    });
  }

  if (input.arrearsThresholdStatus === "below_threshold") {
    issues.push({
      code: "ARREARS_BELOW_THRESHOLD",
      severity: "hard-stop",
      category: "deterministic",
      field: "arrearsThresholdStatus",
      message: "Below-threshold arrears cannot proceed through the standard unpaid-rent notice path."
    });
  } else if (input.arrearsThresholdStatus !== "threshold_met") {
    issues.push({
      code: "ARREARS_THRESHOLD_UNCONFIRMED",
      severity: "hard-stop",
      category: "deterministic",
      field: "arrearsThresholdStatus",
      message: "Arrears threshold status must be confirmed before notice readiness can proceed."
    });
  }

  if (!isGuardedClearedOrNotApplicable(guarded.serviceProofSufficiency)) {
    issues.push({
      code: "SERVICE_PROOF_GUARDED",
      severity: "slowdown",
      category: "guarded",
      field: "guarded.serviceProofSufficiency",
      message: "Service-proof sufficiency remains guarded and requires review.",
      guarded: true,
      guardedInsertionPoint: guardedInsertionPoints.serviceProofSufficiency
    });
  }

  // Documentary completeness stays visible as a warning so future contributors
  // do not collapse it into the stricter service-proof or routing slowdown lane.
  if (!isGuardedClearedOrNotApplicable(guarded.documentaryEvidenceCompleteness)) {
    issues.push({
      code: "DOCUMENTARY_EVIDENCE_GUARDED",
      severity: "warning",
      category: "guarded",
      field: "guarded.documentaryEvidenceCompleteness",
      message: "Documentary evidence completeness remains guarded and must stay visible.",
      guarded: true,
      guardedInsertionPoint: guardedInsertionPoints.documentaryEvidenceCompleteness
    });
  }

  if (!isGuardedClearedOrNotApplicable(guarded.mixedClaimRoutingInteraction)) {
    issues.push({
      code: "MIXED_CLAIM_ROUTING_GUARDED",
      severity: "slowdown",
      category: "guarded",
      field: "guarded.mixedClaimRoutingInteraction",
      message: "Mixed-claim routing interaction remains guarded and requires review.",
      guarded: true,
      guardedInsertionPoint: guardedInsertionPoints.mixedClaimRoutingInteraction
    });
  }

  // Hand delivery stays conservative until review posture is explicitly cleared.
  const handServiceReviewStatus = guarded.handServiceReview
    ?? (input.serviceMethod === "HAND_DELIVERY" ? "required" : "not_applicable");

  if (!isGuardedClearedOrNotApplicable(handServiceReviewStatus)) {
    issues.push({
      code: "HAND_SERVICE_REVIEW_GUARDED",
      severity: "slowdown",
      category: "guarded",
      field: "guarded.handServiceReview",
      message: "Hand-service review remains guarded and requires review.",
      guarded: true,
      guardedInsertionPoint: guardedInsertionPoints.handServiceReview
    });
  }

  const hardStops = issues.filter((issue) => issue.severity === "hard-stop");
  const slowdowns = issues.filter((issue) => issue.severity === "slowdown");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const referrals = issues.filter((issue) => issue.severity === "referral");
  const summary = summarizeIssues({ hardStops, slowdowns, warnings, referrals });
  const outcome = resolveOutcome({ hardStops, slowdowns, referrals });
  const primaryIssue = selectPrimaryIssue(issues);

  return {
    outcome,
    noDeterministicFailures: issues.every((issue) => issue.category === "guarded"),
    hardStops,
    slowdowns,
    warnings,
    referrals,
    summary,
    ...(primaryIssue ? { primaryReason: primaryIssue.message } : {}),
    readyForProgression: outcome === "READY_FOR_REVIEW"
  };
}

function summarizeIssues(input: {
  hardStops: Issue[];
  slowdowns: Issue[];
  warnings: Issue[];
  referrals: Issue[];
}): NoticeReadinessSummary {
  return {
    hardStopCount: input.hardStops.length,
    slowdownCount: input.slowdowns.length,
    warningCount: input.warnings.length,
    referralCount: input.referrals.length
  };
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function resolveOutcome(input: {
  hardStops: Issue[];
  slowdowns: Issue[];
  referrals: Issue[];
}): NoticeReadinessOutcome {
  if (input.hardStops.length > 0) {
    return "BLOCKED";
  }

  if (input.referrals.length > 0) {
    return "REFER_OUT";
  }

  if (input.slowdowns.length > 0) {
    return "REVIEW_REQUIRED";
  }

  return "READY_FOR_REVIEW";
}

function selectPrimaryIssue(issues: Issue[]): Issue | undefined {
  return issues.reduce<Issue | undefined>((current, issue) => {
    if (!current) {
      return issue;
    }

    return isHigherPriorityIssue(issue, current) ? issue : current;
  }, undefined);
}

function isHigherPriorityIssue(candidate: Issue, current: Issue): boolean {
  if (severityRank[candidate.severity] !== severityRank[current.severity]) {
    return severityRank[candidate.severity] > severityRank[current.severity];
  }

  if (candidate.category !== current.category) {
    return candidate.category === "deterministic";
  }

  return false;
}

function isGuardedClearedOrNotApplicable(value: string | undefined): boolean {
  return value === "cleared" || value === "not_applicable";
}
