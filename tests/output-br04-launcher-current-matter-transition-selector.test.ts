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
  coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterFollowOnRouteCoordinator.js";
import {
  selectLauncherCurrentMatterInternalTransition,
  selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterTransitionSelector.js";
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
    id: "output-lifecycle-transition-selector-1",
    matterId: "matter-lifecycle-transition-selector-1",
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
    matterId: "matter-lifecycle-transition-selector-1",
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
    matterId: "matter-lifecycle-transition-selector-1",
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
    sourceEventId: "transition-selector-event-1",
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
  "transition selector consumes coordinator decision",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "transition-selector-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const routingInput = buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const coordinatorDecision =
      coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(routingInput);
    const directSelection = selectLauncherCurrentMatterInternalTransition({
      coordinatorDecision
    });
    const fromCheckpointSelection =
      selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(routingInput);

    assert.deepEqual(fromCheckpointSelection, directSelection);
    assert.equal(directSelection.target, "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT");
    assert.equal(directSelection.handlingMode, "MODE_CONTINUE_WITH_LIFECYCLE_CONTEXT");
  }
);

test(
  "resumed lifecycle context maps to neutral continuation transition target/mode",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-selector-2",
        matterId: "matter-lifecycle-transition-selector-2"
      }),
      lifecycleRequest: {
        id: "transition-selector-request-2",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const selection = selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-selector-2",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (
      selection.target !== "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT"
      || selection.handlingMode !== "MODE_CONTINUE_WITH_LIFECYCLE_CONTEXT"
      || !selection.lifecycleExecutionRouting
      || selection.lifecycleExecutionRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected lifecycle-context continuation transition selection.");
    }

    assert.equal(selection.clearanceInferred, false);
    assert.equal(selection.proceedWithInternalTransition, true);
    assert.equal(selection.noRecordNonClearanceHandling, false);
    assert.equal(selection.failSafeHoldHandling, false);
    assert.equal(selection.explicitNoRoutingSignalHandling, false);
    assert.equal(selection.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(selection.deletionRequestPresent, true);
    assert.equal(selection.deidentificationActionPresent, false);
  }
);

test(
  "no-record non-clearance maps to no-record transition target/mode and not clearance",
  () => {
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const selection = selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
      buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator: {
            matterId: "matter-lifecycle-transition-selector-missing",
            outputPackageId: "output-lifecycle-transition-selector-missing",
            lifecycleRequestId: "transition-selector-request-missing"
          }
        }
      })
    );

    if (
      selection.target !== "TRANSITION_CONTINUE_NO_RECORD_NON_CLEARANCE"
      || selection.handlingMode !== "MODE_CONTINUE_WITH_NO_RECORD_NON_CLEARANCE"
      || !selection.lifecycleExecutionRouting
      || selection.lifecycleExecutionRouting.outcome !== "NO_LIFECYCLE_RECORD_FOUND"
    ) {
      throw new Error("Expected no-record non-clearance transition selection.");
    }

    assert.equal(selection.clearanceInferred, false);
    assert.equal(selection.proceedWithInternalTransition, true);
    assert.equal(selection.noRecordNonClearanceHandling, true);
    assert.equal(selection.failSafeHoldHandling, false);
    assert.equal(selection.explicitNoRoutingSignalHandling, false);
    assert.equal(selection.lifecycleRoute, "NONE");
    assert.equal(selection.deletionRequestPresent, false);
    assert.equal(selection.deidentificationActionPresent, false);
  }
);

test(
  "cannot-safely-resume maps to fail-safe hold transition target/mode",
  () => {
    const locator = {
      matterId: "matter-lifecycle-transition-selector-malformed",
      outputPackageId: "output-lifecycle-transition-selector-malformed",
      lifecycleRequestId: "transition-selector-request-malformed"
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
    const selection = selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
      buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })
    );

    if (
      selection.target !== "TRANSITION_HOLD_CANNOT_SAFELY_RESUME"
      || selection.handlingMode !== "MODE_HOLD_CANNOT_SAFELY_RESUME"
      || !selection.lifecycleExecutionRouting
      || selection.lifecycleExecutionRouting.outcome !== "CANNOT_SAFELY_RESUME_RECORD"
    ) {
      throw new Error("Expected fail-safe hold transition selection.");
    }

    assert.equal(selection.clearanceInferred, false);
    assert.equal(selection.proceedWithInternalTransition, false);
    assert.equal(selection.noRecordNonClearanceHandling, false);
    assert.equal(selection.failSafeHoldHandling, true);
    assert.equal(selection.explicitNoRoutingSignalHandling, false);
    assert.equal(selection.lifecycleRoute, "NONE");
    assert.equal(selection.deletionRequestPresent, false);
    assert.equal(selection.deidentificationActionPresent, false);
  }
);

