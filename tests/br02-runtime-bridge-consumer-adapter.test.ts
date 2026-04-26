import test from "node:test";
import assert from "node:assert/strict";

import {
  adaptBr02RuntimeBridgeToConsumerShape,
  assessBr02ServiceEvent,
  buildBr02EvidenceTimingState,
  createBr02ServiceEventRecord,
  deriveBr02DownstreamAssessment
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
import { deriveBr02WorkflowGate } from "../src/workflow/arrearsHeroWorkflow.js";

function buildOutputSelectionInput(
  overrides: Partial<OutputSelectionInput> = {}
): OutputSelectionInput {
  return {
    matterId: "matter-runtime-bridge-adapter",
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

function snapshotDownstream(
  assessment: ReturnType<typeof deriveBr02DownstreamAssessment>
) {
  return {
    status: assessment.status,
    readinessOutcome: assessment.readinessOutcome,
    workflowState: assessment.workflowState,
    hardStop: assessment.hardStop,
    needsReview: assessment.needsReview,
    reviewLedCaution: assessment.reviewLedCaution,
    nextStepReady: assessment.nextStepReady,
    issueCodes: assessment.issueCodes,
    hardStopIssueCodes: assessment.hardStopIssueCodes,
    reviewIssueCodes: assessment.reviewIssueCodes,
    cautionIssueCodes: assessment.cautionIssueCodes
  };
}

test("runtimeBridge adapter keeps deterministic downstream parity with consumerAssessment", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-runtime-bridge-deterministic",
      matterId: "matter-runtime-bridge-deterministic",
      renterPartyId: "renter-runtime-bridge-deterministic",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });
  const fromConsumer = deriveBr02DownstreamAssessment({
    consumerAssessment: assessment.consumerAssessment
  });
  const fromBridge = deriveBr02DownstreamAssessment({
    runtimeBridge: assessment.runtimeBridge
  });

  assert.equal(assessment.runtimeBridge.kind, "DETERMINISTIC_RESULT");
  assert.deepEqual(snapshotDownstream(fromBridge), snapshotDownstream(fromConsumer));
});

test("runtimeBridge adapter keeps hand-service guarded posture parity with consumerAssessment", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-runtime-bridge-hand-guarded",
      matterId: "matter-runtime-bridge-hand-guarded",
      renterPartyId: "renter-runtime-bridge-hand-guarded",
      serviceMethod: "HAND_DELIVERY",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });
  const fromConsumer = deriveBr02DownstreamAssessment({
    consumerAssessment: assessment.consumerAssessment
  });
  const fromBridge = deriveBr02DownstreamAssessment({
    runtimeBridge: assessment.runtimeBridge
  });

  assert.equal(assessment.runtimeBridge.serviceProof.kind, "GUARDED_WARNING_OR_REVIEW");
  assert.equal(fromBridge.status, "REVIEW_LED_CAUTION");
  assert.deepEqual(snapshotDownstream(fromBridge), snapshotDownstream(fromConsumer));
});

