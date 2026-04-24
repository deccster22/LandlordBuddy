import test from "node:test";
import assert from "node:assert/strict";

import type { PaymentRecord, RentCharge } from "../src/domain/model.js";
import { calculateArrearsStatusShell } from "../src/modules/arrears/index.js";
import {
  br02PaymentPlanTimingTargets,
  buildBr02EvidenceTimingState,
  createBr02ConsentProofRecord,
  createBr02ServiceEventRecord,
  resolveBr02RuntimeBridge
} from "../src/modules/br02/index.js";

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

const thresholdRule = {
  version: "P4B-BR02-runtime-bridge",
  minimumDaysOverdue: 14,
  minimumOutstandingAmount: { amountMinor: 100000, currency: "AUD" as const }
};

test("day-16 threshold opens the no-early-notice gate while below-threshold stays hard-stop", () => {
  const day16Arrears = calculateArrearsStatusShell({
    charges: [charge()],
    payments: [],
    thresholdRule,
    asAt: "2026-03-26T10:00:00.000Z"
  });
  const day10Arrears = calculateArrearsStatusShell({
    charges: [charge()],
    payments: [payment({ amount: { amountMinor: 5000, currency: "AUD" } })],
    thresholdRule,
    asAt: "2026-03-20T10:00:00.000Z"
  });
  const day16Bridge = resolveBr02RuntimeBridge({
    thresholdState: day16Arrears.thresholdState,
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-day16",
      matterId: "matter-day16",
      renterPartyId: "renter-day16",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-03-26T10:00:00.000Z"
    })
  });
  const day10Bridge = resolveBr02RuntimeBridge({
    thresholdState: day10Arrears.thresholdState,
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-day10",
      matterId: "matter-day10",
      renterPartyId: "renter-day10",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-03-20T10:00:00.000Z"
    })
  });

  assert.equal(day16Arrears.daysInArrears, 16);
  assert.equal(day16Bridge.noEarlyNoticeGate.kind, "DETERMINISTIC_RESULT");
  assert.equal(day16Bridge.noEarlyNoticeGate.result.canPrepareNotice, true);
  assert.equal(day10Bridge.noEarlyNoticeGate.kind, "HARD_STOP");
  assert.ok(
    day10Bridge.noEarlyNoticeGate.result.issues.some(
      (issue) => issue.code === "NO_EARLY_NOTICE_GATE"
    )
  );
});

test("runtime bridge keeps service-method-aware termination timing distinct", () => {
  const emailConsentProof = createBr02ConsentProofRecord({
    id: "consent-runtime-bridge",
    renterPartyId: "renter-service-method",
    scopeVariationKey: "notice-email-v1"
  });
  const registeredPostBridge = resolveBr02RuntimeBridge({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-registered-post",
      matterId: "matter-service-method",
      renterPartyId: "renter-service-method",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });
  const emailBridge = resolveBr02RuntimeBridge({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-email",
      matterId: "matter-service-method",
      renterPartyId: "renter-service-method",
      serviceMethod: "EMAIL",
      occurredAt: "2026-04-06T10:00:00.000Z",
      consentProofId: emailConsentProof.id
    }),
    consentProofs: [emailConsentProof]
  });

  assert.equal(registeredPostBridge.terminationDate.result.serviceMethodOffset.offsetDays, 2);
  assert.equal(registeredPostBridge.terminationDate.result.serviceMethodOffset.dayCountKind, "BUSINESS");
  assert.equal(registeredPostBridge.terminationDate.kind, "DETERMINISTIC_RESULT");
  assert.equal(emailBridge.terminationDate.kind, "DETERMINISTIC_RESULT");
  assert.notEqual(
    registeredPostBridge.terminationDate.result.terminationDateAt,
    emailBridge.terminationDate.result.terminationDateAt
  );
});

