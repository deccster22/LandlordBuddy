import test from "node:test";
import assert from "node:assert/strict";

import {
  assessBr02ServiceEvent,
  br02QaInventoryHooks,
  createBr02AuditEvent,
  createBr02ConsentProofRecord,
  createBr02FreshnessSnapshot,
  createBr02ServiceEventRecord,
  buildBr02EvidenceTimingState,
  lookupBr02FreshnessMonitor,
  lookupBr02ServiceMethod
} from "../src/modules/br02/index.js";

test("no-early-notice gate stays hard-stop shaped until threshold is met", () => {
  const serviceEvent = createBr02ServiceEventRecord({
    id: "service-1",
    matterId: "matter-1",
    renterPartyId: "renter-1",
    serviceMethod: "REGISTERED_POST"
  });

  const result = assessBr02ServiceEvent({
    thresholdState: "BELOW_THRESHOLD",
    serviceEvent
  });

  assert.equal(result.thresholdGateOpen, false);
  assert.equal(result.consumerAssessment.readyForNextStep, false);
  assert.ok(result.issues.some((issue) => (
    issue.code === "NO_EARLY_NOTICE_GATE" && issue.severity === "hard-stop"
  )));
});

test("service method registry keeps registered post, email, and hand delivery distinct", () => {
  const registeredPost = lookupBr02ServiceMethod("REGISTERED_POST");
  const email = lookupBr02ServiceMethod("EMAIL");
  const handDelivery = lookupBr02ServiceMethod("HAND_DELIVERY");

  assert.equal(registeredPost?.preferredDeterministicPath, true);
  assert.equal(registeredPost?.channel, "POSTAL");
  assert.equal(email?.requiresConsentProof, true);
  assert.equal(email?.channel, "DIGITAL");
  assert.equal(handDelivery?.posture, "GUARDED");
  assert.ok(handDelivery?.guardedInsertionPoint);
  assert.notDeepEqual(registeredPost?.dateRuleCodes, email?.dateRuleCodes);
});

test("email service requires linked consent proof and consent proof stays reusable per scope variation", () => {
  const serviceEvent = createBr02ServiceEventRecord({
    id: "service-2",
    matterId: "matter-1",
    renterPartyId: "renter-1",
    serviceMethod: "EMAIL"
  });
  const blockedResult = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent
  });
  const consentProof = createBr02ConsentProofRecord({
    id: "consent-1",
    renterPartyId: "renter-1",
    scopeVariationKey: "notice-email-v1"
  });
  const clearedResult = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-3",
      matterId: "matter-1",
      renterPartyId: "renter-1",
      serviceMethod: "EMAIL",
      consentProofId: consentProof.id
    }),
    consentProofs: [consentProof]
  });

  assert.equal(consentProof.scopeVariationKey, "notice-email-v1");
  assert.equal(consentProof.scope, "EMAIL_SERVICE");
  assert.ok(blockedResult.issues.some((issue) => issue.code === "EMAIL_CONSENT_PROOF_REQUIRED"));
  assert.ok(!clearedResult.issues.some((issue) => issue.code === "EMAIL_CONSENT_PROOF_REQUIRED"));
  assert.equal(clearedResult.consumerAssessment.serviceProof.readyForNextStep, true);
});

test("registered post stays the preferred deterministic postal path", () => {
  const registeredResult = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-4",
      matterId: "matter-2",
      renterPartyId: "renter-2",
      serviceMethod: "REGISTERED_POST"
    })
  });
  const ordinaryResult = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-5",
      matterId: "matter-2",
      renterPartyId: "renter-2",
      serviceMethod: "ORDINARY_POST"
    })
  });

  assert.equal(registeredResult.preferredDeterministicPath, "REGISTERED_POST");
  assert.ok(!registeredResult.issues.some((issue) => issue.code === "REGISTERED_POST_PREFERRED_PATH"));
  assert.equal(ordinaryResult.preferredDeterministicPath, "REGISTERED_POST");
  assert.ok(ordinaryResult.issues.some((issue) => (
    issue.code === "REGISTERED_POST_PREFERRED_PATH" && issue.severity === "warning"
  )));
});

test("hand service remains guarded and never auto-sufficient", () => {
  const result = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-6",
      matterId: "matter-3",
      renterPartyId: "renter-3",
      serviceMethod: "HAND_DELIVERY"
    })
  });

  const issue = result.issues.find((candidate) => candidate.code === "HAND_SERVICE_REVIEW_REQUIRED");

  assert.equal(result.consumerAssessment.readyForNextStep, false);
  assert.equal(issue?.severity, "slowdown");
  assert.ok(issue?.guardedInsertionPoint);
});

