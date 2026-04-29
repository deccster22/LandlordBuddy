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
  resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterExecutionCaller.js";
import {
  coordinateLauncherCurrentMatterFollowOnRoute,
  coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterFollowOnRouteCoordinator.js";
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
    id: "output-lifecycle-route-coordinator-1",
    matterId: "matter-lifecycle-route-coordinator-1",
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
    matterId: "matter-lifecycle-route-coordinator-1",
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
    matterId: "matter-lifecycle-route-coordinator-1",
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
    sourceEventId: "route-coordinator-event-1",
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
  "coordinator consumes internal caller result",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "route-coordinator-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const routingInput = buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const internalControl = resolveLauncherCurrentMatterExecutionControlFromOutputCheckpoint(
      routingInput
    );
    const directDecision = coordinateLauncherCurrentMatterFollowOnRoute({
      lifecycleExecutionControl: internalControl
    });
    const fromCheckpointDecision =
      coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(routingInput);

    assert.deepEqual(fromCheckpointDecision, directDecision);
    assert.equal(directDecision.lifecycleExecutionControl.outcome, "RESUME_AVAILABLE_CONTROL");
    assert.equal(directDecision.lifecycleExecutionRouting?.outcome, "RESUME_AVAILABLE");
  }
);

test(
  "coordinator maps resumed lifecycle control to neutral continuation with lifecycle context",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-route-coordinator-2",
        matterId: "matter-lifecycle-route-coordinator-2"
      }),
      lifecycleRequest: {
        id: "route-coordinator-request-2",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const decision = coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-route-coordinator-2",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (
      decision.outcome !== "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT"
      || !decision.lifecycleExecutionRouting
      || decision.lifecycleExecutionRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT decision.");
    }

    assert.equal(decision.clearanceInferred, false);
    assert.equal(decision.continueWithLifecycleResumeContext, true);
    assert.equal(decision.continueWithNoLifecycleRecordNonClearance, false);
    assert.equal(decision.failSafeHandlingRequired, false);
    assert.equal(decision.explicitNoLifecycleRoutingSignalHandling, false);
    assert.equal(decision.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(decision.deletionRequestPresent, true);
    assert.equal(decision.deidentificationActionPresent, false);
  }
);

test(
  "coordinator maps NO_RECORD_NON_CLEARANCE_CONTROL to no-record non-clearance handling",
  () => {
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const decision = coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
      buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator: {
            matterId: "matter-lifecycle-route-coordinator-missing",
            outputPackageId: "output-lifecycle-route-coordinator-missing",
            lifecycleRequestId: "route-coordinator-request-missing"
          }
        }
      })
    );

    if (
      decision.outcome !== "CONTINUE_WITH_NO_RECORD_NON_CLEARANCE"
      || !decision.lifecycleExecutionRouting
      || decision.lifecycleExecutionRouting.outcome !== "NO_LIFECYCLE_RECORD_FOUND"
    ) {
      throw new Error("Expected CONTINUE_WITH_NO_RECORD_NON_CLEARANCE decision.");
    }

    assert.equal(decision.clearanceInferred, false);
    assert.equal(decision.continueWithLifecycleResumeContext, false);
    assert.equal(decision.continueWithNoLifecycleRecordNonClearance, true);
    assert.equal(decision.failSafeHandlingRequired, false);
    assert.equal(decision.explicitNoLifecycleRoutingSignalHandling, false);
    assert.equal(decision.lifecycleRoute, "NONE");
    assert.equal(decision.deletionRequestPresent, false);
    assert.equal(decision.deidentificationActionPresent, false);
  }
);

test(
  "coordinator maps CANNOT_SAFELY_RESUME_CONTROL to fail-safe handling",
  () => {
    const locator = {
      matterId: "matter-lifecycle-route-coordinator-malformed",
      outputPackageId: "output-lifecycle-route-coordinator-malformed",
      lifecycleRequestId: "route-coordinator-request-malformed"
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
    const decision = coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
      buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })
    );

    if (
      decision.outcome !== "HOLD_FOR_CANNOT_SAFELY_RESUME"
      || !decision.lifecycleExecutionRouting
      || decision.lifecycleExecutionRouting.outcome !== "CANNOT_SAFELY_RESUME_RECORD"
    ) {
      throw new Error("Expected HOLD_FOR_CANNOT_SAFELY_RESUME decision.");
    }

    assert.equal(decision.clearanceInferred, false);
    assert.equal(decision.continueWithLifecycleResumeContext, false);
    assert.equal(decision.continueWithNoLifecycleRecordNonClearance, false);
    assert.equal(decision.failSafeHandlingRequired, true);
    assert.equal(decision.explicitNoLifecycleRoutingSignalHandling, false);
    assert.equal(decision.lifecycleRoute, "NONE");
    assert.equal(decision.deletionRequestPresent, false);
    assert.equal(decision.deidentificationActionPresent, false);
  }
);

test(
  "coordinator handles NO_LIFECYCLE_ROUTING_SIGNAL explicitly without default success",
  () => {
    const decision = coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
      buildHydrateOutputInput()
    );

    if (decision.outcome !== "EXPLICIT_NO_LIFECYCLE_ROUTING_SIGNAL") {
      throw new Error("Expected EXPLICIT_NO_LIFECYCLE_ROUTING_SIGNAL decision.");
    }

    assert.equal(decision.clearanceInferred, false);
    assert.equal(decision.continueWithLifecycleResumeContext, false);
    assert.equal(decision.continueWithNoLifecycleRecordNonClearance, false);
    assert.equal(decision.failSafeHandlingRequired, false);
    assert.equal(decision.explicitNoLifecycleRoutingSignalHandling, true);
    assert.equal(decision.lifecycleExecutionRouting, undefined);
    assert.equal(decision.lifecycleRoute, "NONE");
  }
);

