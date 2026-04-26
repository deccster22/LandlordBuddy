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
import type { Br03TouchpointPostureSourceEvent } from "../src/app/br03TouchpointSnapshotProducer.js";
import {
  composeOfficialHandoffGuidanceFromHydratedCheckpoint,
  composeOutputPackageFromHydratedCheckpoint,
  hydrateOutputCheckpointForComposition,
  resumeOutputPackageLifecycleOrchestrationForCheckpoint,
  type HydrateOfficialHandoffCheckpointInput,
  type HydrateOutputCheckpointInput,
  type OutputPackageLifecycleResumeCheckpointInput
} from "../src/app/outputHandoffCheckpointHydration.js";
import {
  orchestrateOutputPackageLifecycle
} from "../src/app/outputPackageLifecycleOrchestration.js";
import type {
  OutputPackageLifecycleOrchestrationRecord
} from "../src/app/outputPackageLifecycleOrchestration.js";
import {
  buildOutputPackageLifecycleOrchestrationRecordKey,
  createInMemoryOutputPackageLifecycleOrchestrationRecordStore,
  storeOutputPackageLifecycleOrchestrationRecord
} from "../src/app/outputPackageLifecycleOrchestrationPersistence.js";

function buildOutputPackageInput(
  overrides: Partial<CreateOutputPackageRecordInput> = {}
): CreateOutputPackageRecordInput {
  return {
    id: "output-lifecycle-resume-1",
    matterId: "matter-lifecycle-resume-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    ...overrides
  };
}

function buildHydrateOutputInput(
  overrides: Partial<HydrateOutputCheckpointInput> = {}
): HydrateOutputCheckpointInput {
  return {
    matterId: "matter-lifecycle-resume-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-freshness-watch"],
    ...overrides
  };
}

function buildHydrateHandoffInput(
  overrides: Partial<HydrateOfficialHandoffCheckpointInput> = {}
): HydrateOfficialHandoffCheckpointInput {
  return {
    matterId: "matter-lifecycle-resume-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-freshness-watch"],
    ...overrides
  };
}

function createSourceEvent(
  overrides: Partial<Br03TouchpointPostureSourceEvent> = {}
): Br03TouchpointPostureSourceEvent {
  return {
    touchpointId: "vic-arrears-public-form-warning",
    sourceEventId: "resume-checkpoint-event-1",
    sourceKind: "OFFICIAL_HANDOFF_CHECKPOINT",
    capturedAt: "2026-04-26T09:00:00.000Z",
    ...overrides
  };
}

function persistLifecycleOrchestrationRecord(
  record: OutputPackageLifecycleOrchestrationRecord
): {
  storedKey: string;
  resumeCheckpoint: OutputPackageLifecycleResumeCheckpointInput;
} {
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  const stored = storeOutputPackageLifecycleOrchestrationRecord({
    store,
    record
  });

  return {
    storedKey: stored.key,
    resumeCheckpoint: {
      store,
      locator: {
        matterId: record.replay.matterId,
        outputPackageId: record.replay.outputPackageId,
        lifecycleRequestId: record.replay.lifecycleRequest.id
      }
    }
  };
}

