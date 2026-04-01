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

test("valid inputs can pass notice readiness when guarded hooks are resolved", () => {
  const result = validateUnpaidRentNoticeReadiness(buildBaseInput());

  assert.equal(result.outcome, "valid");
  assert.equal(result.readyForStandardProgression, true);
  assert.equal(result.deterministicPass, true);
  assert.equal(result.issues.length, 0);
});

test("missing arrears amount blocks readiness", () => {
  const input = buildBaseInput();
  input.arrearsAmount = null;

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "hard stop");
  assert.equal(result.deterministicPass, false);
  assert.ok(result.issues.some((issue) => issue.code === "MISSING_ARREARS_AMOUNT"));
});

test("missing paid-to date blocks readiness", () => {
  const input = buildBaseInput();
  input.paidToDate = "";

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "hard stop");
  assert.ok(result.issues.some((issue) => issue.code === "MISSING_PAID_TO_DATE"));
});

test("missing notice number blocks readiness", () => {
  const input = buildBaseInput();
  input.noticeNumber = " ";

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "hard stop");
  assert.ok(result.issues.some((issue) => issue.code === "MISSING_NOTICE_NUMBER"));
});

test("missing service method blocks readiness", () => {
  const input = buildBaseInput();
  input.serviceMethod = null;

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "hard stop");
  assert.ok(result.issues.some((issue) => issue.code === "MISSING_SERVICE_METHOD"));
});

test("below-threshold arrears blocks readiness", () => {
  const input = buildBaseInput();
  input.arrearsThresholdStatus = "below_threshold";

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "hard stop");
  assert.ok(result.issues.some((issue) => issue.code === "ARREARS_BELOW_THRESHOLD"));
});

test("interstate flag prevents standard in-scope progression", () => {
  const input = buildBaseInput();
  input.interstateRouteOut = true;

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "hard stop");
  assert.equal(result.routeOut, true);
  assert.equal(result.readyForStandardProgression, false);
});

test("guarded issues do not silently pass as valid", () => {
  const input = buildBaseInput();
  input.guarded = {
    ...input.guarded,
    serviceProofSufficiency: "unreviewed"
  };

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "slowdown/review");
  assert.equal(result.readyForStandardProgression, false);
  assert.ok(result.summary.slowdownReviews >= 1);
});

test("documentary evidence nuance maps to warning", () => {
  const input = buildBaseInput();
  input.guarded = {
    ...input.guarded,
    documentaryEvidenceCompleteness: "guarded"
  };

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "warning");
  assert.equal(result.summary.warnings, 1);
});

test("hand delivery defaults to slowdown review until explicitly cleared", () => {
  const input = buildBaseInput();
  input.serviceMethod = "HAND_DELIVERY";
  input.guarded = {
    ...input.guarded
  };
  delete input.guarded.handServiceReview;

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "slowdown/review");
  assert.ok(result.issues.some((issue) => issue.code === "HAND_SERVICE_REVIEW_GUARDED"));
});

test("mixed-claim routing placeholder stays visibly guarded", () => {
  const input = buildBaseInput();
  input.guarded = {
    ...input.guarded,
    mixedClaimRoutingInteraction: "unreviewed"
  };

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "slowdown/review");
  assert.ok(result.issues.some((issue) => issue.code === "MIXED_CLAIM_ROUTING_GUARDED"));
});

test("hard stops outrank warnings and slowdown reviews", () => {
  const input = buildBaseInput();
  input.arrearsAmount = null;
  input.guarded = {
    ...input.guarded,
    serviceProofSufficiency: "guarded",
    documentaryEvidenceCompleteness: "guarded"
  };

  const result = validateUnpaidRentNoticeReadiness(input);

  assert.equal(result.outcome, "hard stop");
  assert.equal(result.summary.deterministicBlockers, 1);
  assert.equal(result.summary.slowdownReviews, 1);
  assert.equal(result.summary.warnings, 1);
});