test(
  "coordinator retains hold-aware lifecycle state in follow-on context",
  () => {
    const holdScope = createPreservationScope({
      id: "route-coordinator-hold-scope-4",
      matterId: "matter-lifecycle-route-coordinator-4",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-route-coordinator-4",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "route-coordinator-hold-4",
      matterId: "matter-lifecycle-route-coordinator-4",
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
        id: "output-lifecycle-route-coordinator-4",
        matterId: "matter-lifecycle-route-coordinator-4"
      }),
      holdFlags: [hold],
      lifecycleRequest: {
        id: "route-coordinator-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const decision = coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-route-coordinator-4",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (decision.outcome !== "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT") {
      throw new Error("Expected CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT decision.");
    }

    assert.equal(decision.holdAwareLifecycleStatePresent, true);
    assert.equal(decision.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(decision.deletionRequestPresent, false);
    assert.equal(decision.deidentificationActionPresent, true);
  }
);

test(
  "coordinator retains release-controlled lifecycle state in follow-on context",
  () => {
    const holdScope = createPreservationScope({
      id: "route-coordinator-hold-scope-5",
      matterId: "matter-lifecycle-route-coordinator-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-route-coordinator-5",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "route-coordinator-hold-5",
      matterId: "matter-lifecycle-route-coordinator-5",
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
        id: "output-lifecycle-route-coordinator-5",
        matterId: "matter-lifecycle-route-coordinator-5"
      }),
      holdFlags: [hold],
      holdCommands: [
        {
          id: "route-coordinator-hold-command-5a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:05:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id
        },
        {
          id: "route-coordinator-hold-command-5b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:10:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "route-coordinator-request-5",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const decision = coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-route-coordinator-5",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (decision.outcome !== "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT") {
      throw new Error("Expected CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT decision.");
    }

    assert.equal(decision.holdAwareLifecycleStatePresent, false);
    assert.equal(decision.releaseControlledLifecycleStatePresent, true);
    assert.equal(decision.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(decision.deletionRequestPresent, true);
    assert.equal(decision.deidentificationActionPresent, false);
  }
);

test(
  "coordinator preserves deletion/de-identification distinction in follow-on context",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-route-coordinator-6a",
        matterId: "matter-lifecycle-route-coordinator-6"
      }),
      lifecycleRequest: {
        id: "route-coordinator-request-6a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-route-coordinator-6b",
        matterId: "matter-lifecycle-route-coordinator-6"
      }),
      lifecycleRequest: {
        id: "route-coordinator-request-6b",
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
    const deletionDecision = coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-route-coordinator-6",
        outputPackageLifecycleResumeCheckpoint: deletionResumeCheckpoint
      })
    );
    const deidentificationDecision =
      coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
        buildHydrateOutputInput({
          matterId: "matter-lifecycle-route-coordinator-6",
          outputPackageLifecycleResumeCheckpoint: deidentificationResumeCheckpoint
        })
      );

    if (
      deletionDecision.outcome !== "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT"
      || deidentificationDecision.outcome !== "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT"
    ) {
      throw new Error("Expected CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT decisions.");
    }

    assert.equal(deletionDecision.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(deletionDecision.deletionRequestPresent, true);
    assert.equal(deletionDecision.deidentificationActionPresent, false);
    assert.equal(deidentificationDecision.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(deidentificationDecision.deletionRequestPresent, false);
    assert.equal(deidentificationDecision.deidentificationActionPresent, true);
  }
);

test(
  "coordinator introduces no UI/copy fields",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-route-coordinator-7",
        matterId: "matter-lifecycle-route-coordinator-7"
      }),
      lifecycleRequest: {
        id: "route-coordinator-request-7",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T12:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const decision = coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-route-coordinator-7",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );

    if (
      decision.outcome !== "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT"
      || !decision.lifecycleExecutionRouting
    ) {
      throw new Error("Expected CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT decision.");
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
      assert.equal(field in decision, false);
      assert.equal(field in decision.lifecycleExecutionControl, false);
      assert.equal(field in decision.lifecycleExecutionRouting, false);
    }
  }
);

test(
  "coordinator is additive and leaves output/handoff trust semantics unchanged",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-route-coordinator-8",
        matterId: "matter-lifecycle-route-coordinator-8"
      }),
      lifecycleRequest: {
        id: "route-coordinator-request-8",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T13:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputInput = buildHydrateOutputInput({
      matterId: "matter-lifecycle-route-coordinator-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const handoffInput = buildHydrateHandoffInput({
      matterId: "matter-lifecycle-route-coordinator-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const baselineOutput = composeOutputPackageFromHydratedCheckpoint(outputInput);
    const baselineHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint(handoffInput);
    const decision = coordinateLauncherCurrentMatterFollowOnRouteFromOutputCheckpoint({
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

    if (decision.outcome !== "CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT") {
      throw new Error("Expected CONTINUE_WITH_LIFECYCLE_RESUME_CONTEXT decision.");
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