test("resume checkpoint wiring loads and replays a persisted lifecycle orchestration record", () => {
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput(),
    lifecycleRequest: {
      id: "output-lifecycle-resume-request-1",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-26T09:10:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const { storedKey, resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
  const hydrated = hydrateOutputCheckpointForComposition(buildHydrateOutputInput({
    outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
  }));
  const resume = hydrated.outputPackageLifecycleResume;

  if (!resume || resume.status !== "RESUMED") {
    throw new Error("Expected resumed lifecycle checkpoint result.");
  }

  assert.equal(resume.key, storedKey);
  assert.equal(resume.clearanceInferred, false);
  assert.equal(resume.replayPlan.route, orchestration.lifecyclePlan.route);
  assert.equal(
    resume.replayPlan.suppressedByHold,
    orchestration.lifecyclePlan.suppressedByHold
  );
  assert.deepEqual(resume.auditEvents, orchestration.auditEvents);
});

test("resume checkpoint wiring treats missing lifecycle record as controlled no-record result", () => {
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  const result = resumeOutputPackageLifecycleOrchestrationForCheckpoint({
    store,
    locator: {
      matterId: "matter-lifecycle-resume-missing",
      outputPackageId: "output-lifecycle-resume-missing",
      lifecycleRequestId: "request-lifecycle-resume-missing"
    }
  });

  assert.equal(result.status, "NO_RECORD");
  assert.equal(result.clearanceInferred, false);
  assert.deepEqual(result.auditEvents, []);
});

test("resume checkpoint wiring fails loudly on malformed lifecycle record payloads", () => {
  const locator = {
    matterId: "matter-lifecycle-resume-malformed",
    outputPackageId: "output-lifecycle-resume-malformed",
    lifecycleRequestId: "request-lifecycle-resume-malformed"
  };
  const key = buildOutputPackageLifecycleOrchestrationRecordKey(locator);
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore([
    {
      key,
      record: {
        orchestrationVersion: "P4B-CX-BR04-07",
        replay: {
          matterId: locator.matterId,
          outputPackageId: locator.outputPackageId
        }
      }
    }
  ]);

  assert.throws(
    () => resumeOutputPackageLifecycleOrchestrationForCheckpoint({
      store,
      locator
    }),
    /malformed output-package lifecycle orchestration record/i
  );
});

test("resume checkpoint wiring keeps hold-aware suppression visible", () => {
  const holdScope = createPreservationScope({
    id: "output-lifecycle-resume-hold-scope-4",
    matterId: "matter-lifecycle-resume-4",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-lifecycle-resume-4",
    scopeLabel: "Output package scope"
  });
  const hold = createScopedHoldFlag({
    id: "output-lifecycle-resume-hold-4",
    matterId: "matter-lifecycle-resume-4",
    scope: holdScope,
    reason: createHoldReason({
      code: "OUTPUT_PACKAGE_REVIEW",
      label: "Output package review hold",
      summary: "Scoped hold placeholder."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-26T10:00:00.000Z"
  });
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-resume-4",
      matterId: "matter-lifecycle-resume-4"
    }),
    holdFlags: [hold],
    lifecycleRequest: {
      id: "output-lifecycle-resume-request-4",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-26T10:05:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
  const result = resumeOutputPackageLifecycleOrchestrationForCheckpoint(resumeCheckpoint);

  if (result.status !== "RESUMED") {
    throw new Error("Expected resumed lifecycle checkpoint result.");
  }

  assert.equal(result.replayPlan.route, "DEIDENTIFICATION_ACTION");
  assert.equal(result.replayPlan.suppressedByHold, true);
  assert.deepEqual(result.replayPlan.runtimeRecord.activeHoldFlagIds, [hold.id]);
});

test("resume checkpoint wiring keeps release-controlled transitions explicit", () => {
  const holdScope = createPreservationScope({
    id: "output-lifecycle-resume-hold-scope-5",
    matterId: "matter-lifecycle-resume-5",
    subjectType: "OUTPUT_PACKAGE",
    subjectId: "output-lifecycle-resume-5",
    scopeLabel: "Output package scope"
  });
  const hold = createScopedHoldFlag({
    id: "output-lifecycle-resume-hold-5",
    matterId: "matter-lifecycle-resume-5",
    scope: holdScope,
    reason: createHoldReason({
      code: "OUTPUT_PACKAGE_REVIEW",
      label: "Output package review hold",
      summary: "Scoped hold placeholder."
    }),
    status: "ACTIVE",
    appliedAt: "2026-04-26T11:00:00.000Z"
  });
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-resume-5",
      matterId: "matter-lifecycle-resume-5"
    }),
    holdFlags: [hold],
    holdCommands: [
      {
        id: "output-lifecycle-resume-hold-command-5a",
        command: "REQUEST_HOLD_RELEASE",
        requestedAt: "2026-04-26T11:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER",
        holdFlagId: hold.id
      },
      {
        id: "output-lifecycle-resume-hold-command-5b",
        command: "CONFIRM_HOLD_RELEASE",
        requestedAt: "2026-04-26T11:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER",
        holdFlagId: hold.id,
        releaseApprovedByRole: "PRIVACY_REVIEWER"
      }
    ],
    lifecycleRequest: {
      id: "output-lifecycle-resume-request-5",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-26T11:15:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
  const result = resumeOutputPackageLifecycleOrchestrationForCheckpoint(resumeCheckpoint);

  if (result.status !== "RESUMED") {
    throw new Error("Expected resumed lifecycle checkpoint result.");
  }

  assert.ok(result.orchestrationRecord.replay.releasedHoldFlagIds.includes(hold.id));
  assert.equal(result.replayPlan.route, "DELETION_REQUEST");
  assert.equal(result.replayPlan.suppressedByHold, false);
  assert.deepEqual(result.replayPlan.runtimeRecord.activeHoldFlagIds, []);
});

test("resume checkpoint wiring preserves deletion vs de-identification routes", () => {
  const deletionOrchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-resume-6a",
      matterId: "matter-lifecycle-resume-6"
    }),
    lifecycleRequest: {
      id: "output-lifecycle-resume-request-6a",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-26T12:00:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-resume-6b",
      matterId: "matter-lifecycle-resume-6"
    }),
    lifecycleRequest: {
      id: "output-lifecycle-resume-request-6b",
      requestedAction: "REQUEST_DEIDENTIFICATION",
      requestedAt: "2026-04-26T12:05:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const { resumeCheckpoint: deletionResumeCheckpoint } = persistLifecycleOrchestrationRecord(
    deletionOrchestration
  );
  const { resumeCheckpoint: deidentificationResumeCheckpoint } = persistLifecycleOrchestrationRecord(
    deidentificationOrchestration
  );
  const deletionResult = resumeOutputPackageLifecycleOrchestrationForCheckpoint(
    deletionResumeCheckpoint
  );
  const deidentificationResult = resumeOutputPackageLifecycleOrchestrationForCheckpoint(
    deidentificationResumeCheckpoint
  );

  if (deletionResult.status !== "RESUMED" || deidentificationResult.status !== "RESUMED") {
    throw new Error("Expected resumed lifecycle checkpoint results.");
  }

  assert.equal(deletionResult.replayPlan.route, "DELETION_REQUEST");
  assert.ok(deletionResult.replayPlan.deletionRequest);
  assert.equal(deletionResult.replayPlan.deidentificationAction, undefined);
  assert.equal(deidentificationResult.replayPlan.route, "DEIDENTIFICATION_ACTION");
  assert.ok(deidentificationResult.replayPlan.deidentificationAction);
  assert.equal(deidentificationResult.replayPlan.deletionRequest, undefined);
});

