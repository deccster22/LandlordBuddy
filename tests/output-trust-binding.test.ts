import test from "node:test";
import assert from "node:assert/strict";

import {
  createOfficialHandoffStateRecord,
  type CarryForwardControl
} from "../src/domain/model.js";
import type {
  NoticeReadinessIssue,
  NoticeReadinessOutcome,
  NoticeReadinessResult
} from "../src/modules/notice-readiness/index.js";
import { deriveOutputPackageReadinessContent } from "../src/modules/output/readinessAdapter.js";
import { buildStructuralTrustBinding } from "../src/modules/output/trustBindings.js";
import { lookupTouchpointMetadata } from "../src/modules/touchpoints/index.js";

function buildDeterministicIssue(input: {
  code: string;
  severity: NoticeReadinessIssue["severity"];
  field: NoticeReadinessIssue["field"];
  message: string;
}): NoticeReadinessIssue {
  return {
    code: input.code,
    severity: input.severity,
    category: "deterministic",
    field: input.field,
    message: input.message
  };
}

function buildGuardedIssue(input: {
  code: string;
  severity: NoticeReadinessIssue["severity"];
  field: NoticeReadinessIssue["field"];
  message: string;
}): NoticeReadinessIssue {
  return {
    code: input.code,
    severity: input.severity,
    category: "guarded",
    field: input.field,
    message: input.message,
    guarded: true,
    guardedInsertionPoint: "Guarded placeholder hook."
  };
}

function buildReadinessResult(
  overrides: Partial<NoticeReadinessResult> = {}
): NoticeReadinessResult {
  const hardStops = overrides.hardStops ?? [];
  const slowdowns = overrides.slowdowns ?? [];
  const warnings = overrides.warnings ?? [];
  const referrals = overrides.referrals ?? [];
  const outcome = overrides.outcome ?? "READY_FOR_REVIEW";

  return {
    outcome,
    noDeterministicFailures: overrides.noDeterministicFailures ?? true,
    hardStops,
    slowdowns,
    warnings,
    referrals,
    summary: overrides.summary ?? {
      hardStopCount: hardStops.length,
      slowdownCount: slowdowns.length,
      warningCount: warnings.length,
      referralCount: referrals.length
    },
    ...(typeof overrides.primaryReason === "string"
      ? { primaryReason: overrides.primaryReason }
      : {}),
    readyForProgression: overrides.readyForProgression ?? outcome === "READY_FOR_REVIEW"
  };
}

test("guarded issue sections only open for guarded warnings, guarded slowdowns, or guarded referrals", () => {
  const deterministicReferralOnly = deriveOutputPackageReadinessContent(buildReadinessResult({
    outcome: "REFER_OUT",
    noDeterministicFailures: false,
    referrals: [buildDeterministicIssue({
      code: "INTERSTATE_ROUTE_OUT",
      severity: "referral",
      field: "interstateRouteOut",
      message: "Refer the matter out."
    })],
    readyForProgression: false
  }));
  const guardedWarning = deriveOutputPackageReadinessContent(buildReadinessResult({
    warnings: [buildGuardedIssue({
      code: "DOCUMENTARY_EVIDENCE_GUARDED",
      severity: "warning",
      field: "guarded.documentaryEvidenceCompleteness",
      message: "Documentary evidence completeness remains guarded."
    })]
  }));
  const guardedSlowdown = deriveOutputPackageReadinessContent(buildReadinessResult({
    outcome: "REVIEW_REQUIRED",
    slowdowns: [buildGuardedIssue({
      code: "SERVICE_PROOF_GUARDED",
      severity: "slowdown",
      field: "guarded.serviceProofSufficiency",
      message: "Service proof remains guarded."
    })],
    readyForProgression: false
  }));
  const guardedReferral = deriveOutputPackageReadinessContent(buildReadinessResult({
    outcome: "REFER_OUT",
    referrals: [buildGuardedIssue({
      code: "MIXED_CLAIM_GUARDED",
      severity: "referral",
      field: "guarded.mixedClaimRoutingInteraction",
      message: "Mixed-claim routing remains guarded."
    })],
    readyForProgression: false
  }));

  assert.equal(deterministicReferralOnly.showGuardedIssueSection, false);
  assert.equal(guardedWarning.showGuardedIssueSection, true);
  assert.equal(guardedSlowdown.showGuardedIssueSection, true);
  assert.equal(guardedReferral.showGuardedIssueSection, true);
});

