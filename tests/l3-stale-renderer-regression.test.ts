import test from "node:test";
import assert from "node:assert/strict";

import {
  assessBr02ServiceEvent,
  buildBr02EvidenceTimingState,
  createBr02ServiceEventRecord
} from "../src/modules/br02/index.js";
import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState
} from "../src/domain/model.js";
import {
  generateOutputPackageShell,
  type OfficialHandoffGuidancePackageShell,
  type OutputSelectionInput,
  type PrepPackOutputPackageShell
} from "../src/modules/output/index.js";
import { createTouchpointPostureSnapshot } from "../src/modules/touchpoints/index.js";

interface Br02StaleAssessmentInput {
  seed: string;
  staleStateCode: "STALE_WARNING" | "STALE_SLOWDOWN";
  withHearingOverride?: boolean;
}

function buildOutputSelectionInput(
  overrides: Partial<OutputSelectionInput> = {}
): OutputSelectionInput {
  return {
    matterId: "matter-l3-regression",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    ...overrides
  };
}

function expectPrepPack(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): PrepPackOutputPackageShell {
  if (outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY output shell.");
  }

  return outputPackage;
}

function expectHandoffGuidance(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): OfficialHandoffGuidancePackageShell {
  if (outputPackage.kind !== "OFFICIAL_HANDOFF_GUIDANCE") {
    throw new Error("Expected OFFICIAL_HANDOFF_GUIDANCE output shell.");
  }

  return outputPackage;
}

function buildBr02StaleAssessment(
  input: Br02StaleAssessmentInput
): ReturnType<typeof assessBr02ServiceEvent> {
  const serviceEvent = createBr02ServiceEventRecord({
    id: `service-${input.seed}`,
    matterId: `matter-${input.seed}`,
    renterPartyId: `renter-${input.seed}`,
    serviceMethod: "REGISTERED_POST",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const evidenceTimingState = buildBr02EvidenceTimingState({
    id: `timing-${input.seed}`,
    matterId: `matter-${input.seed}`,
    renterPartyId: `renter-${input.seed}`,
    serviceEventId: serviceEvent.id,
    staleStateCode: input.staleStateCode,
    ...(input.withHearingOverride
      ? {
          hearingSpecificOverride: {
            code: `HEARING-${input.seed.toUpperCase()}`,
            label: "Hearing override",
            relativeTo: "HEARING_NOTICE" as const,
            offsetDays: 1,
            dayCountKind: "CALENDAR" as const
          }
        }
      : {})
  });

  return assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent,
    evidenceTimingState,
    ...(input.withHearingOverride
      ? { hearingNoticeAt: "2026-04-07T10:00:00.000Z" }
      : {})
  });
}

