import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBr04LifecycleClassControlRegistry,
  createBr04HoldCommand,
  createBr04LifecycleRuntimeRecord,
  createHoldReason,
  createInMemoryBr04LifecycleAuditHook,
  createPreservationScope,
  createPrivacyAuditEvent,
  createScopedHoldFlag,
  executeBr04HoldCommand,
  planBr04LifecycleAction,
  resolveBr04LifecycleClassControl
} from "../src/modules/br04/index.js";

test("class-based lifecycle controls and runtime branching stay explicit per data class", () => {
  const controls = buildBr04LifecycleClassControlRegistry();
  const matterControl = resolveBr04LifecycleClassControl({
    appliesTo: "MATTER",
    dataClassId: "BR04-DATA-CLASS-MATTER-PRIMARY"
  });
  const evidenceControl = resolveBr04LifecycleClassControl({
    appliesTo: "EVIDENCE_ITEM",
    dataClassId: "BR04-DATA-CLASS-EVIDENCE-WORKING"
  });
  const holdScope = createPreservationScope({
    id: "scope-runtime-1",
    matterId: "matter-runtime-1",
    subjectType: "EVIDENCE_ITEM",
    subjectId: "evidence-runtime-1",
    scopeLabel: "Evidence-only hold scope"
  });
  const evidenceHold = createScopedHoldFlag({
    id: "hold-runtime-1",
    matterId: "matter-runtime-1",
    scope: holdScope,
    reason: createHoldReason({
      code: "HOLD_REVIEW",
      label: "Hold review",
      summary: "Scoped hold review placeholder."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-12T09:00:00.000Z"
  });
  const matterRuntime = createBr04LifecycleRuntimeRecord({
    matterId: "matter-runtime-1",
    subjectType: "MATTER",
    subjectId: "matter-runtime-1",
    dataClassId: "BR04-DATA-CLASS-MATTER-PRIMARY",
    holdFlags: [evidenceHold]
  });
  const evidenceRuntime = createBr04LifecycleRuntimeRecord({
    matterId: "matter-runtime-1",
    subjectType: "EVIDENCE_ITEM",
    subjectId: "evidence-runtime-1",
    dataClassId: "BR04-DATA-CLASS-EVIDENCE-WORKING",
    holdFlags: [evidenceHold]
  });

  assert.ok(controls.length >= 4);
  assert.equal(matterControl.policyKey, "MATTER_PRIMARY_RECORD");
  assert.equal(evidenceControl.policyKey, "EVIDENCE_WORKING_RECORD");
  assert.equal(matterControl.durationModelKey, "CONFIGURE_LATER");
  assert.equal(evidenceControl.noUniversalLifecycleRule, true);
  assert.equal(matterRuntime.lifecycleState, "NORMAL_LIFECYCLE");
  assert.equal(evidenceRuntime.lifecycleState, "HOLD_AFFECTED");
  assert.equal(evidenceRuntime.readyForDeletionReview, false);
});

test("hold-aware planning suppresses deletion route while scoped hold remains active", () => {
  const holdScope = createPreservationScope({
    id: "scope-runtime-2",
    matterId: "matter-runtime-2",
    subjectType: "EVIDENCE_ITEM",
    subjectId: "evidence-runtime-2",
    scopeLabel: "Evidence-only hold scope"
  });
  const evidenceHold = createScopedHoldFlag({
    id: "hold-runtime-2",
    matterId: "matter-runtime-2",
    scope: holdScope,
    reason: createHoldReason({
      code: "HOLD_REVIEW",
      label: "Hold review",
      summary: "Scoped hold review placeholder."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-12T10:00:00.000Z"
  });
  const plan = planBr04LifecycleAction({
    id: "plan-runtime-2",
    matterId: "matter-runtime-2",
    subjectType: "EVIDENCE_ITEM",
    subjectId: "evidence-runtime-2",
    dataClassId: "BR04-DATA-CLASS-EVIDENCE-WORKING",
    requestedAction: "REQUEST_DELETION",
    requestedAt: "2026-04-12T10:05:00.000Z",
    requestedByRole: "PRIVACY_REVIEWER",
    holdFlags: [evidenceHold]
  });

  assert.equal(plan.route, "DEIDENTIFICATION_ACTION");
  assert.equal(plan.suppressedByHold, true);
  assert.equal(plan.deletionRequest, undefined);
  assert.equal(plan.deidentificationAction?.blockedByHoldFlagIds[0], evidenceHold.id);
  assert.equal(plan.auditEvent.outcome, "REVIEW_REQUIRED");
});

test("release-controlled hold transitions unblock deletion planning only after confirmation", () => {
  const holdScope = createPreservationScope({
    id: "scope-runtime-3",
    matterId: "matter-runtime-3",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-runtime-3",
    scopeLabel: "Output package hold scope"
  });
  const hold = createScopedHoldFlag({
    id: "hold-runtime-3",
    matterId: "matter-runtime-3",
    scope: holdScope,
    reason: createHoldReason({
      code: "HOLD_REVIEW",
      label: "Hold review",
      summary: "Scoped hold review placeholder."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-12T11:00:00.000Z"
  });
  const releaseRequest = createBr04HoldCommand({
    id: "hold-command-runtime-3a",
    matterId: "matter-runtime-3",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-runtime-3",
    dataClassId: "BR04-DATA-CLASS-OUTPUT-PACK",
    command: "REQUEST_HOLD_RELEASE",
    requestedAt: "2026-04-12T11:05:00.000Z",
    requestedByRole: "PRIVACY_REVIEWER",
    holdFlagId: hold.id
  });
  const releaseRequestResult = executeBr04HoldCommand({
    command: releaseRequest,
    holdFlag: hold
  });
  const releaseConfirm = createBr04HoldCommand({
    id: "hold-command-runtime-3b",
    matterId: "matter-runtime-3",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-runtime-3",
    dataClassId: "BR04-DATA-CLASS-OUTPUT-PACK",
    command: "CONFIRM_HOLD_RELEASE",
    requestedAt: "2026-04-12T11:10:00.000Z",
    requestedByRole: "PRIVACY_REVIEWER",
    holdFlagId: hold.id,
    releaseApprovedByRole: "PRIVACY_REVIEWER"
  });
  const releaseConfirmResult = executeBr04HoldCommand({
    command: releaseConfirm,
    holdFlag: releaseRequestResult.holdFlag
  });
  const postReleasePlan = planBr04LifecycleAction({
    id: "plan-runtime-3",
    matterId: "matter-runtime-3",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-runtime-3",
    dataClassId: "BR04-DATA-CLASS-OUTPUT-PACK",
    requestedAction: "REQUEST_DELETION",
    requestedAt: "2026-04-12T11:15:00.000Z",
    requestedByRole: "PRIVACY_REVIEWER",
    holdFlags: releaseRequestResult.holdFlag ? [releaseRequestResult.holdFlag] : [],
    releasedHoldFlagIds: releaseConfirmResult.releasedHoldFlagIds
  });

  assert.equal(releaseRequestResult.holdFlag?.status, "RELEASE_REVIEW_REQUIRED");
  assert.equal(releaseRequestResult.nextLifecycleState, "HOLD_AFFECTED");
  assert.deepEqual(releaseRequestResult.releasedHoldFlagIds, []);
  assert.equal(releaseConfirmResult.nextLifecycleState, "REVIEW_NEEDED");
  assert.deepEqual(releaseConfirmResult.releasedHoldFlagIds, [hold.id]);
  assert.equal(postReleasePlan.route, "DELETION_REQUEST");
  assert.equal(postReleasePlan.suppressedByHold, false);
});

test("deletion and de-identification routes remain explicitly distinct", () => {
  const deletionPlan = planBr04LifecycleAction({
    id: "plan-runtime-4a",
    matterId: "matter-runtime-4",
    subjectType: "MATTER",
    subjectId: "matter-runtime-4",
    dataClassId: "BR04-DATA-CLASS-MATTER-PRIMARY",
    requestedAction: "REQUEST_DELETION",
    requestedAt: "2026-04-12T12:00:00.000Z",
    requestedByRole: "PRIVACY_REVIEWER"
  });
  const deidentificationPlan = planBr04LifecycleAction({
    id: "plan-runtime-4b",
    matterId: "matter-runtime-4",
    subjectType: "MATTER",
    subjectId: "matter-runtime-4",
    dataClassId: "BR04-DATA-CLASS-MATTER-PRIMARY",
    requestedAction: "REQUEST_DEIDENTIFICATION",
    requestedAt: "2026-04-12T12:05:00.000Z",
    requestedByRole: "PRIVACY_REVIEWER"
  });

  assert.equal(deletionPlan.route, "DELETION_REQUEST");
  assert.ok(deletionPlan.deletionRequest);
  assert.equal(deletionPlan.deidentificationAction, undefined);
  assert.equal(deidentificationPlan.route, "DEIDENTIFICATION_ACTION");
  assert.ok(deidentificationPlan.deidentificationAction);
  assert.equal(deidentificationPlan.deletionRequest, undefined);
});

test("audit hook emission preserves lifecycle audit event shape and core invariants", () => {
  const auditHook = createInMemoryBr04LifecycleAuditHook();
  const holdScope = createPreservationScope({
    id: "scope-runtime-5",
    matterId: "matter-runtime-5",
    subjectType: "NOTICE_DRAFT",
    subjectId: "notice-runtime-5",
    scopeLabel: "Notice draft hold scope"
  });
  const holdReason = createHoldReason({
    code: "HOLD_REVIEW",
    label: "Hold review",
    summary: "Scoped hold review placeholder."
  });
  const holdCommand = createBr04HoldCommand({
    id: "hold-command-runtime-5",
    matterId: "matter-runtime-5",
    subjectType: "NOTICE_DRAFT",
    subjectId: "notice-runtime-5",
    dataClassId: "BR04-DATA-CLASS-NOTICE-DRAFT",
    command: "APPLY_HOLD",
    requestedAt: "2026-04-12T13:00:00.000Z",
    requestedByRole: "PRIVACY_REVIEWER"
  });

  executeBr04HoldCommand({
    command: holdCommand,
    scope: holdScope,
    reason: holdReason,
    auditHook
  });
  planBr04LifecycleAction({
    id: "plan-runtime-5",
    matterId: "matter-runtime-5",
    subjectType: "NOTICE_DRAFT",
    subjectId: "notice-runtime-5",
    dataClassId: "BR04-DATA-CLASS-NOTICE-DRAFT",
    requestedAction: "REQUEST_DEIDENTIFICATION",
    requestedAt: "2026-04-12T13:05:00.000Z",
    requestedByRole: "PRIVACY_REVIEWER",
    auditHook
  });

  const emittedEvents = auditHook.list();
  const baselineEvent = createPrivacyAuditEvent({
    id: "privacy-audit-baseline",
    at: "2026-04-12T13:10:00.000Z",
    actor: "privacy-reviewer",
    actorType: "OPERATOR",
    matterId: "matter-runtime-5",
    controlArea: "LIFECYCLE",
    action: "BASELINE",
    severity: "INFO",
    outcome: "RECORDED",
    subjectType: "DEIDENTIFICATION_ACTION",
    subjectId: "subject-1",
    lifecycleState: "REVIEW_NEEDED",
    deterministic: false,
    accessRole: "PRIVACY_REVIEWER",
    accessScopeId: "BR04-SCOPE-NOTICE-REVIEW",
    detail: "Baseline audit detail shape",
    metadata: { baseline: true }
  });

  assert.equal(emittedEvents.length, 2);
  assert.equal(emittedEvents[0]?.event, "HOLD:APPLY_HOLD");
  assert.equal(emittedEvents[1]?.event, "LIFECYCLE:DEIDENTIFICATION_REQUEST_PLANNED");
  assert.ok((emittedEvents[1]?.policyKeys.length ?? 0) > 0);
  assert.ok(Array.isArray(emittedEvents[1]?.holdFlagIds));
  assert.deepEqual(
    Object.keys(emittedEvents[1] ?? {}).sort(),
    Object.keys(baselineEvent).sort()
  );
});
