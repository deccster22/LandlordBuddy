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
  consumeLauncherCurrentMatterExecutionDirective,
  consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterExecutionDirectiveConsumer.js";
import {
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
    id: "output-lifecycle-directive-consumer-1",
    matterId: "matter-lifecycle-directive-consumer-1",
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
    matterId: "matter-lifecycle-directive-consumer-1",
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
    matterId: "matter-lifecycle-directive-consumer-1",
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
    sourceEventId: "directive-consumer-event-1",
    sourceKind: "OFFICIAL_HANDOFF_CHECKPOINT",
    capturedAt: "2026-04-30T09:00:00.000Z",
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
  "directive consumer consumes orchestration output",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "directive-consumer-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-30T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const checkpoint = buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const orchestrationDecision =
      orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
        outputCheckpoint: checkpoint,
        nonLifecycleTransitionInput: {
          transitionHintCode: "UNCHANGED"
        }
      });
    const directDirective = consumeLauncherCurrentMatterExecutionDirective({
      orchestrationDecision
    });
    const fromCheckpointDirective =
      consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
        outputCheckpoint: checkpoint,
        nonLifecycleTransitionInput: {
          transitionHintCode: "UNCHANGED"
        }
      });

    assert.deepEqual(fromCheckpointDirective, directDirective);
  }
);

test(
  "directive keeps lifecycle and non-lifecycle slices separately inspectable",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-directive-consumer-2",
        matterId: "matter-lifecycle-directive-consumer-2"
      }),
      lifecycleRequest: {
        id: "directive-consumer-request-2",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-30T09:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const directive = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-directive-consumer-2",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      }),
      nonLifecycleTransitionInput: {
        progressionHoldRequested: true,
        unresolvedBlockerCodes: ["NON_LIFECYCLE_BLOCKER_A"],
        transitionHintCode: "RECHECK_CONTEXT"
      }
    });

    assert.equal(
      directive.lifecycleTransitionState.target,
      "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT"
    );
    assert.equal(
      directive.nonLifecycleTransitionState.posture,
      "NON_LIFECYCLE_HOLD_REQUESTED"
    );
    assert.equal(directive.nonLifecycleHoldRequested, true);
    assert.equal(
      directive.orchestrationDecision.nonLifecycleTransitionState.transitionHintCode,
      "RECHECK_CONTEXT"
    );
  }
);

test(
  "resumed lifecycle context maps to continuation directive without generic success language",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-directive-consumer-3",
        matterId: "matter-lifecycle-directive-consumer-3"
      }),
      lifecycleRequest: {
        id: "directive-consumer-request-3",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-30T09:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const directive = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-directive-consumer-3",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(directive.directive, "DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT");
    assert.equal(directive.clearanceInferred, false);
    assert.equal(directive.continueWithLifecycleContext, true);
    assert.equal(directive.continueWithoutLifecycleRecordNonClearance, false);
    assert.equal(directive.failSafeHoldDirective, false);
    assert.equal(directive.explicitNoLifecycleRoutingSignalDirective, false);
    assert.equal(directive.lifecycleRoute, "DELETION_REQUEST");
  }
);

test(
  "no-record non-clearance maps to internal no-record directive without clearance inference",
  () => {
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const directive = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator: {
            matterId: "matter-lifecycle-directive-consumer-missing",
            outputPackageId: "output-lifecycle-directive-consumer-missing",
            lifecycleRequestId: "directive-consumer-request-missing"
          }
        }
      })
    });

    assert.equal(directive.directive, "DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE");
    assert.equal(directive.clearanceInferred, false);
    assert.equal(directive.continueWithLifecycleContext, false);
    assert.equal(directive.continueWithoutLifecycleRecordNonClearance, true);
    assert.equal(directive.failSafeHoldDirective, false);
    assert.equal(directive.explicitNoLifecycleRoutingSignalDirective, false);
    assert.equal(directive.lifecycleRoute, "NONE");
  }
);

test(
  "cannot-safely-resume maps to fail-safe internal directive",
  () => {
    const locator = {
      matterId: "matter-lifecycle-directive-consumer-malformed",
      outputPackageId: "output-lifecycle-directive-consumer-malformed",
      lifecycleRequestId: "directive-consumer-request-malformed"
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
    const directive = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })
    });

    assert.equal(directive.directive, "DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME");
    assert.equal(directive.clearanceInferred, false);
    assert.equal(directive.proceedWithInternalExecution, false);
    assert.equal(directive.continueWithLifecycleContext, false);
    assert.equal(directive.continueWithoutLifecycleRecordNonClearance, false);
    assert.equal(directive.failSafeHoldDirective, true);
    assert.equal(directive.explicitNoLifecycleRoutingSignalDirective, false);
    assert.equal(directive.lifecycleRoute, "NONE");
  }
);