test("L3-03 stale slowdown plus wrong-channel reroute stays fail-closed across prep-pack and handoff", () => {
  const assessment = buildBr02StaleAssessment({
    seed: "stale-wrong-channel",
    staleStateCode: "STALE_SLOWDOWN"
  });
  const commonOutputInput = buildOutputSelectionInput({
    br02ConsumerAssessment: assessment.consumerAssessment,
    touchpointIds: ["vic-arrears-freshness-watch"],
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      })
    ]
  });
  const prepPack = expectPrepPack(generateOutputPackageShell({
    ...commonOutputInput,
    outputMode: createOutputModeState("PREP_PACK_COPY_READY")
  }));
  const guidance = expectHandoffGuidance(generateOutputPackageShell({
    ...commonOutputInput,
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE")
  }));

  assert.equal(assessment.consumerAssessment.disposition, "REVIEW_LED_CAUTION");
  assert.ok(
    assessment.consumerAssessment.cautions.some(
      (issue) => issue.code === "STALE_GENERIC_TIMING_SURFACE"
    )
  );
  assert.ok(
    prepPack.carryForwardControls.some((control) => (
      control.code === "STALE_GENERIC_TIMING_SURFACE"
      && control.severity === "SLOWDOWN"
    ))
  );
  assert.ok(prepPack.blockKeys.includes("wrong-channel-reroute"));
  assert.ok(prepPack.blockKeys.includes("referral-stop"));
  assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"));
  assert.equal(prepPack.rendererState.primaryState, "REVIEW_REQUIRED");
  assert.equal(prepPack.rendererState.handoff.posture, "REFERRAL_STOP");
  assert.equal(prepPack.rendererState.progression.referredOut, true);
  assert.equal(
    prepPack.rendererState.ownership.nextAction.kind,
    "REFER_OUTSIDE_STANDARD_PATH"
  );
  assert.equal(prepPack.rendererState.ownership.officialExecution.required, false);
  assert.equal(
    prepPack.rendererState.ownership.officialExecution.productExecution,
    "NOT_EXECUTED_BY_PRODUCT"
  );
  assert.ok(
    prepPack.trustBinding.reviewStateKeys.includes(
      "review-state.slowdown-review-required"
    )
  );
  assert.ok(
    prepPack.trustBinding.reviewStateKeys.includes(
      "review-state.wrong-channel-reroute"
    )
  );

  assert.ok(guidance.guidance.guidanceBlockKeys.includes("wrong-channel-reroute"));
  assert.ok(guidance.guidance.guidanceBlockKeys.includes("referral-stop"));
  assert.equal(guidance.rendererState.handoff.posture, "REFERRAL_STOP");
  assert.equal(
    guidance.rendererState.ownership.nextAction.kind,
    "REFER_OUTSIDE_STANDARD_PATH"
  );
  assert.equal(guidance.rendererState.ownership.officialExecution.required, false);
});

test("L3-03 stale warning plus live-confirmation keeps slowdown review explicit without referral drift", () => {
  const assessment = buildBr02StaleAssessment({
    seed: "stale-live-confirmation",
    staleStateCode: "STALE_WARNING"
  });
  const commonOutputInput = buildOutputSelectionInput({
    br02ConsumerAssessment: assessment.consumerAssessment,
    touchpointIds: ["vic-arrears-freshness-watch"],
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      })
    ]
  });
  const prepPack = expectPrepPack(generateOutputPackageShell({
    ...commonOutputInput,
    outputMode: createOutputModeState("PREP_PACK_COPY_READY")
  }));
  const guidance = expectHandoffGuidance(generateOutputPackageShell({
    ...commonOutputInput,
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE")
  }));

  assert.equal(assessment.consumerAssessment.disposition, "NEEDS_REVIEW");
  assert.ok(
    assessment.consumerAssessment.warnings.some(
      (issue) => issue.code === "GENERIC_EVIDENCE_TIMING_STALE_WARNING"
    )
  );
  assert.ok(
    prepPack.carryForwardControls.some((control) => (
      control.code === "GENERIC_EVIDENCE_TIMING_STALE_WARNING"
      && control.severity === "WARNING"
    ))
  );
  assert.ok(
    prepPack.carryForwardControls.some((control) => (
      control.code === "TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED"
      && control.severity === "SLOWDOWN"
    ))
  );
  assert.ok(prepPack.blockKeys.includes("live-confirmation-required"));
  assert.ok(!prepPack.blockKeys.includes("touchpoint-stale"));
  assert.ok(!prepPack.blockKeys.includes("referral-stop"));
  assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"));
  assert.equal(prepPack.rendererState.primaryState, "REVIEW_REQUIRED");
  assert.equal(prepPack.rendererState.handoff.posture, "GUARDED_REVIEW_REQUIRED");
  assert.equal(
    prepPack.rendererState.ownership.nextAction.kind,
    "COMPLETE_GUARDED_REVIEW"
  );
  assert.equal(prepPack.rendererState.progression.referredOut, false);
  assert.ok(
    prepPack.trustBinding.reviewStateKeys.includes(
      "review-state.live-confirmation-required"
    )
  );
  assert.ok(
    !prepPack.trustBinding.reviewStateKeys.includes(
      "review-state.wrong-channel-reroute"
    )
  );

  assert.ok(guidance.guidance.guidanceBlockKeys.includes("live-confirmation-required"));
  assert.ok(guidance.guidance.guidanceBlockKeys.includes("slowdown-review"));
  assert.ok(!guidance.guidance.guidanceBlockKeys.includes("referral-stop"));
  assert.equal(guidance.rendererState.handoff.posture, "GUARDED_REVIEW_REQUIRED");
  assert.equal(
    guidance.rendererState.ownership.nextAction.kind,
    "COMPLETE_GUARDED_REVIEW"
  );
});