test("allowCopyReadyFacts stays limited to ready-for-review and review-required outcomes", () => {
  const expectations: Record<NoticeReadinessOutcome, boolean> = {
    READY_FOR_REVIEW: true,
    BLOCKED: false,
    REVIEW_REQUIRED: true,
    REFER_OUT: false
  };

  for (const [outcome, expected] of Object.entries(expectations)) {
    const content = deriveOutputPackageReadinessContent(buildReadinessResult({
      outcome: outcome as NoticeReadinessOutcome,
      readyForProgression: outcome === "READY_FOR_REVIEW"
    }));

    assert.equal(content.allowCopyReadyFacts, expected, outcome);
  }
});

test("structural trust binding maps boundary codes, source labels, and referral emphasis without final prose", () => {
  const authenticatedTouchpoint = lookupTouchpointMetadata("vic-arrears-authenticated-handoff");
  const freshnessTouchpoint = lookupTouchpointMetadata("vic-arrears-freshness-watch");

  if (!authenticatedTouchpoint || !freshnessTouchpoint) {
    throw new Error("Expected Victoria arrears touchpoints to be present.");
  }

  const interstateReferral: CarryForwardControl = {
    code: "INTERSTATE_ROUTE_OUT",
    severity: "REFERRAL",
    summary: "Interstate route-out stays explicit.",
    visibleSourceType: "STABLE_RULE",
    deterministic: true
  };

  const trustBinding = buildStructuralTrustBinding({
    kind: "OFFICIAL_HANDOFF_GUIDANCE",
    officialHandoff: createOfficialHandoffStateRecord("HANDED_OFF"),
    readinessOutcome: "REFER_OUT",
    blockKeys: [
      "handoff-boundary",
      "authenticated-surface-handoff",
      "freshness-check",
      "referral-stop"
    ],
    touchpoints: [authenticatedTouchpoint, freshnessTouchpoint],
    carryForwardControls: [
      ...authenticatedTouchpoint.carryForwardControls,
      ...freshnessTouchpoint.carryForwardControls,
      interstateReferral
    ],
    boundaryCodes: [
      "PREP_AND_HANDOFF_ONLY",
      "NO_PRODUCT_SUBMISSION",
      "NO_PORTAL_MIMICRY"
    ]
  });

  assert.equal(
    trustBinding.boundaryStatementKeysByCode.PREP_AND_HANDOFF_ONLY,
    "boundary.prep-and-handoff-only"
  );
  assert.equal(
    trustBinding.boundaryStatementKeysByCode.NO_PORTAL_MIMICRY,
    "boundary.no-portal-mimicry"
  );
  assert.ok(
    trustBinding.visibleSourceTypeLabels.some(
      (label) => label.sourceType === "LIVE_PORTAL_OR_FORM_BEHAVIOR"
        && label.labelKey === "source-label.live-portal-or-form-behavior"
    )
  );
  assert.ok(
    trustBinding.visibleSourceTypeLabels.some(
      (label) => label.sourceType === "UNRESOLVED_ITEM"
        && label.labelKey === "source-label.unresolved-item"
    )
  );
  assert.ok(
    trustBinding.surfaceBindings.some(
      (binding) => binding.surfaceKey === "referral-stop"
        && binding.emphasisZone === "REFERRAL"
    )
  );
  assert.ok(
    trustBinding.boundaryStatementKeys.includes("boundary.handoff-not-completed-official-step")
  );
  assert.equal(trustBinding.reviewHandoffState.readiness.outcome, "REFER_OUT");
  assert.equal(trustBinding.reviewHandoffState.handoff.posture, "REFERRAL_STOP");
  assert.equal(
    trustBinding.reviewHandoffState.ownership.nextAction.kind,
    "REFER_OUTSIDE_STANDARD_PATH"
  );
  assert.equal(
    trustBinding.reviewHandoffState.handoff.productExecution,
    "NOT_EXECUTED_BY_PRODUCT"
  );
});