test("runtimeBridge adapter keeps override-sensitive timing review-led and non-deterministic downstream", () => {
  const serviceEvent = createBr02ServiceEventRecord({
    id: "service-runtime-bridge-override",
    matterId: "matter-runtime-bridge-override",
    renterPartyId: "renter-runtime-bridge-override",
    serviceMethod: "REGISTERED_POST",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const evidenceTimingState = buildBr02EvidenceTimingState({
    id: "timing-runtime-bridge-override",
    matterId: "matter-runtime-bridge-override",
    renterPartyId: "renter-runtime-bridge-override",
    serviceEventId: serviceEvent.id,
    hearingSpecificOverride: {
      code: "HEARING-RUNTIME-BRIDGE-OVERRIDE",
      label: "Hearing runtime bridge override",
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
  const adapter = adaptBr02RuntimeBridgeToConsumerShape({
    runtimeBridge: assessment.runtimeBridge
  });
  const fromConsumer = deriveBr02DownstreamAssessment({
    consumerAssessment: assessment.consumerAssessment
  });
  const fromBridge = deriveBr02DownstreamAssessment({
    runtimeBridge: assessment.runtimeBridge
  });

  assert.equal(adapter.segmentKinds.evidenceDeadline, "OVERRIDE_SENSITIVE_RESULT");
  assert.equal(adapter.disposition, "NEEDS_REVIEW");
  assert.equal(fromBridge.status, "NEEDS_REVIEW");
  assert.equal(fromBridge.readinessOutcome, "REVIEW_REQUIRED");
  assert.equal(fromBridge.nextStepReady, false);
  assert.deepEqual(snapshotDownstream(fromBridge), snapshotDownstream(fromConsumer));
});

test("runtimeBridge adapter preserves hard-stop fail-closed posture", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "BELOW_THRESHOLD",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-runtime-bridge-hard-stop",
      matterId: "matter-runtime-bridge-hard-stop",
      renterPartyId: "renter-runtime-bridge-hard-stop",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });
  const fromConsumer = deriveBr02DownstreamAssessment({
    consumerAssessment: assessment.consumerAssessment
  });
  const fromBridge = deriveBr02DownstreamAssessment({
    runtimeBridge: assessment.runtimeBridge
  });

  assert.equal(assessment.runtimeBridge.noEarlyNoticeGate.kind, "HARD_STOP");
  assert.equal(fromBridge.status, "HARD_STOP");
  assert.equal(fromBridge.readinessOutcome, "BLOCKED");
  assert.equal(fromBridge.workflowState, "STOPPED_PENDING_EXTERNAL_INPUT");
  assert.deepEqual(snapshotDownstream(fromBridge), snapshotDownstream(fromConsumer));
});

test("runtimeBridge payment-plan minimum-window pending branch stays conservative downstream", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-runtime-bridge-payment-plan-pending",
      matterId: "matter-runtime-bridge-payment-plan-pending",
      renterPartyId: "renter-runtime-bridge-payment-plan-pending",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-08T10:00:00.000Z"
    }),
    paymentPlan: {
      id: "plan-runtime-bridge-pending",
      matterId: "matter-runtime-bridge-payment-plan-pending",
      status: "ACTIVE",
      agreedAt: "2026-04-01T10:00:00.000Z",
      sourceReferenceIds: []
    }
  });
  const fromConsumer = deriveBr02DownstreamAssessment({
    consumerAssessment: assessment.consumerAssessment
  });
  const fromBridge = deriveBr02DownstreamAssessment({
    runtimeBridge: assessment.runtimeBridge
  });
  const adapter = adaptBr02RuntimeBridgeToConsumerShape({
    runtimeBridge: assessment.runtimeBridge
  });

  assert.equal(assessment.runtimeBridge.paymentPlanTiming.kind, "GUARDED_WARNING_OR_REVIEW");
  assert.equal(adapter.segmentKinds.paymentPlanTiming, "GUARDED_WARNING_OR_REVIEW");
  assert.equal(fromConsumer.status, "NEXT_STEP_READY");
  assert.equal(fromConsumer.readinessOutcome, "READY_FOR_REVIEW");
  assert.equal(fromBridge.status, "REVIEW_LED_CAUTION");
  assert.equal(fromBridge.readinessOutcome, "REVIEW_REQUIRED");
  assert.equal(fromBridge.nextStepReady, false);
});