test("L3-03 mixed guarded families preserve hearing-override precedence and still stop on wrong-channel", () => {
  const assessment = buildBr02StaleAssessment({
    seed: "mixed-hearing-live-wrong",
    staleStateCode: "STALE_SLOWDOWN",
    withHearingOverride: true
  });
  const commonOutputInput = buildOutputSelectionInput({
    br02ConsumerAssessment: assessment.consumerAssessment,
    touchpointIds: ["vic-arrears-freshness-watch", "vic-arrears-public-form-warning"],
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      }),
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-public-form-warning",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      })
    ]
  });
  const prepPack = expectPrepPack(generateOutputPackageShell({
    ...commonOutputInput,
    outputMode: createOutputModeState("PREP_PACK_COPY_READY")
  }));
  const guidance = expectHandoffGuidance(generateOutputPackageShell({
    ...commonOutputInput,
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE")
  }));

  assert.equal(
    assessment.evidenceDeadline?.controllingDeadlineSource,
    "HEARING_OVERRIDE"
  );
  assert.ok(
    assessment.consumerAssessment.cautions.some(
      (issue) => issue.code === "HEARING_SPECIFIC_OVERRIDE_PRIORITY"
    )
  );
  assert.ok(
    assessment.consumerAssessment.cautions.some(
      (issue) => issue.code === "STALE_GENERIC_TIMING_SURFACE"
    )
  );
  assert.ok(
    prepPack.carryForwardControls.some((control) => (
      control.code === "HEARING_SPECIFIC_OVERRIDE_PRIORITY"
      && control.severity === "SLOWDOWN"
    ))
  );
  assert.ok(
    prepPack.carryForwardControls.some((control) => (
      control.code === "TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED"
      && control.severity === "SLOWDOWN"
    ))
  );
  assert.ok(
    prepPack.carryForwardControls.some((control) => (
      control.code === "TOUCHPOINT_WRONG_CHANNEL_REROUTE"
      && control.severity === "REFERRAL"
    ))
  );
  assert.ok(prepPack.blockKeys.includes("live-confirmation-required"));
  assert.ok(prepPack.blockKeys.includes("wrong-channel-reroute"));
  assert.ok(prepPack.blockKeys.includes("referral-stop"));
  assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"));
  assert.equal(prepPack.rendererState.primaryState, "REVIEW_REQUIRED");
  assert.notEqual(prepPack.rendererState.primaryState, "READY_FOR_REVIEW");
  assert.equal(prepPack.rendererState.handoff.posture, "REFERRAL_STOP");
  assert.equal(prepPack.rendererState.progression.blockedByReadiness, false);
  assert.equal(prepPack.rendererState.progression.referredOut, true);
  assert.ok(
    prepPack.trustBinding.reviewStateKeys.includes(
      "review-state.live-confirmation-required"
    )
  );
  assert.ok(
    prepPack.trustBinding.reviewStateKeys.includes(
      "review-state.wrong-channel-reroute"
    )
  );

  assert.ok(guidance.guidance.guidanceBlockKeys.includes("slowdown-review"));
  assert.ok(guidance.guidance.guidanceBlockKeys.includes("live-confirmation-required"));
  assert.ok(guidance.guidance.guidanceBlockKeys.includes("wrong-channel-reroute"));
  assert.ok(guidance.guidance.guidanceBlockKeys.includes("referral-stop"));
  assert.equal(guidance.rendererState.handoff.posture, "REFERRAL_STOP");
  assert.equal(guidance.rendererState.ownership.officialExecution.required, false);
  assert.equal(
    guidance.rendererState.ownership.officialExecution.productExecution,
    "NOT_EXECUTED_BY_PRODUCT"
  );
});