test("resume checkpoint wiring preserves class and policy references", () => {
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-resume-7",
      matterId: "matter-lifecycle-resume-7"
    }),
    lifecycleRequest: {
      id: "output-lifecycle-resume-request-7",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-26T13:00:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
  const result = resumeOutputPackageLifecycleOrchestrationForCheckpoint(resumeCheckpoint);

  if (result.status !== "RESUMED") {
    throw new Error("Expected resumed lifecycle checkpoint result.");
  }

  assert.equal(result.orchestrationRecord.replay.dataClassId, "BR04-DATA-CLASS-OUTPUT-PACK");
  assert.equal(result.orchestrationRecord.replay.policyKey, "OUTPUT_PACKAGE_RECORD");
  assert.equal(
    result.orchestrationRecord.runtimeRecord.classControlId,
    "BR04-CLASS-CONTROL-BR04-POLICY-OUTPUT-PACK"
  );
  assert.equal(result.replayPlan.classControl.policyKey, "OUTPUT_PACKAGE_RECORD");
});

test("resume checkpoint wiring preserves lifecycle audit event envelopes", () => {
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-resume-8",
      matterId: "matter-lifecycle-resume-8"
    }),
    holdCommands: [
      {
        id: "output-lifecycle-resume-hold-command-8a",
        command: "APPLY_HOLD",
        requestedAt: "2026-04-26T14:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    ],
    lifecycleRequest: {
      id: "output-lifecycle-resume-request-8",
      requestedAction: "REQUEST_DEIDENTIFICATION",
      requestedAt: "2026-04-26T14:05:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
  const result = resumeOutputPackageLifecycleOrchestrationForCheckpoint(resumeCheckpoint);

  if (result.status !== "RESUMED") {
    throw new Error("Expected resumed lifecycle checkpoint result.");
  }

  assert.deepEqual(result.auditEvents, orchestration.auditEvents);
  for (const event of result.auditEvents) {
    assert.equal(event.event, `${event.controlArea}:${event.action}`);
    assert.ok(Array.isArray(event.policyKeys));
    assert.ok(Array.isArray(event.holdFlagIds));
    assert.ok(Array.isArray(event.sourceReferenceIds));
  }
});

test("output and handoff trust semantics remain unchanged when lifecycle resume checkpoint wiring is present", () => {
  const orchestration = orchestrateOutputPackageLifecycle({
    outputPackageInput: buildOutputPackageInput({
      id: "output-lifecycle-resume-9",
      matterId: "matter-lifecycle-resume-9"
    }),
    lifecycleRequest: {
      id: "output-lifecycle-resume-request-9",
      requestedAction: "REQUEST_DELETION",
      requestedAt: "2026-04-26T15:00:00.000Z",
      requestedByRole: "PRIVACY_REVIEWER"
    }
  });
  const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
  const outputInput = buildHydrateOutputInput({
    matterId: "matter-lifecycle-resume-9",
    touchpointIds: ["vic-arrears-public-form-warning"],
    out04TouchpointSourceEvents: [
      createSourceEvent({
        wrongChannelSignal: true
      })
    ]
  });
  const handoffInput = buildHydrateHandoffInput({
    matterId: "matter-lifecycle-resume-9",
    touchpointIds: ["vic-arrears-public-form-warning"],
    out04TouchpointSourceEvents: [
      createSourceEvent({
        wrongChannelSignal: true
      })
    ]
  });
  const baselineOutput = composeOutputPackageFromHydratedCheckpoint(outputInput);
  const baselineHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint(handoffInput);
  const resumedOutput = composeOutputPackageFromHydratedCheckpoint({
    ...outputInput,
    outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
  });
  const resumedHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint({
    ...handoffInput,
    outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
  });

  if (
    baselineOutput.outputPackage.kind !== "PREP_PACK_COPY_READY"
    || resumedOutput.outputPackage.kind !== "PREP_PACK_COPY_READY"
  ) {
    throw new Error("Expected PREP_PACK_COPY_READY output shells.");
  }

  assert.deepEqual(
    resumedOutput.outputPackage.touchpointControlOutputs,
    baselineOutput.outputPackage.touchpointControlOutputs
  );
  assert.deepEqual(
    resumedOutput.outputPackage.blockKeys,
    baselineOutput.outputPackage.blockKeys
  );
  assert.equal(
    resumedOutput.outputPackage.trustBinding.reviewHandoffState.handoff.posture,
    baselineOutput.outputPackage.trustBinding.reviewHandoffState.handoff.posture
  );
  assert.deepEqual(
    resumedHandoff.guidance.guidanceBlockKeys,
    baselineHandoff.guidance.guidanceBlockKeys
  );
  assert.equal(
    resumedHandoff.guidance.trustBinding.reviewHandoffState.handoff.posture,
    baselineHandoff.guidance.trustBinding.reviewHandoffState.handoff.posture
  );
  assert.equal(resumedOutput.outputPackageLifecycleResume?.status, "RESUMED");
  assert.equal(resumedHandoff.outputPackageLifecycleResume?.status, "RESUMED");
});
