import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState
} from "../src/domain/model.js";
import {
  createHoldReason,
  createPreservationScope,
  createPrivacyAuditEvent,
  createScopedHoldFlag,
  loadBr04PolicySource
} from "../src/modules/br04/index.js";
import type { CreateOutputPackageRecordInput } from "../src/modules/output/index.js";
import {
  orchestrateOutputPackageLifecycle,
  replayOutputPackageLifecycleOrchestration
} from "../src/app/outputPackageLifecycleOrchestration.js";

function buildOutputPackageInput(
  overrides: Partial<CreateOutputPackageRecordInput> = {}
): CreateOutputPackageRecordInput {
  return {
    id: "output-lifecycle-1",
    matterId: "matter-lifecycle-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    ...overrides
  };
}

test("output-package lifecycle orchestration plans a normal class-scoped deletion route and replays it", () => {
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput(),
    lifecycleRequest: {
      id: "output-lifecycle-request-1",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-13T09:00:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const replayPlan = replayOutputPackageLifecycleOrchestration({
    orchestrationRecord: orchestration
  });

  assert.equal(orchestration.orchestrationVersion, "P4B-CX-BR04-07");
  assert.equal(orchestration.outputPackage.id, "output-lifecycle-1");
  assert.equal(orchestration.runtimeRecord.subjectType, "OUTPUT_PACKAGE");
  assert.equal(orchestration.runtimeRecord.policyKey, "OUTPUT_PACKAGE_RECORD");
  assert.equal(orchestration.lifecyclePlan.route, "DELETION_REQUEST");
  assert.equal(orchestration.lifecyclePlan.suppressedByHold, false);
  assert.equal(replayPlan.route, orchestration.lifecyclePlan.route);
  assert.equal(replayPlan.suppressedByHold, orchestration.lifecyclePlan.suppressedByHold);
});

test("active scoped hold suppresses output-package deletion route into de-identification planning", () => {
  const holdScope = createPreservationScope({
    id: "output-lifecycle-hold-scope-2",
    matterId: "matter-lifecycle-2",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-lifecycle-2",
    scopeLabel: "Output package scope"
  });
  const hold = createScopedHoldFlag({
    id: "output-lifecycle-hold-2",
    matterId: "matter-lifecycle-2",
    scope: holdScope,
    reason: createHoldReason({
      code: "OUTPUT_PACKAGE_REVIEW",
      label: "Output package review hold",
      summary: "Scoped hold placeholder."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-13T09:30:00.000Z"
  });
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-2",
      matterId: "matter-lifecycle-2"
    }),
    holdFlags: [hold],
    lifecycleRequest: {
      id: "output-lifecycle-request-2",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-13T09:35:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });

  assert.equal(orchestration.lifecyclePlan.route, "DEIDENTIFICATION_ACTION");
  assert.equal(orchestration.lifecyclePlan.suppressedByHold, true);
  assert.equal(orchestration.lifecyclePlan.deletionRequest, undefined);
  assert.equal(
    orchestration.lifecyclePlan.deidentificationAction?.blockedByHoldFlagIds[0],
    hold.id
  );
  assert.equal(orchestration.runtimeRecord.activeHoldFlagIds[0], hold.id);
});

test("release-controlled hold transition clears suppression only after explicit release confirmation", () => {
  const holdScope = createPreservationScope({
    id: "output-lifecycle-hold-scope-3",
    matterId: "matter-lifecycle-3",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-lifecycle-3",
    scopeLabel: "Output package scope"
  });
  const hold = createScopedHoldFlag({
    id: "output-lifecycle-hold-3",
    matterId: "matter-lifecycle-3",
    scope: holdScope,
    reason: createHoldReason({
      code: "OUTPUT_PACKAGE_REVIEW",
      label: "Output package review hold",
      summary: "Scoped hold placeholder."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-13T10:00:00.000Z"
  });
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-3",
      matterId: "matter-lifecycle-3"
    }),
    holdFlags: [hold],
    holdCommands: [
      {
        id: "output-lifecycle-hold-command-3a",
        command: "REQUEST_HOLD_RELEASE",
        requestedAt: "2026-04-13T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER",
        holdFlagId: hold.id
      },
      {
        id: "output-lifecycle-hold-command-3b",
        command: "CONFIRM_HOLD_RELEASE",
        requestedAt: "2026-04-13T10:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER",
        holdFlagId: hold.id,
        releaseApprovedByRole: "PRIVACY_REVIEWER"
      }
    ],
    lifecycleRequest: {
      id: "output-lifecycle-request-3",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-13T10:15:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });

  assert.equal(orchestration.holdCommandResults.length, 2);
  assert.equal(
    orchestration.holdCommandResults[0]?.holdFlag?.status,
    "RELEASE_REVIEW_REQUIRED"
  );
  assert.deepEqual(
    orchestration.holdCommandResults[1]?.releasedHoldFlagIds,
    [hold.id]
  );
  assert.equal(orchestration.lifecyclePlan.route, "DELETION_REQUEST");
  assert.equal(orchestration.lifecyclePlan.suppressedByHold, false);
  assert.deepEqual(orchestration.runtimeRecord.activeHoldFlagIds, []);
});

