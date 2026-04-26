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
  createScopedHoldFlag
} from "../src/modules/br04/index.js";
import type { CreateOutputPackageRecordInput } from "../src/modules/output/index.js";
import {
  orchestrateOutputPackageLifecycle
} from "../src/app/outputPackageLifecycleOrchestration.js";
import {
  buildOutputPackageLifecycleOrchestrationRecordKey,
  createInMemoryOutputPackageLifecycleOrchestrationRecordStore,
  deriveOutputPackageLifecycleOrchestrationRecordKey,
  loadOutputPackageLifecycleOrchestrationRecord,
  replayStoredOutputPackageLifecycleOrchestration,
  storeOutputPackageLifecycleOrchestrationRecord
} from "../src/app/outputPackageLifecycleOrchestrationPersistence.js";

function buildOutputPackageInput(
  overrides: Partial<CreateOutputPackageRecordInput> = {}
): CreateOutputPackageRecordInput {
  return {
    id: "output-lifecycle-persistence-1",
    matterId: "matter-lifecycle-persistence-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    ...overrides
  };
}

test("persistence adapter stores, loads, and replays output-package lifecycle orchestration records", () => {
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput(),
    lifecycleRequest: {
      id: "output-lifecycle-persist-request-1",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-14T09:00:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const stored = storeOutputPackageLifecycleOrchestrationRecord({
    store,
    record: orchestration
  });
  const loaded = loadOutputPackageLifecycleOrchestrationRecord({
    store,
    key: stored.key
  });
  const replayPlan = replayStoredOutputPackageLifecycleOrchestration({
    store,
    key: stored.key
  });

  assert.equal(stored.key, deriveOutputPackageLifecycleOrchestrationRecordKey(orchestration));
  assert.equal(loaded.replay.lifecycleRequest.id, "output-lifecycle-persist-request-1");
  assert.equal(replayPlan.route, orchestration.lifecyclePlan.route);
  assert.equal(replayPlan.suppressedByHold, orchestration.lifecyclePlan.suppressedByHold);
});

test("persistence adapter fails loudly when an orchestration record key is missing", () => {
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  const key = buildOutputPackageLifecycleOrchestrationRecordKey({
    matterId: "matter-lifecycle-persistence-missing",
    outputPackageId: "output-lifecycle-persistence-missing",
    lifecycleRequestId: "request-lifecycle-persistence-missing"
  });

  assert.throws(
    () => loadOutputPackageLifecycleOrchestrationRecord({ store, key }),
    /missing output-package lifecycle orchestration record/i
  );
});

test("persistence adapter fails loudly when an orchestration record is malformed", () => {
  const key = buildOutputPackageLifecycleOrchestrationRecordKey({
    matterId: "matter-lifecycle-persistence-malformed",
    outputPackageId: "output-lifecycle-persistence-malformed",
    lifecycleRequestId: "request-lifecycle-persistence-malformed"
  });
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore([
    {
      key,
      record: {
        orchestrationVersion: "P4B-CX-BR04-07",
        replay: {
          matterId: "matter-lifecycle-persistence-malformed",
          outputPackageId: "output-lifecycle-persistence-malformed"
        }
      }
    }
  ]);

  assert.throws(
    () => loadOutputPackageLifecycleOrchestrationRecord({ store, key }),
    /malformed output-package lifecycle orchestration record/i
  );
});

test("stored hold-aware orchestration record replays with deletion suppression intact", () => {
  const holdScope = createPreservationScope({
    id: "output-lifecycle-persist-hold-scope-4",
    matterId: "matter-lifecycle-persistence-4",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-lifecycle-persistence-4",
    scopeLabel: "Output package scope"
  });
  const hold = createScopedHoldFlag({
    id: "output-lifecycle-persist-hold-4",
    matterId: "matter-lifecycle-persistence-4",
    scope: holdScope,
    reason: createHoldReason({
      code: "OUTPUT_PACKAGE_REVIEW",
      label: "Output package review hold",
      summary: "Scoped hold placeholder."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-14T10:00:00.000Z"
  });
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-persistence-4",
      matterId: "matter-lifecycle-persistence-4"
    }),
    holdFlags: [hold],
    lifecycleRequest: {
      id: "output-lifecycle-persist-request-4",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-14T10:05:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const stored = storeOutputPackageLifecycleOrchestrationRecord({
    store,
    record: orchestration
  });
  const replayPlan = replayStoredOutputPackageLifecycleOrchestration({
    store,
    key: stored.key
  });

  assert.equal(replayPlan.route, "DEIDENTIFICATION_ACTION");
  assert.equal(replayPlan.suppressedByHold, true);
  assert.deepEqual(replayPlan.runtimeRecord.activeHoldFlagIds, [hold.id]);
  assert.equal(replayPlan.deletionRequest, undefined);
});

test("stored orchestration replay only clears suppression after explicit hold release confirmation", () => {
  const holdScope = createPreservationScope({
    id: "output-lifecycle-persist-hold-scope-5",
    matterId: "matter-lifecycle-persistence-5",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-lifecycle-persistence-5",
    scopeLabel: "Output package scope"
  });
  const hold = createScopedHoldFlag({
    id: "output-lifecycle-persist-hold-5",
    matterId: "matter-lifecycle-persistence-5",
    scope: holdScope,
    reason: createHoldReason({
      code: "OUTPUT_PACKAGE_REVIEW",
      label: "Output package review hold",
      summary: "Scoped hold placeholder."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-14T11:00:00.000Z"
  });
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-persistence-5",
      matterId: "matter-lifecycle-persistence-5"
    }),
    holdFlags: [hold],
    holdCommands: [
      {
        id: "output-lifecycle-persist-hold-command-5a",
        command: "REQUEST_HOLD_RELEASE",
        requestedAt: "2026-04-14T11:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER",
        holdFlagId: hold.id
      },
      {
        id: "output-lifecycle-persist-hold-command-5b",
        command: "CONFIRM_HOLD_RELEASE",
        requestedAt: "2026-04-14T11:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER",
        holdFlagId: hold.id,
        releaseApprovedByRole: "PRIVACY_REVIEWER"
      }
    ],
    lifecycleRequest: {
      id: "output-lifecycle-persist-request-5",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-14T11:15:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const stored = storeOutputPackageLifecycleOrchestrationRecord({
    store,
    record: orchestration
  });
  const loaded = loadOutputPackageLifecycleOrchestrationRecord({
    store,
    key: stored.key
  });
  const replayPlan = replayStoredOutputPackageLifecycleOrchestration({
    store,
    key: stored.key
  });

  assert.ok(loaded.replay.releasedHoldFlagIds.includes(hold.id));
  assert.equal(replayPlan.route, "DELETION_REQUEST");
  assert.equal(replayPlan.suppressedByHold, false);
  assert.deepEqual(replayPlan.runtimeRecord.activeHoldFlagIds, []);
});

test("stored orchestration records preserve deletion vs de-identification routing", () => {
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  const deletionRecord = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-persistence-6a",
      matterId: "matter-lifecycle-persistence-6"
    }),
    lifecycleRequest: {
      id: "output-lifecycle-persist-request-6a",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-14T12:00:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const deidentificationRecord = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-persistence-6b",
      matterId: "matter-lifecycle-persistence-6"
    }),
    lifecycleRequest: {
      id: "output-lifecycle-persist-request-6b",
      requestedAction: "REQUEST_DEIDENTIFICATION",
      requestedAt: "2026-04-14T12:05:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const deletionStored = storeOutputPackageLifecycleOrchestrationRecord({
    store,
    record: deletionRecord
  });
  const deidentificationStored = storeOutputPackageLifecycleOrchestrationRecord({
    store,
    record: deidentificationRecord
  });
  const deletionReplay = replayStoredOutputPackageLifecycleOrchestration({
    store,
    key: deletionStored.key
  });
  const deidentificationReplay = replayStoredOutputPackageLifecycleOrchestration({
    store,
    key: deidentificationStored.key
  });

  assert.equal(deletionReplay.route, "DELETION_REQUEST");
  assert.ok(deletionReplay.deletionRequest);
  assert.equal(deletionReplay.deidentificationAction, undefined);
  assert.equal(deidentificationReplay.route, "DEIDENTIFICATION_ACTION");
  assert.ok(deidentificationReplay.deidentificationAction);
  assert.equal(deidentificationReplay.deletionRequest, undefined);
});

