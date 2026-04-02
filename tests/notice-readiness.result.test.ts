import test from "node:test";
import assert from "node:assert/strict";

import {
  validateUnpaidRentNoticeReadiness,
  type UnpaidRentNoticeReadinessInput
} from "../src/modules/notice-readiness/index.js";

function buildBaseInput(): UnpaidRentNoticeReadinessInput {
  return {
    arrearsThresholdStatus: "threshold_met",
    arrearsAmount: 1850,
    paidToDate: "2026-03-20",
    noticeNumber: "NTV-204",
    serviceMethod: "EMAIL",
    interstateRouteOut: false,
    guarded: {
      serviceProofSufficiency: "cleared",
      documentaryEvidenceCompleteness: "cleared",
      handServiceReview: "not_applicable",
      mixedClaimRoutingInteraction: "cleared"
    }
  };
}

test("threshold-met inputs with cleared guarded hooks are ready for review", () => {
  const result = validateUnpaidRentNoticeReadiness(buildBaseInput());

  assert.equal(result.outcome, "READY_FOR_REVIEW");
  assert.equal(result.readyForProgression, true);
  assert.equal(result.deterministicPass, true);
  assert.deepEqual(result.summary, {
    hardStopCount: 0,
    slowdownCount: 0,
    warningCount: 0,
    referralCount: 0
  });
  assert.equal(result.primaryReason, undefined);
});

test("missing mandatory fields block readiness", () => {
  const input = buildBaseInput();
  input.arrearsAmount = null;

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "BLOCKED");
  assert.equal(result.readyForProgression, false);
  assert.equal(result.deterministicPass, false);
  assert.equal(result.summary.hardStopCount, 1);
  assert.equal(result.primaryReason, "Arrears amount is required for notice readiness.");
  assert.ok(result.hardStops.some((issue) => issue.code === "MISSING_ARREARS_AMOUNT"));
});

test("interstate matters are referred out", () => {
  const input = buildBaseInput();
  input.interstateRouteOut = true;

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "REFER_OUT");
  assert.equal(result.readyForProgression, false);
  assert.equal(result.deterministicPass, false);
  assert.equal(result.summary.referralCount, 1);
  assert.equal(
    result.primaryReason,
    "Interstate matters must be referred out of the standard unpaid-rent notice path."
  );
  assert.ok(result.referrals.some((issue) => issue.code === "INTERSTATE_ROUTE_OUT"));
});

test("mixed-claim routing stays guarded and reviewable", () => {
  const input = buildBaseInput();
  input.guarded = {
    ...input.guarded,
    mixedClaimRoutingInteraction: "unreviewed"
  };

  const result = validateUnpaidRentNoticeReadiness(input);
  const mixedClaimIssue = result.slowdowns.find(
    (issue) => issue.code === "MIXED_CLAIM_ROUTING_GUARDED"
  );

  assert.equal(result.outcome, "REVIEW_REQUIRED");
  assert.equal(result.readyForProgression, false);
  assert.equal(result.deterministicPass, true);
  assert.equal(result.summary.slowdownCount, 1);
  assert.ok(mixedClaimIssue);
  assert.equal(mixedClaimIssue?.guarded, true);
  assert.ok(mixedClaimIssue?.guardedInsertionPoint);
});

test("warning-only guarded issues remain ready for review", () => {
  const input = buildBaseInput();
  input.guarded = {
    ...input.guarded,
    documentaryEvidenceCompleteness: "guarded"
  };

  const result = validateUnpaidRentNoticeReadiness(input);
  const warningIssue = result.warnings.find(
    (issue) => issue.code === "DOCUMENTARY_EVIDENCE_GUARDED"
  );

  assert.equal(result.outcome, "READY_FOR_REVIEW");
  assert.equal(result.readyForProgression, true);
  assert.equal(result.deterministicPass, true);
  assert.equal(result.summary.warningCount, 1);
  assert.ok(warningIssue);
  assert.equal(warningIssue?.guarded, true);
  assert.ok(warningIssue?.guardedInsertionPoint);
});

test("hand delivery defaults to review required until explicitly cleared", () => {
  const input = buildBaseInput();
  input.serviceMethod = "HAND_DELIVERY";
  input.guarded = {
    ...input.guarded
  };
  delete input.guarded.handServiceReview;

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "REVIEW_REQUIRED");
  assert.equal(result.summary.slowdownCount, 1);
  assert.ok(result.slowdowns.some((issue) => issue.code === "HAND_SERVICE_REVIEW_GUARDED"));
});

test("referrals outrank slowdowns while keeping both visible", () => {
  const input = buildBaseInput();
  input.interstateRouteOut = true;
  input.guarded = {
    ...input.guarded,
    serviceProofSufficiency: "guarded"
  };

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "REFER_OUT");
  assert.equal(result.summary.referralCount, 1);
  assert.equal(result.summary.slowdownCount, 1);
  assert.equal(
    result.primaryReason,
    "Interstate matters must be referred out of the standard unpaid-rent notice path."
  );
  assert.ok(result.referrals.some((issue) => issue.code === "INTERSTATE_ROUTE_OUT"));
  assert.ok(result.slowdowns.some((issue) => issue.code === "SERVICE_PROOF_GUARDED"));
});

test("hard stops outrank referrals, slowdowns, and warnings", () => {
  const input = buildBaseInput();
  input.interstateRouteOut = true;
  input.arrearsAmount = null;
  input.guarded = {
    ...input.guarded,
    documentaryEvidenceCompleteness: "guarded",
    mixedClaimRoutingInteraction: "guarded"
  };

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "BLOCKED");
  assert.equal(result.summary.hardStopCount, 1);
  assert.equal(result.summary.referralCount, 1);
  assert.equal(result.summary.slowdownCount, 1);
  assert.equal(result.summary.warningCount, 1);
  assert.equal(result.primaryReason, "Arrears amount is required for notice readiness.");
});
