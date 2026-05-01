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
  consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterExecutionDirectiveConsumer.js";
import {
  consumeLauncherCurrentMatterInternalHandlingAction,
  consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterHandlingActionConsumer.js";
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
    id: "output-lifecycle-handling-action-consumer-1",
    matterId: "matter-lifecycle-handling-action-consumer-1",
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
    matterId: "matter-lifecycle-handling-action-consumer-1",
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
    matterId: "matter-lifecycle-handling-action-consumer-1",
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
    sourceEventId: "handling-action-consumer-event-1",
    sourceKind: "OFFICIAL_HANDOFF_CHECKPOINT",
    capturedAt: "2026-05-01T09:00:00.000Z",
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
  "handling-action consumer consumes directive outputs",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "handling-action-consumer-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-01T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const checkpoint = buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const executionDirective =
      consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
        outputCheckpoint: checkpoint,
        nonLifecycleTransitionInput: {
          transitionHintCode: "UNCHANGED"
        }
      });
    const directAction = consumeLauncherCurrentMatterInternalHandlingAction({
      executionDirective
    });
    const fromCheckpointAction =
      consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
        outputCheckpoint: checkpoint,
        nonLifecycleTransitionInput: {
          transitionHintCode: "UNCHANGED"
        }
      });

    assert.deepEqual(fromCheckpointAction, directAction);
  }
);

test(
  "lifecycle and non-lifecycle slices remain separately inspectable in handling output",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-handling-action-consumer-2",
        matterId: "matter-lifecycle-handling-action-consumer-2"
      }),
      lifecycleRequest: {
        id: "handling-action-consumer-request-2",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-01T09:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const action = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-handling-action-consumer-2",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      }),
      nonLifecycleTransitionInput: {
        progressionHoldRequested: true,
        unresolvedBlockerCodes: ["NON_LIFECYCLE_BLOCKER_A"],
        transitionHintCode: "RECHECK_CONTEXT"
      }
    });

    assert.equal(
      action.lifecycleTransitionState.target,
      "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT"
    );
    assert.equal(
      action.nonLifecycleTransitionState.posture,
      "NON_LIFECYCLE_HOLD_REQUESTED"
    );
    assert.equal(action.nonLifecycleHoldRequested, true);
    assert.equal(
      action.executionDirective.nonLifecycleTransitionState.transitionHintCode,
      "RECHECK_CONTEXT"
    );
  }
);

test(
  "lifecycle-context directive maps to internal lifecycle-context handling without generic success language",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-handling-action-consumer-3",
        matterId: "matter-lifecycle-handling-action-consumer-3"
      }),
      lifecycleRequest: {
        id: "handling-action-consumer-request-3",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-01T09:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const action = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-handling-action-consumer-3",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(action.handlingAction, "ACTION_CONTINUE_INTERNAL_WITH_LIFECYCLE_CONTEXT");
    assert.equal(action.clearanceInferred, false);
    assert.equal(action.continueInternalWithLifecycleContext, true);
    assert.equal(action.continueInternalNoRecordNonClearance, false);
    assert.equal(action.failSafeHoldInternalHandling, false);
    assert.equal(action.explicitNoRoutingSignalInternalHandling, false);
    assert.equal(action.lifecycleRoute, "DELETION_REQUEST");
  }
);

test(
  "no-record directive maps to internal no-record handling without clearance inference",
  () => {
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const action = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator: {
            matterId: "matter-lifecycle-handling-action-consumer-missing",
            outputPackageId: "output-lifecycle-handling-action-consumer-missing",
            lifecycleRequestId: "handling-action-consumer-request-missing"
          }
        }
      })
    });

    assert.equal(action.handlingAction, "ACTION_CONTINUE_INTERNAL_NO_RECORD_NON_CLEARANCE");
    assert.equal(action.clearanceInferred, false);
    assert.equal(action.continueInternalWithLifecycleContext, false);
    assert.equal(action.continueInternalNoRecordNonClearance, true);
    assert.equal(action.failSafeHoldInternalHandling, false);
    assert.equal(action.explicitNoRoutingSignalInternalHandling, false);
    assert.equal(action.lifecycleRoute, "NONE");
  }
);

test(
  "cannot-safely-resume directive maps to fail-safe internal hold handling",
  () => {
    const locator = {
      matterId: "matter-lifecycle-handling-action-consumer-malformed",
      outputPackageId: "output-lifecycle-handling-action-consumer-malformed",
      lifecycleRequestId: "handling-action-consumer-request-malformed"
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
    const action = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })
    });

    assert.equal(action.handlingAction, "ACTION_HOLD_INTERNAL_CANNOT_SAFELY_RESUME");
    assert.equal(action.clearanceInferred, false);
    assert.equal(action.proceedWithInternalHandling, false);
    assert.equal(action.continueInternalWithLifecycleContext, false);
    assert.equal(action.continueInternalNoRecordNonClearance, false);
    assert.equal(action.failSafeHoldInternalHandling, true);
    assert.equal(action.explicitNoRoutingSignalInternalHandling, false);
    assert.equal(action.lifecycleRoute, "NONE");
  }
);