test("runtimeBridge adapter keeps combined segment posture fail-closed when hard-stop coexists with guarded and override-sensitive segments", () => {
  const serviceEvent = createBr02ServiceEventRecord({
    id: "service-runtime-bridge-combined",
    matterId: "matter-runtime-bridge-combined",
    renterPartyId: "renter-runtime-bridge-combined",
    serviceMethod: "HAND_DELIVERY",
    occurredAt: "2026-04-08T10:00:00.000Z"
  });
  const evidenceTimingState = buildBr02EvidenceTimingState({
    id: "timing-runtime-bridge-combined",
    matterId: "matter-runtime-bridge-combined",
    renterPartyId: "renter-runtime-bridge-combined",
    serviceEventId: serviceEvent.id,
    hearingSpecificOverride: {
      code: "HEARING-RUNTIME-BRIDGE-COMBINED",
      label: "Hearing runtime bridge combined",
      relativeTo: "HEARING_NOTICE",
      offsetDays: 1,
      dayCountKind: "CALENDAR"
    }
  });
  const assessment = assessBr02ServiceEvent({
    thresholdState: "BELOW_THRESHOLD",
    serviceEvent,
    evidenceTimingState,
    paymentPlan: {
      id: "plan-runtime-bridge-combined",
      matterId: "matter-runtime-bridge-combined",
      status: "ACTIVE",
      agreedAt: "2026-04-01T10:00:00.000Z",
      sourceReferenceIds: []
    }
  });
  const adapter = adaptBr02RuntimeBridgeToConsumerShape({
    runtimeBridge: assessment.runtimeBridge
  });
  const downstream = deriveBr02DownstreamAssessment({
    runtimeBridge: assessment.runtimeBridge
  });

  assert.equal(adapter.segmentKinds.noEarlyNoticeGate, "HARD_STOP");
  assert.equal(adapter.segmentKinds.serviceProof, "GUARDED_WARNING_OR_REVIEW");
  assert.equal(adapter.segmentKinds.evidenceDeadline, "OVERRIDE_SENSITIVE_RESULT");
  assert.equal(adapter.segmentKinds.paymentPlanTiming, "GUARDED_WARNING_OR_REVIEW");
  assert.equal(adapter.disposition, "HARD_STOP");
  assert.ok(adapter.issues.some((issue) => issue.code === "NO_EARLY_NOTICE_GATE"));
  assert.ok(adapter.issues.some((issue) => issue.code === "HAND_SERVICE_REVIEW_REQUIRED"));
  assert.ok(adapter.issues.some((issue) => issue.code === "HEARING_OVERRIDE_REFERENCE_REQUIRED"));
  assert.ok(adapter.issues.some((issue) => issue.code === "PAYMENT_PLAN_MINIMUM_WINDOW_PENDING"));
  assert.equal(downstream.status, "HARD_STOP");
  assert.equal(downstream.readinessOutcome, "BLOCKED");
});

test("workflow and output shells can consume runtimeBridge through the adapter seam", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-runtime-bridge-downstream-seam",
      matterId: "matter-runtime-bridge-downstream-seam",
      renterPartyId: "renter-runtime-bridge-downstream-seam",
      serviceMethod: "HAND_DELIVERY",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });
  const consumerGate = deriveBr02WorkflowGate({
    consumerAssessment: assessment.consumerAssessment
  });
  const runtimeBridgeGate = deriveBr02WorkflowGate({
    runtimeBridge: assessment.runtimeBridge
  });
  const prepPackFromBridge = expectPrepPack(generateOutputPackageShell(buildOutputSelectionInput({
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    br02RuntimeBridge: assessment.runtimeBridge
  })));
  const handoffFromBridge = expectHandoffGuidance(generateOutputPackageShell(buildOutputSelectionInput({
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    br02RuntimeBridge: assessment.runtimeBridge
  })));

  assert.deepEqual(runtimeBridgeGate, consumerGate);
  assert.equal(prepPackFromBridge.trustBinding.reviewHandoffState.readiness.outcome, "REVIEW_REQUIRED");
  assert.equal(
    prepPackFromBridge.trustBinding.reviewHandoffState.handoff.posture,
    "GUARDED_REVIEW_REQUIRED"
  );
  assert.equal(handoffFromBridge.trustBinding.reviewHandoffState.readiness.outcome, "REVIEW_REQUIRED");
  assert.equal(
    handoffFromBridge.trustBinding.reviewHandoffState.handoff.posture,
    "GUARDED_REVIEW_REQUIRED"
  );
});
