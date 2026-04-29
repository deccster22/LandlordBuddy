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
  type HydrateOfficialHandoffCheckpointInput,
  type HydrateOutputCheckpointInput,
  type OutputPackageLifecycleResumeCheckpointInput
} from "../src/app/outputHandoffCheckpointHydration.js";
import {
  resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterExecutionRouting.js";
import {
  resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterExecutionCaller.js";
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
    id: "output-lifecycle-execution-caller-1",
    matterId: "matter-lifecycle-execution-caller-1",
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
    matterId: "matter-lifecycle-execution-caller-1",
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
    matterId: "matter-lifecycle-execution-caller-1",
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
    sourceEventId: "execution-caller-event-1",
    sourceKind: "OFFICIAL_HANDOFF_CHECKPOINT",
    capturedAt: "2026-04-28T09:00:00.000Z",
    ...overrides
  };
}

function persistLifecycleOrchestrationRecord(
  record: OutputPackageLifecycleOrchestrationRecord
): {
  resumeCheckpoint: OutputPackageLifecycleResumeCheckpointInput;
} {
  const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
  storeOutputPackageLifecycleOrchestrationRecord({
    store,
    record
  });

  return {
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

test(
  "internal caller consumes output-checkpoint execution routing result",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "execution-caller-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const routingInput = buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const directRouting = resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(
      routingInput
    );
    const control = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(routingInput);

    if (
      control.outcome !== "RESUME_AVAILABLE_CONTROL"
      || !control.lifecycleExecutionRouting
      || !directRouting.executionRouting
    ) {
      throw new Error("Expected resume-available control and execution routing result.");
    }

    assert.deepEqual(control.lifecycleExecutionRouting, directRouting.executionRouting);
    assert.equal(control.hydratedCheckpoint?.outputPackageLifecycleResume?.status, "RESUMED");
  }
);

test(
  "internal caller maps resumed lifecycle record to neutral resume-available control outcome",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-caller-2",
        matterId: "matter-lifecycle-execution-caller-2"
      }),
      lifecycleRequest: {
        id: "execution-caller-request-2",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const control = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-execution-caller-2",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (
      control.outcome !== "RESUME_AVAILABLE_CONTROL"
      || !control.lifecycleExecutionRouting
      || control.lifecycleExecutionRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected RESUME_AVAILABLE_CONTROL control outcome.");
    }

    assert.equal(control.clearanceInferred, false);
    assert.equal(control.resumeContinuationAllowed, true);
    assert.equal(control.continueWithoutLifecycleRecord, false);
    assert.equal(control.failSafeInterventionRequired, false);
    assert.equal(control.lifecycleExecutionRouting.clearanceInferred, false);
    assert.equal(control.lifecycleExecutionRouting.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(control.lifecycleExecutionRouting.deletionRequestPresent, true);
    assert.equal(control.lifecycleExecutionRouting.deidentificationActionPresent, false);
  }
);

test(
  "internal caller keeps NO_RECORD as non-clearance no-record control outcome",
  () => {
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const control = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
      buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator: {
            matterId: "matter-lifecycle-execution-caller-missing",
            outputPackageId: "output-lifecycle-execution-caller-missing",
            lifecycleRequestId: "execution-caller-request-missing"
          }
        }
      })
    );

    if (
      control.outcome !== "NO_RECORD_NON_CLEARANCE_CONTROL"
      || !control.lifecycleExecutionRouting
      || control.lifecycleExecutionRouting.outcome !== "NO_LIFECYCLE_RECORD_FOUND"
    ) {
      throw new Error("Expected NO_RECORD_NON_CLEARANCE_CONTROL control outcome.");
    }

    assert.equal(control.clearanceInferred, false);
    assert.equal(control.resumeContinuationAllowed, false);
    assert.equal(control.continueWithoutLifecycleRecord, true);
    assert.equal(control.failSafeInterventionRequired, false);
    assert.equal(control.lifecycleExecutionRouting.lifecycleResumeRecordPresent, false);
    assert.equal(control.lifecycleExecutionRouting.lifecycleActionPlanVisible, false);
    assert.equal(control.lifecycleExecutionRouting.lifecycleRoute, "NONE");
  }
);

