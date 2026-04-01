export const noticeReadinessOutcomes = [
  "valid",
  "warning",
  "slowdown/review",
  "hard stop"
] as const;

export type NoticeReadinessOutcome = (typeof noticeReadinessOutcomes)[number];

export const noticeReadinessIssueCategories = [
  "deterministic-blocker",
  "guarded-warning",
  "guarded-review",
  "route-out"
] as const;

export type NoticeReadinessIssueCategory =
  (typeof noticeReadinessIssueCategories)[number];

export interface NoticeReadinessIssue {
  code: string;
  outcome: NoticeReadinessOutcome;
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
  guardedInsertionPoint?: string;
}

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
  deterministicBlockers: number;
  warnings: number;
  slowdownReviews: number;
  routeOuts: number;
}

export interface NoticeReadinessResult {
  outcome: NoticeReadinessOutcome;
  readyForStandardProgression: boolean;
  deterministicPass: boolean;
  routeOut: boolean;
  issues: NoticeReadinessIssue[];
  summary: NoticeReadinessSummary;
}

const severityRank: Record<NoticeReadinessOutcome, number> = {
  valid: 0,
  warning: 1,
  "slowdown/review": 2,
  "hard stop": 3
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
  const issues: NoticeReadinessIssue[] = [];
  const guarded = input.guarded ?? {};

  if (input.interstateRouteOut === true) {
    issues.push({
      code: "INTERSTATE_ROUTE_OUT",
      outcome: "hard stop",
      category: "route-out",
      field: "interstateRouteOut",
      message: "Interstate matters must not continue through the standard unpaid-rent notice path."
    });
  }

  if (!Number.isFinite(input.arrearsAmount)) {
    issues.push({
      code: "MISSING_ARREARS_AMOUNT",
      outcome: "hard stop",
      category: "deterministic-blocker",
      field: "arrearsAmount",
      message: "Arrears amount is required for notice readiness."
    });
  }

  if (!hasText(input.paidToDate)) {
    issues.push({
      code: "MISSING_PAID_TO_DATE",
      outcome: "hard stop",
      category: "deterministic-blocker",
      field: "paidToDate",
      message: "Paid-to date is required for notice readiness."
    });
  }

  if (!hasText(input.noticeNumber)) {
    issues.push({
      code: "MISSING_NOTICE_NUMBER",
      outcome: "hard stop",
      category: "deterministic-blocker",
      field: "noticeNumber",
      message: "Notice number is required for notice readiness."
    });
  }

  if (!hasText(input.serviceMethod)) {
    issues.push({
      code: "MISSING_SERVICE_METHOD",
      outcome: "hard stop",
      category: "deterministic-blocker",
      field: "serviceMethod",
      message: "Service method capture is required for notice readiness."
    });
  }

  if (input.arrearsThresholdStatus === "below_threshold") {
    issues.push({
      code: "ARREARS_BELOW_THRESHOLD",
      outcome: "hard stop",
      category: "deterministic-blocker",
      field: "arrearsThresholdStatus",
      message: "Below-threshold arrears cannot proceed through the standard unpaid-rent notice path."
    });
  } else if (input.arrearsThresholdStatus !== "threshold_met") {
    issues.push({
      code: "ARREARS_THRESHOLD_UNCONFIRMED",
      outcome: "hard stop",
      category: "deterministic-blocker",
      field: "arrearsThresholdStatus",
      message: "Arrears threshold status must be confirmed before notice readiness can proceed."
    });
  }

  if (!isGuardedClearedOrNotApplicable(guarded.serviceProofSufficiency)) {
    issues.push({
      code: "SERVICE_PROOF_GUARDED",
      outcome: "slowdown/review",
      category: "guarded-review",
      field: "guarded.serviceProofSufficiency",
      message: "Service-proof sufficiency remains guarded and requires review.",
      guardedInsertionPoint: guardedInsertionPoints.serviceProofSufficiency
    });
  }

  if (!isGuardedClearedOrNotApplicable(guarded.documentaryEvidenceCompleteness)) {
    issues.push({
      code: "DOCUMENTARY_EVIDENCE_GUARDED",
      outcome: "warning",
      category: "guarded-warning",
      field: "guarded.documentaryEvidenceCompleteness",
      message: "Documentary evidence completeness remains guarded and must stay visible.",
      guardedInsertionPoint: guardedInsertionPoints.documentaryEvidenceCompleteness
    });
  }

  if (!isGuardedClearedOrNotApplicable(guarded.mixedClaimRoutingInteraction)) {
    issues.push({
      code: "MIXED_CLAIM_ROUTING_GUARDED",
      outcome: "slowdown/review",
      category: "guarded-review",
      field: "guarded.mixedClaimRoutingInteraction",
      message: "Mixed-claim routing interaction remains guarded and requires review.",
      guardedInsertionPoint: guardedInsertionPoints.mixedClaimRoutingInteraction
    });
  }

  const handServiceReviewStatus = guarded.handServiceReview
    ?? (input.serviceMethod === "HAND_DELIVERY" ? "required" : "not_applicable");

  if (!isGuardedClearedOrNotApplicable(handServiceReviewStatus)) {
    issues.push({
      code: "HAND_SERVICE_REVIEW_GUARDED",
      outcome: "slowdown/review",
      category: "guarded-review",
      field: "guarded.handServiceReview",
      message: "Hand-service review remains guarded and requires review.",
      guardedInsertionPoint: guardedInsertionPoints.handServiceReview
    });
  }

  const summary = summarizeIssues(issues);
  const outcome = issues.reduce<NoticeReadinessOutcome>((current, issue) => {
    return severityRank[issue.outcome] > severityRank[current]
      ? issue.outcome
      : current;
  }, "valid");

  return {
    outcome,
    readyForStandardProgression: outcome === "valid",
    deterministicPass: summary.deterministicBlockers === 0,
    routeOut: summary.routeOuts > 0,
    issues,
    summary
  };
}

function summarizeIssues(issues: NoticeReadinessIssue[]): NoticeReadinessSummary {
  return {
    deterministicBlockers: issues.filter((issue) => issue.category === "deterministic-blocker").length,
    warnings: issues.filter((issue) => issue.category === "guarded-warning").length,
    slowdownReviews: issues.filter((issue) => issue.category === "guarded-review").length,
    routeOuts: issues.filter((issue) => issue.category === "route-out").length
  };
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isGuardedClearedOrNotApplicable(value: string | undefined): boolean {
  return value === "cleared" || value === "not_applicable";
}
