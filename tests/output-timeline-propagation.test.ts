import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState,
  type PaymentRecord,
  type RentCharge
} from "../src/domain/model.js";
import { calculateArrearsStatusShell } from "../src/modules/arrears/index.js";
import {
  generateOutputPackageShell,
  type OfficialHandoffGuidancePackageShell,
  type PrepPackOutputPackageShell,
  type PrintableOutputPackageShell
} from "../src/modules/output/index.js";
import {
  validateUnpaidRentNoticeReadiness,
  type UnpaidRentNoticeReadinessInput
} from "../src/modules/notice-readiness/index.js";
import { deriveOutputPackageTimelineContent } from "../src/modules/output/timelineAdapter.js";
import { buildTimelineEngineShell } from "../src/modules/timeline/index.js";

const thresholdRule = {
  version: "P4A-CX-02-shell-v1",
  minimumDaysOverdue: 14,
  minimumOutstandingAmount: { amountMinor: 100000, currency: "AUD" as const }
};

const charge = (overrides: Partial<RentCharge> = {}): RentCharge => ({
  id: "charge-1",
  tenancyId: "tenancy-1",
  dueDate: "2026-03-10",
  amount: { amountMinor: 125000, currency: "AUD" },
  periodStartDate: "2026-03-03",
  periodEndDate: "2026-03-09",
  sourceReferenceIds: [],
  ...overrides
});

const payment = (overrides: Partial<PaymentRecord> = {}): PaymentRecord => ({
  id: "payment-1",
  tenancyId: "tenancy-1",
  receivedAt: "2026-03-12T09:00:00.000Z",
  amount: { amountMinor: 25000, currency: "AUD" },
  sourceReferenceIds: [],
  ...overrides
});

function buildTimeline(overrides: {
  thresholdRule?: typeof thresholdRule;
  charges?: RentCharge[];
  payments?: PaymentRecord[];
  asAt?: string;
} = {}) {
  const arrears = calculateArrearsStatusShell({
    charges: overrides.charges ?? [charge()],
    payments: overrides.payments ?? [],
    thresholdRule: overrides.thresholdRule ?? thresholdRule,
    asAt: overrides.asAt ?? "2026-04-02T10:00:00.000Z"
  });

  return buildTimelineEngineShell({ arrears });
}

function buildOutputPackageInput(mode: "PRINTABLE_OUTPUT" | "PREP_PACK_COPY_READY" | "OFFICIAL_HANDOFF_GUIDANCE") {
  return {
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState(mode),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF")
  };
}