test("evidence timing preserves dual-step plus override without collapsing into universal deadline truth", () => {
  const baseState = buildBr02EvidenceTimingState({
    id: "timing-1",
    matterId: "matter-4",
    renterPartyId: "renter-4",
    serviceEventId: "service-7"
  });
  const overrideState = buildBr02EvidenceTimingState({
    id: "timing-2",
    matterId: "matter-4",
    renterPartyId: "renter-4",
    serviceEventId: "service-7",
    hearingSpecificOverride: {
      code: "HEARING-LISTING-OVERRIDE",
      label: "Listing instruction override",
      offsetDays: 3,
      dayCountKind: "BUSINESS"
    }
  });
  const prepInstruction = baseState.instructions.find((instruction) => (
    instruction.code === "EVIDENCE_PREP_REQUIRED_7_DAY_STEP"
  ));

  assert.equal(baseState.instructions.length, 2);
  assert.equal(baseState.precedence.effectiveInstructionCode, "EVIDENCE_PREP_REQUIRED_7_DAY_STEP");
  assert.equal(prepInstruction?.requiredPrepStep, true);
  assert.equal(prepInstruction?.universalDeadline, false);
  assert.equal(overrideState.instructions.length, 3);
  assert.equal(overrideState.precedence.effectiveInstructionCode, "HEARING-LISTING-OVERRIDE");
  assert.match(overrideState.precedence.reason, /outranks generic timing surfaces/i);
});

test("freshness registry keeps stale timing surfaces non-authoritative", () => {
  const monitor = lookupBr02FreshnessMonitor("GENERIC_EVIDENCE_TIMING_MONITOR");
  const snapshot = createBr02FreshnessSnapshot({
    monitorCode: "GENERIC_EVIDENCE_TIMING_MONITOR",
    stateCode: "STALE_SLOWDOWN"
  });
  const staleState = buildBr02EvidenceTimingState({
    id: "timing-3",
    matterId: "matter-5",
    renterPartyId: "renter-5",
    staleStateCode: "STALE_SLOWDOWN"
  });
  const serviceResult = assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent: createBr02ServiceEventRecord({
      id: "service-8",
      matterId: "matter-5",
      renterPartyId: "renter-5",
      serviceMethod: "REGISTERED_POST"
    }),
    freshnessSnapshots: [snapshot]
  });

  assert.equal(monitor?.neverUniversalDeadlineTruth, true);
  assert.equal(snapshot.authority, "NON_AUTHORITATIVE");
  assert.equal(staleState.status, "STALE");
  assert.match(staleState.notes.join(" "), /reviewable instead of universal/i);
  assert.ok(serviceResult.issues.some((issue) => issue.code === "STALE_GENERIC_TIMING_SURFACE"));
});

test("br02 audit event shape and qa hooks preserve linkage without implying official acceptance", () => {
  const auditEvent = createBr02AuditEvent({
    id: "audit-1",
    at: "2026-04-05T10:00:00.000Z",
    actor: "system",
    actorType: "SYSTEM",
    matterId: "matter-6",
    controlArea: "EVIDENCE_TIMING",
    action: "PRECEDENCE_APPLIED",
    severity: "WARNING",
    outcome: "REVIEW_REQUIRED",
    subjectType: "EVIDENCE_TIMING",
    subjectId: "timing-4",
    deterministic: true,
    ruleCodes: ["EVIDENCE_PREP_REQUIRED_7_DAY_STEP"],
    staleStateCode: "STALE_SLOWDOWN",
    metadata: {
      officialAcceptance: false
    }
  });
  const hook = br02QaInventoryHooks.find((candidate) => candidate.id === "BR02-EVIDENCE-TIMING");

  assert.equal(auditEvent.event, "EVIDENCE_TIMING:PRECEDENCE_APPLIED");
  assert.deepEqual(auditEvent.ruleCodes, ["EVIDENCE_PREP_REQUIRED_7_DAY_STEP"]);
  assert.equal(auditEvent.metadata?.officialAcceptance, false);
  assert.deepEqual(auditEvent.sourceReferenceIds, []);
  assert.ok(hook);
  assert.ok(hook?.testFiles.includes("tests/br02-registry-scaffold.test.ts"));
});
