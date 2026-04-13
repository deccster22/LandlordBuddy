import test from "node:test";
import assert from "node:assert/strict";

import {
  assessBr02ServiceEvent,
  buildBr02EvidenceTimingState,
  createBr02ServiceEventRecord
} from "../src/modules/br02/index.js";
import { deriveBr02WorkflowGate } from "../src/workflow/arrearsHeroWorkflow.js";
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
import {
  validateUnpaidRentNoticeReadiness,
  type UnpaidRentNoticeReadinessInput
} from "../src/modules/notice-readiness/index.js";

function buildOutputSelectionInput(
  overrides: Partial<OutputSelectionInput> = {}
): OutputSelectionInput {
  return {
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    ...overrides
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
      serviceProofSufficiency: "guarded",
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

function expectHandoffGuidance(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): OfficialHandoffGuidancePackageShell {
  if (outputPackage.kind !== "OFFICIAL_HANDOFF_GUIDANCE") {
    throw new Error("Expected OFFICIAL_HANDOFF_GUIDANCE package shell.");
  }

  return outputPackage;
}

test("BR02 downstream workflow gate blocks no-early-notice hard stops", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "BELOW_THRESHOLD",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-hard-stop",
      matterId: "matter-1",
      renterPartyId: "renter-1",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });
  const gate = deriveBr02WorkflowGate({
    consumerAssessment: assessment.consumerAssessment,
    legacyReadyForDeterministicDateHandling: assessment.readyForDeterministicDateHandling
  });
  const prepPack = expectPrepPack(generateOutputPackageShell(buildOutputSelectionInput({
    br02ConsumerAssessment: assessment.consumerAssessment
  })));

  assert.equal(gate.status, "HARD_STOP");
  assert.equal(gate.readinessOutcome, "BLOCKED");
  assert.equal(gate.workflowState, "STOPPED_PENDING_EXTERNAL_INPUT");
  assert.equal(gate.readyForProgression, false);
  assert.equal(gate.hardStop, true);
  assert.equal(gate.nextStepReady, false);
  assert.equal(gate.legacyReadyForDeterministicDateHandlingAligned, true);
  assert.ok(prepPack.blockKeys.includes("blocker-summary"));
  assert.ok(prepPack.blockKeys.includes("review-hold-points"));
  assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"));
  assert.equal(prepPack.trustBinding.reviewHandoffState.readiness.outcome, "BLOCKED");
  assert.equal(prepPack.trustBinding.reviewHandoffState.handoff.posture, "BLOCKED_UPSTREAM");
  assert.equal(prepPack.trustBinding.reviewHandoffState.ownership.nextAction.kind, "RESOLVE_BLOCKER");
});

test("BR02 downstream handoff keeps email-consent gaps review-led", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-email-gap",
      matterId: "matter-2",
      renterPartyId: "renter-2",
      serviceMethod: "EMAIL",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });
  const guidance = expectHandoffGuidance(generateOutputPackageShell(buildOutputSelectionInput({
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    br02ConsumerAssessment: assessment.consumerAssessment
  })));

  assert.equal(assessment.consumerAssessment.disposition, "HARD_STOP");
  assert.ok(guidance.guidance.guidanceBlockKeys.includes("slowdown-review"));
  assert.equal(guidance.trustBinding.reviewHandoffState.readiness.outcome, "BLOCKED");
  assert.equal(guidance.trustBinding.reviewHandoffState.handoff.posture, "BLOCKED_UPSTREAM");
  assert.equal(
    guidance.trustBinding.reviewHandoffState.ownership.nextAction.kind,
    "RESOLVE_BLOCKER"
  );
});

test("BR02 downstream handoff keeps hand-service caution review-led", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-hand-caution",
      matterId: "matter-3",
      renterPartyId: "renter-3",
      serviceMethod: "HAND_DELIVERY",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });
  const gate = deriveBr02WorkflowGate({
    consumerAssessment: assessment.consumerAssessment
  });
  const guidance = expectHandoffGuidance(generateOutputPackageShell(buildOutputSelectionInput({
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    br02ConsumerAssessment: assessment.consumerAssessment
  })));

  assert.equal(gate.status, "REVIEW_LED_CAUTION");
  assert.equal(gate.readinessOutcome, "REVIEW_REQUIRED");
  assert.equal(gate.workflowState, "ARREARS_FACTS_GUARDED");
  assert.equal(gate.nextStepReady, false);
  assert.ok(guidance.guidance.guidanceBlockKeys.includes("slowdown-review"));
  assert.equal(
    guidance.trustBinding.reviewHandoffState.handoff.posture,
    "GUARDED_REVIEW_REQUIRED"
  );
  assert.equal(
    guidance.trustBinding.reviewHandoffState.handoff.reviewBeforeOfficialStep,
    "GUARDED_REVIEW_REQUIRED"
  );
  assert.equal(
    guidance.trustBinding.reviewHandoffState.ownership.nextAction.kind,
    "COMPLETE_GUARDED_REVIEW"
  );
});