function buildNoticeReadinessInput(): UnpaidRentNoticeReadinessInput {
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

function expectPrepPack(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): PrepPackOutputPackageShell {
  if (outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY package shell.");
  }

  return outputPackage;
}

function expectPrintable(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): PrintableOutputPackageShell {
  if (outputPackage.kind !== "PRINTABLE_OUTPUT") {
    throw new Error("Expected PRINTABLE_OUTPUT package shell.");
  }

  return outputPackage;
}

function expectOfficialHandoff(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): OfficialHandoffGuidancePackageShell {
  if (outputPackage.kind !== "OFFICIAL_HANDOFF_GUIDANCE") {
    throw new Error("Expected OFFICIAL_HANDOFF_GUIDANCE package shell.");
  }

  return outputPackage;
}

test("timeline adapter derives guarded and external sequencing posture without flattening it", () => {
  const timeline = buildTimeline();
  const content = deriveOutputPackageTimelineContent(timeline);

  assert.equal(content.showSequencingSummary, true);
  assert.equal(content.showBlockedSequencingSummary, false);
  assert.equal(content.showGuardedSequencingSummary, true);
  assert.equal(content.showExternalStepSummary, true);
  assert.equal(content.showDependencyHoldPoints, true);
  assert.equal(content.allowCopyReadyFactsWhenTimelineReady, true);
  assert.ok(content.reviewCueKeys.includes("timeline-review.guarded"));
  assert.ok(content.reviewCueKeys.includes("timeline-review.external-handoff"));
  assert.ok(content.reviewCueKeys.includes("timeline-review.dependency-hold-points"));
  assert.ok(!content.reviewCueKeys.includes("timeline-review.blocked"));
  assert.ok(
    content.carryForwardControls.some(
      (control) => control.code === "PAYMENT_PLAN_TIMELINE_GUARDED"
        && control.visibleSourceType === "UNRESOLVED_ITEM"
    )
  );
  assert.ok(
    content.carryForwardControls.some(
      (control) => control.code === "HEARING_TIMELINE_EXTERNAL"
        && control.visibleSourceType === "OFFICIAL_GUIDANCE"
    )
  );
});

test("below-threshold prep packs surface blocked sequencing and suppress copy-ready cues", () => {
  const timeline = buildTimeline({
    charges: [charge({ dueDate: "2026-03-27", periodStartDate: "2026-03-20", periodEndDate: "2026-03-26" })]
  });
  const prepPack = expectPrepPack(generateOutputPackageShell({
    ...buildOutputPackageInput("PREP_PACK_COPY_READY"),
    timeline
  }));

  assert.ok(prepPack.blockKeys.includes("sequencing-summary"));
  assert.ok(prepPack.blockKeys.includes("sequencing-blocked"));
  assert.ok(prepPack.blockKeys.includes("dependency-hold-points"));
  assert.ok(!prepPack.blockKeys.includes("sequencing-guarded"));
  assert.ok(!prepPack.blockKeys.includes("external-step-summary"));
  assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"));
  assert.equal(prepPack.officialSystemAction, "NOT_INCLUDED");
  assert.deepEqual(prepPack.trustBinding.progressionAffordanceKeys, []);
  assert.ok(prepPack.trustBinding.reviewStateKeys.includes("review-state.sequencing-blocked"));
  assert.ok(prepPack.trustBinding.reviewStateKeys.includes("review-state.dependency-holds-visible"));
  assert.ok(prepPack.timelineContent?.reviewCueKeys.includes("timeline-review.blocked"));
  assert.equal(
    prepPack.trustBinding.reviewHandoffState.sequencing.posture,
    "BLOCKED_UPSTREAM"
  );
  assert.equal(
    prepPack.trustBinding.reviewHandoffState.handoff.posture,
    "BLOCKED_UPSTREAM"
  );
  assert.equal(
    prepPack.trustBinding.reviewHandoffState.ownership.nextAction.kind,
    "RESOLVE_BLOCKER"
  );
});

test("blocked readiness and blocked sequencing stay distinct from referral-stop posture", () => {
  const timeline = buildTimeline({
    charges: [charge({
      dueDate: "2026-03-27",
      periodStartDate: "2026-03-20",
      periodEndDate: "2026-03-26"
    })]
  });
  const readinessInput = buildNoticeReadinessInput();
  readinessInput.arrearsAmount = null;
  const noticeReadiness = validateUnpaidRentNoticeReadiness(readinessInput);
  const prepPack = expectPrepPack(generateOutputPackageShell({
    ...buildOutputPackageInput("PREP_PACK_COPY_READY"),
    noticeReadiness,
    timeline
  }));

  assert.equal(prepPack.trustBinding.reviewHandoffState.readiness.outcome, "BLOCKED");
  assert.equal(
    prepPack.trustBinding.reviewHandoffState.readiness.reviewRequirement,
    "BLOCKED"
  );
  assert.equal(
    prepPack.trustBinding.reviewHandoffState.sequencing.posture,
    "BLOCKED_UPSTREAM"
  );
  assert.equal(
    prepPack.trustBinding.reviewHandoffState.handoff.posture,
    "BLOCKED_UPSTREAM"
  );
  assert.equal(
    prepPack.trustBinding.reviewHandoffState.ownership.nextAction.kind,
    "RESOLVE_BLOCKER"
  );
  assert.notEqual(
    prepPack.trustBinding.reviewHandoffState.handoff.posture,
    "REFERRAL_STOP"
  );
});

test("threshold-met printable outputs carry guarded and external sequencing posture as structural surfaces", () => {
  const timeline = buildTimeline();
  const printable = expectPrintable(generateOutputPackageShell({
    ...buildOutputPackageInput("PRINTABLE_OUTPUT"),
    timeline
  }));

  assert.ok(printable.sectionKeys.includes("sequencing-summary"));
  assert.ok(printable.sectionKeys.includes("sequencing-guarded"));
  assert.ok(printable.sectionKeys.includes("external-step-summary"));
  assert.ok(printable.sectionKeys.includes("dependency-hold-points"));
  assert.ok(!printable.sectionKeys.includes("sequencing-blocked"));
  assert.equal(printable.officialSystemAction, "NOT_INCLUDED");
  assert.ok(
    printable.trustBinding.surfaceBindings.some(
      (binding) => binding.surfaceKey === "sequencing-guarded"
        && binding.emphasisZone === "REVIEW"
    )
  );
  assert.ok(
    printable.trustBinding.surfaceBindings.some(
      (binding) => binding.surfaceKey === "external-step-summary"
        && binding.emphasisZone === "REVIEW"
    )
  );
  assert.ok(
    printable.trustBinding.boundaryStatementKeys.includes(
      "boundary.handoff-not-completed-official-step"
    )
  );
  assert.deepEqual(printable.trustBinding.progressionAffordanceKeys, []);
});

test("blocked-invalid timeline stays distinct from guarded and external output posture", () => {
  const arrears = calculateArrearsStatusShell({
    charges: [],
    payments: [payment()],
    asAt: "2026-04-02T10:00:00.000Z"
  });
  const timeline = buildTimelineEngineShell({ arrears });
  const printable = expectPrintable(generateOutputPackageShell({
    ...buildOutputPackageInput("PRINTABLE_OUTPUT"),
    timeline
  }));

  assert.ok(printable.sectionKeys.includes("sequencing-summary"));
  assert.ok(printable.sectionKeys.includes("sequencing-blocked"));
  assert.ok(printable.sectionKeys.includes("dependency-hold-points"));
  assert.ok(!printable.sectionKeys.includes("sequencing-guarded"));
  assert.ok(!printable.sectionKeys.includes("external-step-summary"));
  assert.ok(printable.timelineContent?.reviewCueKeys.includes("timeline-review.blocked-invalid"));
  assert.ok(!printable.timelineContent?.reviewCueKeys.includes("timeline-review.guarded"));
  assert.ok(!printable.timelineContent?.reviewCueKeys.includes("timeline-review.external-handoff"));
});

test("handoff guidance carries timeline-derived guarded and external cues without changing boundary meaning", () => {
  const timeline = buildTimeline();
  const handoff = expectOfficialHandoff(generateOutputPackageShell({
    ...buildOutputPackageInput("OFFICIAL_HANDOFF_GUIDANCE"),
    timeline
  }));

  assert.deepEqual(handoff.guidance.boundaryCodes, [
    "PREP_AND_HANDOFF_ONLY",
    "NO_PRODUCT_SUBMISSION",
    "NO_PORTAL_MIMICRY"
  ]);
  assert.ok(handoff.guidance.guidanceBlockKeys.includes("sequencing-summary"));
  assert.ok(handoff.guidance.guidanceBlockKeys.includes("sequencing-guarded"));
  assert.ok(handoff.guidance.guidanceBlockKeys.includes("external-step-summary"));
  assert.ok(handoff.guidance.guidanceBlockKeys.includes("dependency-hold-points"));
  assert.ok(!handoff.guidance.guidanceBlockKeys.includes("sequencing-blocked"));
  assert.ok(handoff.guidance.guidanceBlockKeys.includes("slowdown-review"));
  assert.ok(
    handoff.guidance.carryForwardControls.some(
      (control) => control.code === "HEARING_TIMELINE_EXTERNAL"
    )
  );
  assert.ok(
    handoff.guidance.trustBinding.reviewStateKeys.includes(
      "review-state.sequencing-guarded"
    )
  );
  assert.ok(
    handoff.guidance.trustBinding.reviewStateKeys.includes(
      "review-state.official-step-external"
    )
  );
  assert.ok(
    handoff.guidance.trustBinding.boundaryStatementKeys.includes(
      "boundary.handoff-not-completed-official-step"
    )
  );
  assert.equal(handoff.officialSystemAction, "NOT_INCLUDED");
  assert.equal(
    handoff.guidance.trustBinding.reviewHandoffState.sequencing.posture,
    "GUARDED_AND_EXTERNAL_VISIBLE"
  );
  assert.equal(
    handoff.guidance.trustBinding.reviewHandoffState.sequencing.externalOfficialDependencyVisible,
    true
  );
  assert.equal(
    handoff.guidance.trustBinding.reviewHandoffState.handoff.posture,
    "GUARDED_REVIEW_REQUIRED"
  );
  assert.equal(
    handoff.guidance.trustBinding.reviewHandoffState.handoff.officialStep,
    "NOT_INCLUDED"
  );
  assert.equal(
    handoff.guidance.trustBinding.reviewHandoffState.ownership.nextAction.kind,
    "COMPLETE_GUARDED_REVIEW"
  );
});