test(
  "internal caller maps malformed lifecycle payloads to cannot-safely-resume fail-safe control outcome",
  () => {
    const locator = {
      matterId: "matter-lifecycle-execution-caller-malformed",
      outputPackageId: "output-lifecycle-execution-caller-malformed",
      lifecycleRequestId: "execution-caller-request-malformed"
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
    const control = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
      buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })
    );

    if (
      control.outcome !== "CANNOT_SAFELY_RESUME_CONTROL"
      || !control.lifecycleExecutionRouting
      || control.lifecycleExecutionRouting.outcome !== "CANNOT_SAFELY_RESUME_RECORD"
    ) {
      throw new Error("Expected CANNOT_SAFELY_RESUME_CONTROL control outcome.");
    }

    assert.equal(control.clearanceInferred, false);
    assert.equal(control.resumeContinuationAllowed, false);
    assert.equal(control.continueWithoutLifecycleRecord, false);
    assert.equal(control.failSafeInterventionRequired, true);
    assert.equal(control.lifecycleExecutionRouting.clearanceInferred, false);
    assert.equal(control.lifecycleExecutionRouting.resumeRecordKey, key);
    assert.equal(control.lifecycleExecutionRouting.malformedLifecycleRecord, true);
    assert.match(control.lifecycleExecutionRouting.malformedLifecycleRecordErrorMessage, /malformed/i);
    assert.equal(control.hydratedCheckpoint, undefined);
  }
);

test(
  "internal caller keeps hold-aware lifecycle state visible in internal control context",
  () => {
    const holdScope = createPreservationScope({
      id: "execution-caller-hold-scope-4",
      matterId: "matter-lifecycle-execution-caller-4",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-execution-caller-4",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "execution-caller-hold-4",
      matterId: "matter-lifecycle-execution-caller-4",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-04-28T10:00:00.000Z"
    });
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-caller-4",
        matterId: "matter-lifecycle-execution-caller-4"
      }),
      holdFlags: [hold],
      lifecycleRequest: {
        id: "execution-caller-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const control = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-execution-caller-4",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (
      control.outcome !== "RESUME_AVAILABLE_CONTROL"
      || !control.lifecycleExecutionRouting
      || control.lifecycleExecutionRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected RESUME_AVAILABLE_CONTROL control outcome.");
    }

    assert.equal(control.lifecycleExecutionRouting.holdAwareLifecycleStatePresent, true);
    assert.equal(control.lifecycleExecutionRouting.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(control.lifecycleExecutionRouting.deletionRequestPresent, false);
    assert.equal(control.lifecycleExecutionRouting.deidentificationActionPresent, true);
  }
);