test("RBAC blocks unauthorized output-package lifecycle action requests", () => {
  assert.throws(
    () => orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-4",
        matterId: "matter-lifecycle-4"
      }),
      lifecycleRequest: {
        id: "output-lifecycle-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-13T11:00:00.000Z",
        requestedByRole: "AUDIT_READER"
      }
    }),
    /blocked REQUEST_DELETION for AUDIT_READER/i
  );
});

test("audit events emitted by output-package orchestration preserve shape and invariants", () => {
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-5",
      matterId: "matter-lifecycle-5"
    }),
    holdCommands: [
      {
        id: "output-lifecycle-hold-command-5a",
        command: "APPLY_HOLD",
        requestedAt: "2026-04-13T11:30:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    ],
    lifecycleRequest: {
      id: "output-lifecycle-request-5",
      requestedAction: "REQUEST_DEIDENTIFICATION",
      requestedAt: "2026-04-13T11:35:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const baselineEvent = createPrivacyAuditEvent({
    id: "baseline-audit-event-5",
    at: "2026-04-13T11:40:00.000Z",
    actor: "privacy-reviewer",
    actorType: "OPERATOR",
    matterId: "matter-lifecycle-5",
    controlArea: "LIFECYCLE",
    action: "BASELINE",
    severity: "INFO",
    outcome: "RECORDED",
    subjectType: "DEIDENTIFICATION_ACTION",
    subjectId: "baseline-subject",
    lifecycleState: "REVIEW_NEEDED",
    deterministic: false,
    accessRole: "PRIVACY_REVIEWER",
    accessScopeId: "BR04-SCOPE-OUTPUT-REVIEW",
    detail: "baseline detail",
    metadata: { baseline: true }
  });

  assert.ok(orchestration.auditEvents.length >= 2);
  assert.equal(orchestration.auditEvents[0]?.event, "HOLD:APPLY_HOLD");
  assert.equal(
    orchestration.auditEvents.at(-1)?.event,
    "LIFECYCLE:DEIDENTIFICATION_REQUEST_PLANNED"
  );
  for (const event of orchestration.auditEvents) {
    assert.equal(event.event, `${event.controlArea}:${event.action}`);
    assert.ok(Array.isArray(event.policyKeys));
    assert.ok(Array.isArray(event.holdFlagIds));
    assert.ok(Array.isArray(event.sourceReferenceIds));
  }
  assert.deepEqual(
    Object.keys(orchestration.auditEvents.at(-1) ?? {}).sort(),
    Object.keys(baselineEvent).sort()
  );
});

test("output-package orchestration rejects universal retention fallback when scoped policy refs are missing", () => {
  const source = loadBr04PolicySource();
  const sourceWithoutOutputRetention = {
    ...source,
    retentionPolicies: source.retentionPolicies.filter(
      (policy) => policy.appliesTo !== "OUTPUT_PACKAGE"
    )
  };

  assert.throws(
    () => orchestrateOutputPackageLifecycle({
      source: sourceWithoutOutputRetention,
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-6",
        matterId: "matter-lifecycle-6"
      }),
      lifecycleRequest: {
        id: "output-lifecycle-request-6",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-13T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    }),
    /require at least one scoped retention policy ref; blanket keep\/delete fallback is not allowed/i
  );
});