test(
  "no-routing-signal maps to explicit no-signal directive",
  () => {
    const directive = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput()
    });

    assert.equal(directive.directive, "DIRECTIVE_EXPLICIT_NO_ROUTING_SIGNAL");
    assert.equal(directive.clearanceInferred, false);
    assert.equal(directive.proceedWithInternalExecution, false);
    assert.equal(directive.continueWithLifecycleContext, false);
    assert.equal(directive.continueWithoutLifecycleRecordNonClearance, false);
    assert.equal(directive.failSafeHoldDirective, false);
    assert.equal(directive.explicitNoLifecycleRoutingSignalDirective, true);
  }
);

test(
  "hold-aware state remains visible in directive metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "directive-consumer-hold-scope-4",
      matterId: "matter-lifecycle-directive-consumer-4",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-directive-consumer-4",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "directive-consumer-hold-4",
      matterId: "matter-lifecycle-directive-consumer-4",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-04-30T10:00:00.000Z"
    });
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-directive-consumer-4",
        matterId: "matter-lifecycle-directive-consumer-4"
      }),
      holdFlags: [hold],
      lifecycleRequest: {
        id: "directive-consumer-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-30T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const directive = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-directive-consumer-4",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(directive.holdAwareLifecycleStatePresent, true);
    assert.equal(directive.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(directive.deletionRequestPresent, false);
    assert.equal(directive.deidentificationActionPresent, true);
  }
);

test(
  "release-controlled state remains visible in directive metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "directive-consumer-hold-scope-5",
      matterId: "matter-lifecycle-directive-consumer-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-directive-consumer-5",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "directive-consumer-hold-5",
      matterId: "matter-lifecycle-directive-consumer-5",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-04-30T11:00:00.000Z"
    });
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-directive-consumer-5",
        matterId: "matter-lifecycle-directive-consumer-5"
      }),
      holdFlags: [hold],
      holdCommands: [
        {
          id: "directive-consumer-hold-command-5a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-04-30T11:05:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id
        },
        {
          id: "directive-consumer-hold-command-5b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-04-30T11:10:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "directive-consumer-request-5",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-30T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const directive = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-directive-consumer-5",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(directive.holdAwareLifecycleStatePresent, false);
    assert.equal(directive.releaseControlledLifecycleStatePresent, true);
    assert.equal(directive.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(directive.deletionRequestPresent, true);
    assert.equal(directive.deidentificationActionPresent, false);
  }
);

test(
  "deletion/de-identification distinction is preserved in directive metadata",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-directive-consumer-6a",
        matterId: "matter-lifecycle-directive-consumer-6"
      }),
      lifecycleRequest: {
        id: "directive-consumer-request-6a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-30T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-directive-consumer-6b",
        matterId: "matter-lifecycle-directive-consumer-6"
      }),
      lifecycleRequest: {
        id: "directive-consumer-request-6b",
        requestedAction: "REQUEST_DEIDENTIFICATION",
        requestedAt: "2026-04-30T12:05:00.000Z",
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
    const deletionDirective = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-directive-consumer-6",
        outputPackageLifecycleResumeCheckpoint: deletionResumeCheckpoint
      })
    });
    const deidentificationDirective =
      consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-directive-consumer-6",
          outputPackageLifecycleResumeCheckpoint: deidentificationResumeCheckpoint
        })
      });

    assert.equal(deletionDirective.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(deletionDirective.deletionRequestPresent, true);
    assert.equal(deletionDirective.deidentificationActionPresent, false);
    assert.equal(deidentificationDirective.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(deidentificationDirective.deletionRequestPresent, false);
    assert.equal(deidentificationDirective.deidentificationActionPresent, true);
  }
);

test(
  "directive consumer introduces no UI/copy/status-label/CTA/screen-route/public-route-name fields",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-directive-consumer-7",
        matterId: "matter-lifecycle-directive-consumer-7"
      }),
      lifecycleRequest: {
        id: "directive-consumer-request-7",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-30T12:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const directive = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-directive-consumer-7",
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
      assert.equal(field in directive, false);
      assert.equal(field in directive.lifecycleTransitionState, false);
      assert.equal(field in directive.nonLifecycleTransitionState, false);
      assert.equal(field in directive.orchestrationDecision, false);
    }
  }
);

test(
  "directive consumer is additive and leaves output/handoff trust semantics unchanged",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-directive-consumer-8",
        matterId: "matter-lifecycle-directive-consumer-8"
      }),
      lifecycleRequest: {
        id: "directive-consumer-request-8",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-30T13:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputInput = buildHydrateOutputInput({
      matterId: "matter-lifecycle-directive-consumer-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const handoffInput = buildHydrateHandoffInput({
      matterId: "matter-lifecycle-directive-consumer-8",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const baselineOutput = composeOutputPackageFromHydratedCheckpoint(outputInput);
    const baselineHandoff = composeOfficialHandoffGuidanceFromHydratedCheckpoint(handoffInput);
    const directive = consumeLauncherCurrentMatterExecutionDirectiveFromOutputCheckpoint({
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

    assert.equal(directive.directive, "DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT");

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