test("stored orchestration records preserve class and policy references", () => {
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-persistence-7",
      matterId: "matter-lifecycle-persistence-7"
    }),
    lifecycleRequest: {
      id: "output-lifecycle-persist-request-7",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-14T13:00:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const stored = storeOutputPackageLifecycleOrchestrationRecord({
    store,
    record: orchestration
  });
  const loaded = loadOutputPackageLifecycleOrchestrationRecord({
    store,
    key: stored.key
  });

  assert.equal(loaded.replay.dataClassId, "BR04-DATA-CLASS-OUTPUT-PACK");
  assert.equal(loaded.replay.policyKey, "OUTPUT_PACKAGE_RECORD");
  assert.equal(
    loaded.runtimeRecord.classControlId,
    "BR04-CLASS-CONTROL-BR04-POLICY-OUTPUT-PACK"
  );
  assert.equal(loaded.runtimeRecord.policyKey, "OUTPUT_PACKAGE_RECORD");
});

test("stored orchestration records preserve audit event envelopes", () => {
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-persistence-8",
      matterId: "matter-lifecycle-persistence-8"
    }),
    holdCommands: [
      {
        id: "output-lifecycle-persist-hold-command-8a",
        command: "APPLY_HOLD",
        requestedAt: "2026-04-14T14:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    ],
    lifecycleRequest: {
      id: "output-lifecycle-persist-request-8",
      requestedAction: "REQUEST_DEIDENTIFICATION",
      requestedAt: "2026-04-14T14:05:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const stored = storeOutputPackageLifecycleOrchestrationRecord({
    store,
    record: orchestration
  });
  const loaded = loadOutputPackageLifecycleOrchestrationRecord({
    store,
    key: stored.key
  });

  assert.deepEqual(loaded.auditEvents, orchestration.auditEvents);
  assert.ok(loaded.auditEvents.length >= 2);
  for (const event of loaded.auditEvents) {
    assert.equal(event.event, `${event.controlArea}:${event.action}`);
    assert.ok(Array.isArray(event.policyKeys));
    assert.ok(Array.isArray(event.holdFlagIds));
    assert.ok(Array.isArray(event.sourceReferenceIds));
  }
});
