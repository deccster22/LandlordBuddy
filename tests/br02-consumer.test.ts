import test from "node:test";
import assert from "node:assert/strict";

import {
  assessBr02ConsumerAssessment,
  assessBr02EvidenceDeadline,
  assessBr02NoticeEligibilityTiming,
  assessBr02ServiceEvent,
  assessBr02ServiceProof,
  calculateBr02TerminationDate,
  createBr02ConsentProofRecord,
  buildBr02EvidenceTimingState,
  createBr02ServiceEventRecord,
  lookupBr02ServiceMethodOffset,
  br02EvidenceDeadlineTargets
} from "../src/modules/br02/index.js";

test("BR02 notice eligibility stays hard-stop shaped until the arrears threshold is met", () => {
  const result = assessBr02NoticeEligibilityTiming({
    thresholdState: {
      kind: "BELOW_THRESHOLD",
      isEligible: false,
      reasons: ["Days overdue threshold not yet met."]
    }
  });

  assert.equal(result.canPrepareNotice, false);
  assert.equal(result.disposition, "HARD_STOP");
  assert.ok(result.issues.some((issue) => issue.code === "NO_EARLY_NOTICE_GATE"));
});

test("service-method offsets produce distinct termination-date outcomes", () => {
  const registeredPost = createBr02ServiceEventRecord({
    id: "service-registered",
    matterId: "matter-1",
    renterPartyId: "renter-1",
    serviceMethod: "REGISTERED_POST",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const emailConsentProof = createBr02ConsentProofRecord({
    id: "consent-1",
    renterPartyId: "renter-1",
    scopeVariationKey: "notice-email-v1"
  });
  const email = createBr02ServiceEventRecord({
    id: "service-email",
    matterId: "matter-1",
    renterPartyId: "renter-1",
    serviceMethod: "EMAIL",
    occurredAt: "2026-04-06T10:00:00.000Z",
    consentProofId: emailConsentProof.id
  });
  const handDelivery = createBr02ServiceEventRecord({
    id: "service-hand",
    matterId: "matter-1",
    renterPartyId: "renter-1",
    serviceMethod: "HAND_DELIVERY",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });

  const registeredResult = calculateBr02TerminationDate({ serviceEvent: registeredPost });
  const emailResult = calculateBr02TerminationDate({
    serviceEvent: email,
    consentProofs: [emailConsentProof]
  });
  const handResult = calculateBr02TerminationDate({ serviceEvent: handDelivery });

  assert.equal(lookupBr02ServiceMethodOffset("REGISTERED_POST")?.offsetDays, 2);
  assert.equal(registeredResult.serviceMethodOffset.dayCountKind, "BUSINESS");
  assert.equal(registeredResult.disposition, "NEXT_STEP_READY");
  assert.equal(emailResult.disposition, "NEXT_STEP_READY");
  assert.equal(handResult.disposition, "REVIEW_LED_CAUTION");
  assert.notEqual(registeredResult.terminationDateAt, emailResult.terminationDateAt);
  assert.notEqual(registeredResult.terminationDateAt, handResult.terminationDateAt);
});

test("email service requires consent-proof linkage while the proof object remains reusable by renter and scope variation", () => {
  const consentProof = createBr02ConsentProofRecord({
    id: "consent-2",
    renterPartyId: "renter-2",
    scopeVariationKey: "notice-email-v1"
  });
  const blockedEmail = createBr02ServiceEventRecord({
    id: "service-email-blocked",
    matterId: "matter-2",
    renterPartyId: "renter-2",
    serviceMethod: "EMAIL",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const clearedEmail = createBr02ServiceEventRecord({
    id: "service-email-cleared",
    matterId: "matter-2",
    renterPartyId: "renter-2",
    serviceMethod: "EMAIL",
    occurredAt: "2026-04-06T10:00:00.000Z",
    consentProofId: consentProof.id
  });

  const blockedResult = assessBr02ServiceProof({ serviceEvent: blockedEmail });
  const clearedResult = assessBr02ServiceProof({
    serviceEvent: clearedEmail,
    consentProofs: [consentProof]
  });

  assert.equal(blockedResult.disposition, "HARD_STOP");
  assert.ok(blockedResult.issues.some((issue) => issue.code === "EMAIL_CONSENT_PROOF_REQUIRED"));
  assert.equal(clearedResult.disposition, "NEXT_STEP_READY");
  assert.equal(clearedResult.consentProofLinked, true);
  assert.equal(clearedResult.linkedConsentProofScopeVariationKeys[0], "notice-email-v1");
});

test("hand service stays caution-led instead of becoming a hard stop", () => {
  const result = assessBr02ServiceProof({
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-hand-caution",
      matterId: "matter-3",
      renterPartyId: "renter-3",
      serviceMethod: "HAND_DELIVERY",
      occurredAt: "2026-04-06T10:00:00.000Z"
    })
  });

  assert.equal(result.disposition, "REVIEW_LED_CAUTION");
  assert.equal(result.readyForNextStep, false);
  assert.ok(result.issues.some((issue) => issue.code === "HAND_SERVICE_REVIEW_REQUIRED"));
});

test("evidence deadlines keep the send/share and upload targets separate and let hearing-specific timing control precedence", () => {
  const baseServiceEvent = createBr02ServiceEventRecord({
    id: "service-deadline",
    matterId: "matter-4",
    renterPartyId: "renter-4",
    serviceMethod: "REGISTERED_POST",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const currentTiming = buildBr02EvidenceTimingState({
    id: "timing-current",
    matterId: "matter-4",
    renterPartyId: "renter-4",
    serviceEventId: baseServiceEvent.id
  });
  const overrideTiming = buildBr02EvidenceTimingState({
    id: "timing-override",
    matterId: "matter-4",
    renterPartyId: "renter-4",
    serviceEventId: baseServiceEvent.id,
    hearingSpecificOverride: {
      code: "HEARING-NOTICE-OVERRIDE",
      label: "Hearing notice override",
      relativeTo: "HEARING_NOTICE",
      offsetDays: 1,
      dayCountKind: "CALENDAR"
    }
  });

  const genericResult = assessBr02EvidenceDeadline({
    serviceEvent: baseServiceEvent,
    evidenceTimingState: currentTiming
  });
  const overrideResult = assessBr02EvidenceDeadline({
    serviceEvent: baseServiceEvent,
    evidenceTimingState: overrideTiming,
    hearingNoticeAt: "2026-04-07T10:00:00.000Z"
  });

  assert.equal(br02EvidenceDeadlineTargets.sendShareTargetDays, 7);
  assert.equal(br02EvidenceDeadlineTargets.uploadTargetBusinessDays, 3);
  assert.equal(genericResult.sendShareTargetAt, "2026-04-13T10:00:00.000Z");
  assert.equal(genericResult.uploadTargetAt, "2026-04-09T10:00:00.000Z");
  assert.equal(genericResult.controllingDeadlineSource, "UPLOAD_TARGET");
  assert.equal(overrideResult.controllingDeadlineSource, "HEARING_OVERRIDE");
  assert.equal(overrideResult.disposition, "NEEDS_REVIEW");
  assert.ok(overrideResult.deadlineCandidates.some((candidate) => candidate.code === "HEARING-NOTICE-OVERRIDE"));
});

test("the legacy BR02 service-event assessor wires the consumer bundle into the existing shape", () => {
  const serviceEvent = createBr02ServiceEventRecord({
    id: "service-bundle",
    matterId: "matter-5",
    renterPartyId: "renter-5",
    serviceMethod: "REGISTERED_POST",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const evidenceTimingState = buildBr02EvidenceTimingState({
    id: "timing-bundle",
    matterId: "matter-5",
    renterPartyId: "renter-5",
    serviceEventId: serviceEvent.id
  });
  const result = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent,
    evidenceTimingState
  });

  assert.equal(result.thresholdGateOpen, true);
  assert.equal(result.noticeEligibility.canPrepareNotice, true);
  assert.equal(result.serviceProof.disposition, "NEXT_STEP_READY");
  assert.equal(result.terminationDate.disposition, "NEXT_STEP_READY");
  assert.equal(result.readyForDeterministicDateHandling, true);
  assert.equal(result.consumerAssessment.disposition, "NEXT_STEP_READY");
  assert.ok(result.appliedDateRuleCodes.includes("NO_EARLY_NOTICE_THRESHOLD_GATE"));
});

test("the consumer bundle keeps the BR02 sub-results explicit", () => {
  const serviceEvent = createBr02ServiceEventRecord({
    id: "service-consumer",
    matterId: "matter-6",
    renterPartyId: "renter-6",
    serviceMethod: "EMAIL",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });

  const assessment = assessBr02ConsumerAssessment({
    thresholdState: {
      kind: "THRESHOLD_MET",
      isEligible: true,
      reasons: []
    },
    serviceEvent,
    evidenceTimingState: buildBr02EvidenceTimingState({
      id: "timing-consumer",
      matterId: "matter-6",
      renterPartyId: "renter-6",
      serviceEventId: serviceEvent.id,
      hearingSpecificOverride: {
        code: "HEARING-NOTICE-OVERRIDE",
        label: "Hearing notice override",
        relativeTo: "HEARING_NOTICE",
        offsetDays: 1,
        dayCountKind: "CALENDAR"
      }
    }),
    hearingNoticeAt: "2026-04-07T10:00:00.000Z"
  });

  assert.equal(assessment.thresholdState.kind, "THRESHOLD_MET");
  assert.equal(assessment.noticeEligibility.canPrepareNotice, true);
  assert.equal(assessment.serviceProof.disposition, "HARD_STOP");
  assert.equal(assessment.disposition, "HARD_STOP");
  assert.ok(assessment.evidenceDeadline);
  assert.equal(assessment.evidenceDeadline?.controllingDeadlineSource, "HEARING_OVERRIDE");
});
