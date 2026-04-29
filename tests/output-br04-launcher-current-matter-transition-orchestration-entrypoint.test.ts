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
  selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterTransitionSelector.js";
import {
  orchestrateLauncherCurrentMatterTransitionEntry,
  orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterTransitionOrchestrationEntry.js";
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
    id: "output-lifecycle-transition-orchestration-1",
    matterId: "matter-lifecycle-transition-orchestration-1",
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
    matterId: "matter-lifecycle-transition-orchestration-1",
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
    matterId: "matter-lifecycle-transition-orchestration-1",
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
    sourceEventId: "transition-orchestration-event-1",
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
  "orchestration entrypoint consumes lifecycle transition selector result",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "transition-orchestration-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const checkpoint = buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const lifecycleTransitionState =
      selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(checkpoint);
    const directOrchestration = orchestrateLauncherCurrentMatterTransitionEntry({
      lifecycleTransitionState,
      nonLifecycleTransitionInput: {
        transitionHintCode: "UNCHANGED"
      }
    });
    const fromCheckpointOrchestration =
      orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
        outputCheckpoint: checkpoint,
        nonLifecycleTransitionInput: {
          transitionHintCode: "UNCHANGED"
        }
      });

    assert.deepEqual(fromCheckpointOrchestration, directOrchestration);
  }
);

test(
  "lifecycle-derived state remains separately inspectable in orchestration result",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-orchestration-2",
        matterId: "matter-lifecycle-transition-orchestration-2"
      }),
      lifecycleRequest: {
        id: "transition-orchestration-request-2",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-orchestration-2",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(result.lifecycleTransitionState.target, "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT");
    assert.equal(result.lifecycleTransitionState.handlingMode, "MODE_CONTINUE_WITH_LIFECYCLE_CONTEXT");
    assert.equal(result.lifecycleTransitionState.lifecycleExecutionControl.outcome, "RESUME_AVAILABLE_CONTROL");
  }
);

test(
  "non-lifecycle transition inputs remain separately inspectable in orchestration result",
  () => {
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput(),
      nonLifecycleTransitionInput: {
        progressionHoldRequested: true,
        unresolvedBlockerCodes: ["NON_LIFECYCLE_BLOCKER_A"],
        transitionHintCode: "RECHECK_CONTEXT"
      }
    });

    assert.equal(result.nonLifecycleTransitionState.posture, "NON_LIFECYCLE_HOLD_REQUESTED");
    assert.equal(result.nonLifecycleTransitionState.progressionHoldRequested, true);
    assert.deepEqual(
      result.nonLifecycleTransitionState.unresolvedBlockerCodes,
      ["NON_LIFECYCLE_BLOCKER_A"]
    );
    assert.equal(result.nonLifecycleTransitionState.transitionHintCode, "RECHECK_CONTEXT");
  }
);

test(
  "resumed lifecycle context composes without becoming generic success",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-orchestration-3",
        matterId: "matter-lifecycle-transition-orchestration-3"
      }),
      lifecycleRequest: {
        id: "transition-orchestration-request-3",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-orchestration-3",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      }),
      nonLifecycleTransitionInput: {
        transitionHintCode: "UNCHANGED"
      }
    });

    assert.equal(result.target, "ORCHESTRATION_LIFECYCLE_CONTEXT_CONTINUE");
    assert.equal(result.handlingMode, "ORCHESTRATION_MODE_LIFECYCLE_CONTEXT");
    assert.equal(result.clearanceInferred, false);
    assert.equal(result.lifecycleRoute, "DELETION_REQUEST");
  }
);

test(
  "no-record non-clearance composes without becoming clearance",
  () => {
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator: {
            matterId: "matter-lifecycle-transition-orchestration-missing",
            outputPackageId: "output-lifecycle-transition-orchestration-missing",
            lifecycleRequestId: "transition-orchestration-request-missing"
          }
        }
      })
    });

    assert.equal(result.target, "ORCHESTRATION_NO_RECORD_NON_CLEARANCE_CONTINUE");
    assert.equal(result.handlingMode, "ORCHESTRATION_MODE_NO_RECORD_NON_CLEARANCE");
    assert.equal(result.clearanceInferred, false);
    assert.equal(result.noRecordNonClearanceHandling, true);
    assert.equal(result.lifecycleRoute, "NONE");
  }
);

test(
  "cannot-safely-resume composes to fail-safe internal handling",
  () => {
    const locator = {
      matterId: "matter-lifecycle-transition-orchestration-malformed",
      outputPackageId: "output-lifecycle-transition-orchestration-malformed",
      lifecycleRequestId: "transition-orchestration-request-malformed"
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
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })
    });

    assert.equal(result.target, "ORCHESTRATION_FAIL_SAFE_HOLD");
    assert.equal(result.handlingMode, "ORCHESTRATION_MODE_FAIL_SAFE_HOLD");
    assert.equal(result.proceedWithOrchestration, false);
    assert.equal(result.failSafeHoldHandling, true);
    assert.equal(result.clearanceInferred, false);
  }
);