test(
  "internal caller keeps release-controlled lifecycle state visible in internal control context",
  () => {
    const holdScope = createPreservationScope({
      id: "execution-caller-hold-scope-5",
      matterId: "matter-lifecycle-execution-caller-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-execution-caller-5",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "execution-caller-hold-5",
      matterId: "matter-lifecycle-execution-caller-5",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-04-28T11:00:00.000Z"
    });
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-caller-5",
        matterId: "matter-lifecycle-execution-caller-5"
      }),
      holdFlags: [hold],
      holdCommands: [
        {
          id: "execution-caller-hold-command-5a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:05:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id
        },
        {
          id: "execution-caller-hold-command-5b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:10:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "execution-caller-request-5",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const control = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-execution-caller-5",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (
      control.outcome !== "RESUME_AVAILABLE_CONTROL"
      || !control.lifecycleExecutionRouting
      || control.lifecycleExecutionRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected RESUME_AVAILABLE_CONTROL control outcome.");
    }

    assert.equal(control.lifecycleExecutionRouting.holdAwareLifecycleStatePresent, false);
    assert.equal(control.lifecycleExecutionRouting.releaseControlledLifecycleStatePresent, true);
    assert.equal(control.lifecycleExecutionRouting.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(control.lifecycleExecutionRouting.deletionRequestPresent, true);
    assert.equal(control.lifecycleExecutionRouting.deidentificationActionPresent, false);
  }
);

test(
  "internal caller preserves deletion vs de-identification distinction in internal control context",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-caller-6a",
        matterId: "matter-lifecycle-execution-caller-6"
      }),
      lifecycleRequest: {
        id: "execution-caller-request-6a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-caller-6b",
        matterId: "matter-lifecycle-execution-caller-6"
      }),
      lifecycleRequest: {
        id: "execution-caller-request-6b",
        requestedAction: "REQUEST_DEIDENTIFICATION",
        requestedAt: "2026-04-28T12:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint: deletionResumeCheckpoint } = persistLifecycleOrchestrationRecord(
      deletionOrchestration
    );
    const { resumeCheckpoint: deidentificationResumeCheckpoint } =
      persistLifecycleOrchestrationRecord(
        deidentificationOrchestration
      );
    const deletionControl = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-execution-caller-6",
        outputPackageLifecycleResumeCheckpoint: deletionResumeCheckpoint
      })
    );
    const deidentificationControl =
      resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
        buildHydrateOutputInput({
          matterId: "matter-lifecycle-execution-caller-6",
          outputPackageLifecycleResumeCheckpoint: deidentificationResumeCheckpoint
        })
      );

    if (
      deletionControl.outcome !== "RESUME_AVAILABLE_CONTROL"
      || !deletionControl.lifecycleExecutionRouting
      || deletionControl.lifecycleExecutionRouting.outcome !== "RESUME_AVAILABLE"
      || deidentificationControl.outcome !== "RESUME_AVAILABLE_CONTROL"
      || !deidentificationControl.lifecycleExecutionRouting
      || deidentificationControl.lifecycleExecutionRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected RESUME_AVAILABLE_CONTROL control outcomes.");
    }

    assert.equal(deletionControl.lifecycleExecutionRouting.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(deletionControl.lifecycleExecutionRouting.deletionRequestPresent, true);
    assert.equal(deletionControl.lifecycleExecutionRouting.deidentificationActionPresent, false);
    assert.equal(
      deidentificationControl.lifecycleExecutionRouting.lifecycleRoute,
      "DEIDENTIFICATION_ACTION"
    );
    assert.equal(deidentificationControl.lifecycleExecutionRouting.deletionRequestPresent, false);
    assert.equal(
      deidentificationControl.lifecycleExecutionRouting.deidentificationActionPresent,
      true
    );
  }
);

test(
  "internal caller introduces no UI/copy fields",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-caller-7",
        matterId: "matter-lifecycle-execution-caller-7"
      }),
      lifecycleRequest: {
        id: "execution-caller-request-7",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T12:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const control = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-execution-caller-7",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (
      control.outcome !== "RESUME_AVAILABLE_CONTROL"
      || !control.lifecycleExecutionRouting
      || control.lifecycleExecutionRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected RESUME_AVAILABLE_CONTROL control outcome.");
    }

    const forbiddenUiCopyFields = [
      "title",
      "message",
      "copy",
      "body",
      "ctaLabel",
      "primaryCtaLabel",
      "secondaryCtaLabel"
    ];

    for (const field of forbiddenUiCopyFields) {
      assert.equal(field in control, false);
      assert.equal(field in control.lifecycleExecutionRouting, false);
    }
  }
);

test(
  "internal caller is additive and leaves output/handoff trust semantics unchanged",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-caller-8",
        matterId: "matter-lifecycle-execution-caller-8"
      }),
      lifecycleRequest: {
        id: "execution-caller-request-8",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T13:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputInput = buildHydrateOutputInput({
      matterId: "matter-lifecycle-execution-caller-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const handoffInput = buildHydrateHandoffInput({
      matterId: "matter-lifecycle-execution-caller-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const baselineOutput = composeOutputPackageFromHydratedCheckpoint(outputInput);
    const baselineHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint(handoffInput);
    const control = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint({
      ...outputInput,
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const resumedOutput = composeOutputPackageFromHydratedCheckpoint({
      ...outputInput,
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const resumedHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint({
      ...handoffInput,
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });

    if (
      control.outcome !== "RESUME_AVAILABLE_CONTROL"
      || !control.lifecycleExecutionRouting
      || control.lifecycleExecutionRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected RESUME_AVAILABLE_CONTROL control outcome.");
    }

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
  }
);