test("hearing-notice override stays override-sensitive in runtime evidence-deadline resolution", () => {
  const serviceEvent = createBr02ServiceEventRecord({
    id: "service-hearing-override-runtime",
    matterId: "matter-hearing-override-runtime",
    renterPartyId: "renter-hearing-override-runtime",
    serviceMethod: "REGISTERED_POST",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const evidenceTimingState = buildBr02EvidenceTimingState({
    id: "timing-hearing-override-runtime",
    matterId: "matter-hearing-override-runtime",
    renterPartyId: "renter-hearing-override-runtime",
    serviceEventId: serviceEvent.id,
    hearingSpecificOverride: {
      code: "HEARING-NOTICE-OVERRIDE",
      label: "Hearing notice override",
      relativeTo: "HEARING_NOTICE",
      offsetDays: 1,
      dayCountKind: "CALENDAR"
    }
  });
  const bridge = resolveBr02RuntimeBridge({
    thresholdState: "THRESHOLD_MET",
    serviceEvent,
    evidenceTimingState,
    hearingNoticeAt: "2026-04-07T10:00:00.000Z"
  });

  assert.equal(bridge.evidenceDeadline?.kind, "OVERRIDE_SENSITIVE_RESULT");
  assert.equal(bridge.evidenceDeadline?.result.controllingDeadlineSource, "HEARING_OVERRIDE");
  assert.ok(
    bridge.evidenceDeadline?.result.deadlineCandidates.some(
      (candidate) => candidate.code === "HEARING-NOTICE-OVERRIDE"
    )
  );
});

test("email service requires consent proof in runtime bridge service-proof resolution", () => {
  const blockedBridge = resolveBr02RuntimeBridge({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-email-blocked-runtime",
      matterId: "matter-email-runtime",
      renterPartyId: "renter-email-runtime",
      serviceMethod: "EMAIL",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });
  const consentProof = createBr02ConsentProofRecord({
    id: "consent-email-runtime",
    renterPartyId: "renter-email-runtime",
    scopeVariationKey: "notice-email-v2"
  });
  const clearedBridge = resolveBr02RuntimeBridge({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-email-cleared-runtime",
      matterId: "matter-email-runtime",
      renterPartyId: "renter-email-runtime",
      serviceMethod: "EMAIL",
      occurredAt: "2026-04-06T10:00:00.000Z",
      consentProofId: consentProof.id
    }),
    consentProofs: [consentProof]
  });

  assert.equal(blockedBridge.serviceProof.kind, "HARD_STOP");
  assert.ok(
    blockedBridge.serviceProof.result.issues.some(
      (issue) => issue.code === "EMAIL_CONSENT_PROOF_REQUIRED"
    )
  );
  assert.equal(clearedBridge.serviceProof.kind, "DETERMINISTIC_RESULT");
  assert.equal(clearedBridge.serviceProof.result.consentProofLinked, true);
});

test("payment-plan timing branch resolves the >=7-business-day path without flattening guarded pre-window states", () => {
  const branchMetBridge = resolveBr02RuntimeBridge({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-payment-plan-met",
      matterId: "matter-payment-plan",
      renterPartyId: "renter-payment-plan",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-10T10:00:00.000Z"
    }),
    paymentPlan: {
      id: "plan-1",
      matterId: "matter-payment-plan",
      status: "ACTIVE",
      agreedAt: "2026-04-01T10:00:00.000Z",
      sourceReferenceIds: []
    }
  });
  const guardedPreWindowBridge = resolveBr02RuntimeBridge({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-payment-plan-pending",
      matterId: "matter-payment-plan",
      renterPartyId: "renter-payment-plan",
      serviceMethod: "REGISTERED_POST",
      occurredAt: "2026-04-08T10:00:00.000Z"
    }),
    paymentPlan: {
      id: "plan-2",
      matterId: "matter-payment-plan",
      status: "ACTIVE",
      agreedAt: "2026-04-01T10:00:00.000Z",
      sourceReferenceIds: []
    }
  });

  assert.equal(br02PaymentPlanTimingTargets.minimumBusinessDays, 7);
  assert.equal(branchMetBridge.paymentPlanTiming.kind, "DETERMINISTIC_RESULT");
  assert.equal(
    branchMetBridge.paymentPlanTiming.result.branchCode,
    "PAYMENT_PLAN_MINIMUM_WINDOW_MET"
  );
  assert.ok((branchMetBridge.paymentPlanTiming.result.businessDaysElapsed ?? 0) >= 7);
  assert.equal(guardedPreWindowBridge.paymentPlanTiming.kind, "GUARDED_WARNING_OR_REVIEW");
  assert.equal(
    guardedPreWindowBridge.paymentPlanTiming.result.branchCode,
    "PAYMENT_PLAN_MINIMUM_WINDOW_PENDING"
  );
});

test("runtime bridge keeps unresolved proof/timing seams visibly guarded instead of silently defaulting", () => {
  const serviceEvent = createBr02ServiceEventRecord({
    id: "service-guarded-runtime",
    matterId: "matter-guarded-runtime",
    renterPartyId: "renter-guarded-runtime",
    serviceMethod: "HAND_DELIVERY",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const evidenceTimingState = buildBr02EvidenceTimingState({
    id: "timing-guarded-runtime",
    matterId: "matter-guarded-runtime",
    renterPartyId: "renter-guarded-runtime",
    serviceEventId: serviceEvent.id,
    hearingSpecificOverride: {
      code: "HEARING-NOTICE-OVERRIDE-GUARDED",
      label: "Hearing notice override",
      relativeTo: "HEARING_NOTICE",
      offsetDays: 2,
      dayCountKind: "CALENDAR"
    }
  });
  const bridge = resolveBr02RuntimeBridge({
    thresholdState: "THRESHOLD_MET",
    serviceEvent,
    evidenceTimingState
  });

  assert.equal(bridge.serviceProof.kind, "GUARDED_WARNING_OR_REVIEW");
  assert.ok(
    bridge.serviceProof.result.issues.some(
      (issue) => issue.code === "HAND_SERVICE_REVIEW_REQUIRED"
    )
  );
  assert.equal(bridge.evidenceDeadline?.kind, "OVERRIDE_SENSITIVE_RESULT");
  assert.ok(
    bridge.evidenceDeadline?.result.issues.some((issue) => (
      issue.code === "HEARING_OVERRIDE_REFERENCE_REQUIRED"
      && issue.posture === "GUARDED"
    ))
  );
});