test(
  "no-routing-signal composes to explicit no-signal handling",
  () => {
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput()
    });

    assert.equal(result.target, "ORCHESTRATION_EXPLICIT_NO_SIGNAL");
    assert.equal(result.handlingMode, "ORCHESTRATION_MODE_EXPLICIT_NO_SIGNAL");
    assert.equal(result.proceedWithOrchestration, false);
    assert.equal(result.explicitNoRoutingSignalHandling, true);
    assert.equal(result.clearanceInferred, false);
  }
);

test(
  "hold-aware state remains visible in orchestration metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "transition-orchestration-hold-scope-4",
      matterId: "matter-lifecycle-transition-orchestration-4",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-transition-orchestration-4",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "transition-orchestration-hold-4",
      matterId: "matter-lifecycle-transition-orchestration-4",
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
        id: "output-lifecycle-transition-orchestration-4",
        matterId: "matter-lifecycle-transition-orchestration-4"
      }),
      holdFlags: [hold],
      lifecycleRequest: {
        id: "transition-orchestration-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-orchestration-4",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(result.holdAwareLifecycleStatePresent, true);
    assert.equal(result.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(result.deletionRequestPresent, false);
    assert.equal(result.deidentificationActionPresent, true);
  }
);

test(
  "release-controlled state remains visible in orchestration metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "transition-orchestration-hold-scope-5",
      matterId: "matter-lifecycle-transition-orchestration-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-transition-orchestration-5",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "transition-orchestration-hold-5",
      matterId: "matter-lifecycle-transition-orchestration-5",
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
        id: "output-lifecycle-transition-orchestration-5",
        matterId: "matter-lifecycle-transition-orchestration-5"
      }),
      holdFlags: [hold],
      holdCommands: [
        {
          id: "transition-orchestration-hold-command-5a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:05:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id
        },
        {
          id: "transition-orchestration-hold-command-5b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:10:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "transition-orchestration-request-5",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-orchestration-5",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(result.holdAwareLifecycleStatePresent, false);
    assert.equal(result.releaseControlledLifecycleStatePresent, true);
    assert.equal(result.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(result.deletionRequestPresent, true);
    assert.equal(result.deidentificationActionPresent, false);
  }
);

test(
  "deletion/de-identification distinction is preserved in orchestration metadata",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-orchestration-6a",
        matterId: "matter-lifecycle-transition-orchestration-6"
      }),
      lifecycleRequest: {
        id: "transition-orchestration-request-6a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-orchestration-6b",
        matterId: "matter-lifecycle-transition-orchestration-6"
      }),
      lifecycleRequest: {
        id: "transition-orchestration-request-6b",
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
    const deletionResult = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-orchestration-6",
        outputPackageLifecycleResumeCheckpoint: deletionResumeCheckpoint
      })
    });
    const deidentificationResult = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-orchestration-6",
        outputPackageLifecycleResumeCheckpoint: deidentificationResumeCheckpoint
      })
    });

    assert.equal(deletionResult.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(deletionResult.deletionRequestPresent, true);
    assert.equal(deletionResult.deidentificationActionPresent, false);
    assert.equal(deidentificationResult.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(deidentificationResult.deletionRequestPresent, false);
    assert.equal(deidentificationResult.deidentificationActionPresent, true);
  }
);

test(
  "orchestration introduces no UI/copy/status-label/CTA fields",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-orchestration-7",
        matterId: "matter-lifecycle-transition-orchestration-7"
      }),
      lifecycleRequest: {
        id: "transition-orchestration-request-7",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T12:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-orchestration-7",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    const forbiddenUiCopyFields = [
      "title",
      "message",
      "copy",
      "body",
      "statusLabel",
      "ctaLabel",
      "primaryCtaLabel",
      "secondaryCtaLabel"
    ];

    for (const field of forbiddenUiCopyFields) {
      assert.equal(field in result, false);
      assert.equal(field in result.lifecycleTransitionState, false);
      assert.equal(field in result.nonLifecycleTransitionState, false);
    }
  }
);

test(
  "orchestration is additive and leaves output/handoff trust semantics unchanged",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-orchestration-8",
        matterId: "matter-lifecycle-transition-orchestration-8"
      }),
      lifecycleRequest: {
        id: "transition-orchestration-request-8",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T13:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputInput = buildHydrateOutputInput({
      matterId: "matter-lifecycle-transition-orchestration-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const handoffInput = buildHydrateHandoffInput({
      matterId: "matter-lifecycle-transition-orchestration-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const baselineOutput = composeOutputPackageFromHydratedCheckpoint(outputInput);
    const baselineHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint(handoffInput);
    const result = orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
      outputCheckpoint: {
        ...outputInput,
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      }
    });
    const resumedOutput = composeOutputPackageFromHydratedCheckpoint({
      ...outputInput,
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const resumedHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint({
      ...handoffInput,
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });

    assert.equal(result.target, "ORCHESTRATION_LIFECYCLE_CONTEXT_CONTINUE");

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
