import test from "node:test";
import assert from "node:assert/strict";

import {
  assessBr02ServiceEvent,
  createBr02ServiceEventRecord,
  deriveBr02DownstreamAssessment,
  deriveBr02RuntimeBridgeThreadingForAssessment
} from "../src/modules/br02/index.js";

test("runtimeBridge threading decision includes bridge input by default when payment-plan posture is not conservative", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-threading-safe-default",
      matterId: "matter-threading-safe-default",
      renterPartyId: "renter-threading-safe-default",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });

  assert.equal(assessment.runtimeBridgeThreading.paymentPlanConservativeSignoffRequired, false);
  assert.equal(assessment.runtimeBridgeThreading.runtimeBridgeThreaded, true);
  assert.ok(assessment.runtimeBridgeThreading.downstreamInputs.br02RuntimeBridge);
});

test("runtimeBridge threading decision withholds bridge by default when payment-plan conservative posture is present", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-threading-payment-plan-pending-default",
      matterId: "matter-threading-payment-plan-pending-default",
      renterPartyId: "renter-threading-payment-plan-pending-default",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-08T10:00:00.000Z"
    }),
    paymentPlan: {
      id: "plan-threading-payment-plan-pending-default",
      matterId: "matter-threading-payment-plan-pending-default",
      status: "ACTIVE",
      agreedAt: "2026-04-01T10:00:00.000Z",
      sourceReferenceIds: []
    }
  });

  assert.equal(assessment.runtimeBridge.paymentPlanTiming.kind, "GUARDED_WARNING_OR_REVIEW");
  assert.equal(assessment.runtimeBridgeThreading.paymentPlanConservativeSignoffRequired, true);
  assert.equal(assessment.runtimeBridgeThreading.paymentPlanConservativeSignoffAccepted, false);
  assert.equal(assessment.runtimeBridgeThreading.runtimeBridgeThreaded, false);
  assert.equal(
    assessment.runtimeBridgeThreading.downstreamInputs.br02RuntimeBridge,
    undefined
  );
});

test("explicit payment-plan sign-off can thread runtimeBridge while preserving consumerAssessment precedence downstream", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-threading-payment-plan-pending-signed-off",
      matterId: "matter-threading-payment-plan-pending-signed-off",
      renterPartyId: "renter-threading-payment-plan-pending-signed-off",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-08T10:00:00.000Z"
    }),
    paymentPlan: {
      id: "plan-threading-payment-plan-pending-signed-off",
      matterId: "matter-threading-payment-plan-pending-signed-off",
      status: "ACTIVE",
      agreedAt: "2026-04-01T10:00:00.000Z",
      sourceReferenceIds: []
    }
  });
  const signedOffThreading = deriveBr02RuntimeBridgeThreadingForAssessment({
    assessment,
    paymentPlanConservativeSignoffAccepted: true
  });
  const downstreamWithSignedOffThreading = deriveBr02DownstreamAssessment({
    consumerAssessment: signedOffThreading.downstreamInputs.br02ConsumerAssessment,
    ...(signedOffThreading.downstreamInputs.br02RuntimeBridge
      ? { runtimeBridge: signedOffThreading.downstreamInputs.br02RuntimeBridge }
      : {})
  });

  assert.equal(signedOffThreading.paymentPlanConservativeSignoffRequired, true);
  assert.equal(signedOffThreading.paymentPlanConservativeSignoffAccepted, true);
  assert.equal(signedOffThreading.runtimeBridgeThreaded, true);
  assert.ok(signedOffThreading.downstreamInputs.br02RuntimeBridge);
  assert.equal(downstreamWithSignedOffThreading.status, "NEXT_STEP_READY");
  assert.equal(downstreamWithSignedOffThreading.readinessOutcome, "READY_FOR_REVIEW");
});

test("bridge-only payment-plan conservative posture remains non-default and explicitly review-led", () => {
  const assessment = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-threading-payment-plan-pending-bridge-only",
      matterId: "matter-threading-payment-plan-pending-bridge-only",
      renterPartyId: "renter-threading-payment-plan-pending-bridge-only",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-08T10:00:00.000Z"
    }),
    paymentPlan: {
      id: "plan-threading-payment-plan-pending-bridge-only",
      matterId: "matter-threading-payment-plan-pending-bridge-only",
      status: "ACTIVE",
      agreedAt: "2026-04-01T10:00:00.000Z",
      sourceReferenceIds: []
    }
  });
  const bridgeOnlyDownstream = deriveBr02DownstreamAssessment({
    runtimeBridge: assessment.runtimeBridge
  });
  const defaultThreadedDownstream = deriveBr02DownstreamAssessment({
    consumerAssessment: assessment.runtimeBridgeThreading.downstreamInputs.br02ConsumerAssessment
  });

  assert.equal(bridgeOnlyDownstream.status, "REVIEW_LED_CAUTION");
  assert.equal(bridgeOnlyDownstream.readinessOutcome, "REVIEW_REQUIRED");
  assert.equal(defaultThreadedDownstream.status, "NEXT_STEP_READY");
  assert.equal(defaultThreadedDownstream.readinessOutcome, "READY_FOR_REVIEW");
});