test(
  "no-routing-signal maps to explicit no-signal target/mode and not default success",
  () => {
    const selection = selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
      buildHydrateOutputInput()
    );

    if (
      selection.target !== "TRANSITION_EXPLICIT_NO_ROUTING_SIGNAL"
      || selection.handlingMode !== "MODE_EXPLICIT_NO_ROUTING_SIGNAL"
    ) {
      throw new Error("Expected explicit no-routing-signal transition selection.");
    }

    assert.equal(selection.clearanceInferred, false);
    assert.equal(selection.proceedWithInternalTransition, false);
    assert.equal(selection.noRecordNonClearanceHandling, false);
    assert.equal(selection.failSafeHoldHandling, false);
    assert.equal(selection.explicitNoRoutingSignalHandling, true);
    assert.equal(selection.lifecycleExecutionRouting, undefined);
  }
);

test(
  "hold-aware state remains visible in transition metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "transition-selector-hold-scope-4",
      matterId: "matter-lifecycle-transition-selector-4",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-transition-selector-4",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "transition-selector-hold-4",
      matterId: "matter-lifecycle-transition-selector-4",
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
        id: "output-lifecycle-transition-selector-4",
        matterId: "matter-lifecycle-transition-selector-4"
      }),
      holdFlags: [hold],
      lifecycleRequest: {
        id: "transition-selector-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const selection = selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-selector-4",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (selection.target !== "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT") {
      throw new Error("Expected lifecycle-context continuation transition selection.");
    }

    assert.equal(selection.holdAwareLifecycleStatePresent, true);
    assert.equal(selection.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(selection.deletionRequestPresent, false);
    assert.equal(selection.deidentificationActionPresent, true);
  }
);

test(
  "release-controlled state remains visible in transition metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "transition-selector-hold-scope-5",
      matterId: "matter-lifecycle-transition-selector-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-transition-selector-5",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "transition-selector-hold-5",
      matterId: "matter-lifecycle-transition-selector-5",
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
        id: "output-lifecycle-transition-selector-5",
        matterId: "matter-lifecycle-transition-selector-5"
      }),
      holdFlags: [hold],
      holdCommands: [
        {
          id: "transition-selector-hold-command-5a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:05:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id
        },
        {
          id: "transition-selector-hold-command-5b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:10:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "transition-selector-request-5",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const selection = selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-selector-5",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (selection.target !== "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT") {
      throw new Error("Expected lifecycle-context continuation transition selection.");
    }

    assert.equal(selection.holdAwareLifecycleStatePresent, false);
    assert.equal(selection.releaseControlledLifecycleStatePresent, true);
    assert.equal(selection.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(selection.deletionRequestPresent, true);
    assert.equal(selection.deidentificationActionPresent, false);
  }
);

test(
  "deletion/de-identification distinction is preserved in transition metadata",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-selector-6a",
        matterId: "matter-lifecycle-transition-selector-6"
      }),
      lifecycleRequest: {
        id: "transition-selector-request-6a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-selector-6b",
        matterId: "matter-lifecycle-transition-selector-6"
      }),
      lifecycleRequest: {
        id: "transition-selector-request-6b",
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
    const deletionSelection = selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-selector-6",
        outputPackageLifecycleResumeCheckpoint: deletionResumeCheckpoint
      })
    );
    const deidentificationSelection =
      selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
        buildHydrateOutputInput({
          matterId: "matter-lifecycle-transition-selector-6",
          outputPackageLifecycleResumeCheckpoint: deidentificationResumeCheckpoint
        })
      );

    if (
      deletionSelection.target !== "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT"
      || deidentificationSelection.target !== "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT"
    ) {
      throw new Error("Expected lifecycle-context continuation transition selections.");
    }

    assert.equal(deletionSelection.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(deletionSelection.deletionRequestPresent, true);
    assert.equal(deletionSelection.deidentificationActionPresent, false);
    assert.equal(deidentificationSelection.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(deidentificationSelection.deletionRequestPresent, false);
    assert.equal(deidentificationSelection.deidentificationActionPresent, true);
  }
);

test(
  "transition selector introduces no UI/copy/status-label/CTA fields",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-selector-7",
        matterId: "matter-lifecycle-transition-selector-7"
      }),
      lifecycleRequest: {
        id: "transition-selector-request-7",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T12:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const selection = selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-transition-selector-7",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (
      selection.target !== "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT"
      || !selection.lifecycleExecutionRouting
    ) {
      throw new Error("Expected lifecycle-context continuation transition selection.");
    }

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
      assert.equal(field in selection, false);
      assert.equal(field in selection.coordinatorDecision, false);
      assert.equal(field in selection.lifecycleExecutionControl, false);
      assert.equal(field in selection.lifecycleExecutionRouting, false);
    }
  }
);

test(
  "transition selector is additive and leaves output/handoff trust semantics unchanged",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-transition-selector-8",
        matterId: "matter-lifecycle-transition-selector-8"
      }),
      lifecycleRequest: {
        id: "transition-selector-request-8",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T13:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputInput = buildHydrateOutputInput({
      matterId: "matter-lifecycle-transition-selector-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const handoffInput = buildHydrateHandoffInput({
      matterId: "matter-lifecycle-transition-selector-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const baselineOutput = composeOutputPackageFromHydratedCheckpoint(outputInput);
    const baselineHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint(handoffInput);
    const selection = selectLauncherCurrentMatterInternalTransitionFromOutputCheckpoint({
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

    if (selection.target !== "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT") {
      throw new Error("Expected lifecycle-context continuation transition selection.");
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