test(
  "no-routing-signal directive maps to explicit no-signal handling",
  () => {
    const action = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput()
    });

    assert.equal(action.handlingAction, "ACTION_EXPLICIT_INTERNAL_NO_ROUTING_SIGNAL");
    assert.equal(action.clearanceInferred, false);
    assert.equal(action.proceedWithInternalHandling, false);
    assert.equal(action.continueInternalWithLifecycleContext, false);
    assert.equal(action.continueInternalNoRecordNonClearance, false);
    assert.equal(action.failSafeHoldInternalHandling, false);
    assert.equal(action.explicitNoRoutingSignalInternalHandling, true);
  }
);

test(
  "hold-aware state remains visible in handling metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "handling-action-consumer-hold-scope-4",
      matterId: "matter-lifecycle-handling-action-consumer-4",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-handling-action-consumer-4",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "handling-action-consumer-hold-4",
      matterId: "matter-lifecycle-handling-action-consumer-4",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-01T10:00:00.000Z"
    });
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-handling-action-consumer-4",
        matterId: "matter-lifecycle-handling-action-consumer-4"
      }),
      holdFlags: [hold],
      lifecycleRequest: {
        id: "handling-action-consumer-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-01T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const action = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-handling-action-consumer-4",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(action.holdAwareLifecycleStatePresent, true);
    assert.equal(action.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(action.deletionRequestPresent, false);
    assert.equal(action.deidentificationActionPresent, true);
  }
);

test(
  "release-controlled state remains visible in handling metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "handling-action-consumer-hold-scope-5",
      matterId: "matter-lifecycle-handling-action-consumer-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-handling-action-consumer-5",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "handling-action-consumer-hold-5",
      matterId: "matter-lifecycle-handling-action-consumer-5",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-01T11:00:00.000Z"
    });
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-handling-action-consumer-5",
        matterId: "matter-lifecycle-handling-action-consumer-5"
      }),
      holdFlags: [hold],
      holdCommands: [
        {
          id: "handling-action-consumer-hold-command-5a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-05-01T11:05:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id
        },
        {
          id: "handling-action-consumer-hold-command-5b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-05-01T11:10:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "handling-action-consumer-request-5",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-01T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const action = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-handling-action-consumer-5",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(action.holdAwareLifecycleStatePresent, false);
    assert.equal(action.releaseControlledLifecycleStatePresent, true);
    assert.equal(action.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(action.deletionRequestPresent, true);
    assert.equal(action.deidentificationActionPresent, false);
  }
);

test(
  "deletion/de-identification distinction is preserved in handling metadata",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-handling-action-consumer-6a",
        matterId: "matter-lifecycle-handling-action-consumer-6"
      }),
      lifecycleRequest: {
        id: "handling-action-consumer-request-6a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-01T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-handling-action-consumer-6b",
        matterId: "matter-lifecycle-handling-action-consumer-6"
      }),
      lifecycleRequest: {
        id: "handling-action-consumer-request-6b",
        requestedAction: "REQUEST_DEIDENTIFICATION",
        requestedAt: "2026-05-01T12:05:00.000Z",
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
    const deletionAction = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-handling-action-consumer-6",
        outputPackageLifecycleResumeCheckpoint: deletionResumeCheckpoint
      })
    });
    const deidentificationAction =
      consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-handling-action-consumer-6",
          outputPackageLifecycleResumeCheckpoint: deidentificationResumeCheckpoint
        })
      });

    assert.equal(deletionAction.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(deletionAction.deletionRequestPresent, true);
    assert.equal(deletionAction.deidentificationActionPresent, false);
    assert.equal(deidentificationAction.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(deidentificationAction.deletionRequestPresent, false);
    assert.equal(deidentificationAction.deidentificationActionPresent, true);
  }
);

test(
  "handling-action consumer introduces no UI/copy/status-label/CTA/screen-route/public-route-name fields",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-handling-action-consumer-7",
        matterId: "matter-lifecycle-handling-action-consumer-7"
      }),
      lifecycleRequest: {
        id: "handling-action-consumer-request-7",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-01T12:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const action = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-handling-action-consumer-7",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    const forbiddenFields = [
      "title",
      "message",
      "copy",
      "body",
      "statusLabel",
      "ctaLabel",
      "primaryCtaLabel",
      "secondaryCtaLabel",
      "screenRoute",
      "publicRouteName"
    ];

    for (const field of forbiddenFields) {
      assert.equal(field in action, false);
      assert.equal(field in action.lifecycleTransitionState, false);
      assert.equal(field in action.nonLifecycleTransitionState, false);
      assert.equal(field in action.executionDirective, false);
    }
  }
);

test(
  "handling-action consumer is additive and leaves output/handoff trust semantics unchanged",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-handling-action-consumer-8",
        matterId: "matter-lifecycle-handling-action-consumer-8"
      }),
      lifecycleRequest: {
        id: "handling-action-consumer-request-8",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-01T13:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputInput = buildHydrateOutputInput({
      matterId: "matter-lifecycle-handling-action-consumer-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const handoffInput = buildHydrateHandoffInput({
      matterId: "matter-lifecycle-handling-action-consumer-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const baselineOutput = composeOutputPackageFromHydratedCheckpoint(outputInput);
    const baselineHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint(handoffInput);
    const action = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
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

    assert.equal(action.handlingAction, "ACTION_CONTINUE_INTERNAL_WITH_LIFECYCLE_CONTEXT");

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