test("hearing-specific timing can tighten BR02 downstream readiness beyond the legacy flag", () => {
  const serviceEvent = createBr02ServiceEventRecord({
    id: "service-hearing-override",
    matterId: "matter-4",
    renterPartyId: "renter-4",
    serviceMethod: "REGISTERED_POST",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const evidenceTimingState = buildBr02EvidenceTimingState({
    id: "timing-hearing-override",
    matterId: "matter-4",
    renterPartyId: "renter-4",
    serviceEventId: serviceEvent.id,
    hearingSpecificOverride: {
      code: "HEARING-NOTICE-OVERRIDE",
      label: "Hearing notice override",
      relativeTo: "HEARING_NOTICE",
      offsetDays: 1,
      dayCountKind: "CALENDAR"
    }
  });
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent,
    evidenceTimingState,
    hearingNoticeAt: "2026-04-07T10:00:00.000Z"
  });
  const gate = deriveBr02WorkflowGate({
    consumerAssessment: assessment.consumerAssessment,
    legacyReadyForDeterministicDateHandling: assessment.readyForDeterministicDateHandling
  });
  const prepPack = expectPrepPack(generateOutputPackageShell(buildOutputSelectionInput({
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    br02ConsumerAssessment: assessment.consumerAssessment
  })));

  assert.equal(assessment.readyForDeterministicDateHandling, true);
  assert.equal(gate.status, "NEEDS_REVIEW");
  assert.equal(gate.readinessOutcome, "REVIEW_REQUIRED");
  assert.equal(gate.legacyReadyForDeterministicDateHandlingAligned, false);
  assert.equal(gate.workflowState, "NOTICE_DRAFTING_GUARDED");
  assert.ok(prepPack.blockKeys.includes("review-hold-points"));
  assert.ok(prepPack.blockKeys.includes("guarded-review-flags"));
  assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"));
  assert.equal(
    prepPack.trustBinding.reviewHandoffState.handoff.posture,
    "GUARDED_REVIEW_REQUIRED"
  );
  assert.equal(
    prepPack.trustBinding.reviewHandoffState.ownership.nextAction.kind,
    "COMPLETE_GUARDED_REVIEW"
  );
});

test("threading BR02 consumerAssessment through a notice-readiness baseline does not drift Lane 2 copy surfaces", () => {
  const noticeReadiness = validateUnpaidRentNoticeReadiness(buildNoticeReadinessInput());
  const br02ServiceEventAssessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-baseline-drift-check",
      matterId: "matter-5",
      renterPartyId: "renter-5",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-06T10:00:00.000Z"
    }),
    evidenceTimingState: buildBr02EvidenceTimingState({
      id: "timing-baseline-drift-check",
      matterId: "matter-5",
      renterPartyId: "renter-5",
      serviceEventId: "service-baseline-drift-check",
      hearingSpecificOverride: {
        code: "HEARING-DRIFT-CHECK",
        label: "Hearing drift check",
        relativeTo: "HEARING_DATE",
        offsetDays: 2,
        dayCountKind: "CALENDAR"
      }
    }),
    hearingDateAt: "2026-04-08T10:00:00.000Z"
  });

  const baselinePrepPack = expectPrepPack(generateOutputPackageShell(buildOutputSelectionInput({
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    noticeReadiness
  })));
  const threadedPrepPack = expectPrepPack(generateOutputPackageShell(buildOutputSelectionInput({
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    noticeReadiness,
    br02ConsumerAssessment: br02ServiceEventAssessment.consumerAssessment
  })));
  const baselineGuidance = expectHandoffGuidance(generateOutputPackageShell(buildOutputSelectionInput({
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    noticeReadiness
  })));
  const threadedGuidance = expectHandoffGuidance(generateOutputPackageShell(buildOutputSelectionInput({
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    noticeReadiness,
    br02ConsumerAssessment: br02ServiceEventAssessment.consumerAssessment
  })));

  assert.deepEqual(threadedPrepPack.blockKeys, baselinePrepPack.blockKeys);
  assert.deepEqual(threadedPrepPack.trustBinding.boundaryStatementKeys, baselinePrepPack.trustBinding.boundaryStatementKeys);
  assert.deepEqual(threadedPrepPack.trustBinding.trustCueKeys, baselinePrepPack.trustBinding.trustCueKeys);
  assert.equal(threadedPrepPack.rendererState.primaryState, baselinePrepPack.rendererState.primaryState);
  assert.deepEqual(
    threadedGuidance.guidance.guidanceBlockKeys,
    baselineGuidance.guidance.guidanceBlockKeys
  );
  assert.deepEqual(threadedGuidance.trustBinding.boundaryStatementKeys, baselineGuidance.trustBinding.boundaryStatementKeys);
  assert.deepEqual(threadedGuidance.trustBinding.trustCueKeys, baselineGuidance.trustBinding.trustCueKeys);
  assert.equal(threadedGuidance.rendererState.handoff.posture, baselineGuidance.rendererState.handoff.posture);
  assert.equal(
    threadedGuidance.trustBinding.reviewHandoffState.ownership.nextAction.kind,
    baselineGuidance.trustBinding.reviewHandoffState.ownership.nextAction.kind
  );
});
