import test from "node:test";
import assert from "node:assert/strict";

import {
  GUARDED_INSERTION_POINTS,
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState,
  createPrivacyLifecycleHooks,
  officialHandoffStates,
  outputModes,
  validateMatterSeparation,
  type Matter
} from "../src/domain/model.js";
import { arrearsHeroWorkflow, workflowGuardrails } from "../src/workflow/arrearsHeroWorkflow.js";

test("matter separates forum path, output mode, official handoff state, and privacy hooks", () => {
  const matter: Matter = {
    id: "matter-1",
    tenancyId: "tenancy-1",
    propertyId: "property-1",
    status: "NOTICE_PREPARATION",
    workflowState: "NOTICE_DRAFTING_READY",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PRINTABLE_OUTPUT"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    arrearsStatus: {
      asAt: "2026-04-02T10:00:00Z",
      outstandingAmount: { amountMinor: 125000, currency: "AUD" },
      overdueChargeIds: ["charge-1"],
      unappliedPaymentIds: [],
      calculationConfidence: "DETERMINISTIC",
      warnings: []
    },
    priorNoticeIds: [],
    evidenceItemIds: [],
    paymentPlanIds: [],
    referralFlagIds: [],
    routingDecisionIds: [],
    auditLogIds: [],
    privacyHooks: createPrivacyLifecycleHooks(),
    sourceReferenceIds: []
  };

  assert.deepEqual(validateMatterSeparation(matter), []);
  assert.ok(outputModes.includes(matter.outputMode.mode));
  assert.ok(officialHandoffStates.includes(matter.officialHandoff.stage));
  assert.equal(matter.privacyHooks.lifecycleState, "NORMAL_LIFECYCLE");
});

test("workflow stops at notice readiness and keeps guarded doctrines visible", () => {
  const states = arrearsHeroWorkflow.map((node) => node.state);

  assert.ok(states.includes("NOTICE_READY_FOR_REVIEW"));
  assert.ok(!states.includes("FILED" as never));
  assert.ok(Object.keys(GUARDED_INSERTION_POINTS).length >= 7);
  assert.ok(workflowGuardrails.some((guardrail) => guardrail.code === "MIXED_CLAIM_GUARDED"));
});
