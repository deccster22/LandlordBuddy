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
  resolveLauncherCurrentMatterExecutionRoutingFromOfficialHandoffCheckpoint,
  resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterExecutionRouting.js";
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
    id: "output-lifecycle-execution-routing-1",
    matterId: "matter-lifecycle-execution-routing-1",
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
    matterId: "matter-lifecycle-execution-routing-1",
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
    matterId: "matter-lifecycle-execution-routing-1",
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
    sourceEventId: "execution-routing-event-1",
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
  "execution routing resolves resumed lifecycle metadata as neutral resume-available outcome",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "execution-routing-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const resolved = resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(
      buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );
    const routing = resolved.executionRouting;

    if (!routing || routing.outcome !== "RESUME_AVAILABLE") {
      throw new Error("Expected RESUME_AVAILABLE execution routing outcome.");
    }

    assert.equal(routing.clearanceInferred, false);
    assert.equal(routing.lifecycleResumeRecordPresent, true);
    assert.equal(routing.lifecycleActionPlanVisible, true);
    assert.equal(routing.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(routing.deletionRequestPresent, true);
    assert.equal(routing.deidentificationActionPresent, false);
    assert.equal(
      routing.launcherCurrentMatterLifecycleResumeRouting.status,
      "LIFECYCLE_RESUME_AVAILABLE"
    );

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
      assert.equal(field in routing, false);
    }
  }
);

test(
  "execution routing keeps NO_RECORD as no-record non-clearance outcome",
  () => {
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const resolved = resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(
      buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator: {
            matterId: "matter-lifecycle-execution-routing-missing",
            outputPackageId: "output-lifecycle-execution-routing-missing",
            lifecycleRequestId: "execution-routing-request-missing"
          }
        }
      })
    );
    const routing = resolved.executionRouting;

    if (!routing || routing.outcome !== "NO_LIFECYCLE_RECORD_FOUND") {
      throw new Error("Expected NO_LIFECYCLE_RECORD_FOUND execution routing outcome.");
    }

    assert.equal(routing.clearanceInferred, false);
    assert.equal(routing.lifecycleResumeRecordPresent, false);
    assert.equal(routing.lifecycleActionPlanVisible, false);
    assert.equal(routing.lifecycleRoute, "NONE");
    assert.equal(routing.deletionRequestPresent, false);
    assert.equal(routing.deidentificationActionPresent, false);
    assert.equal(
      routing.launcherCurrentMatterLifecycleResumeRouting.status,
      "LIFECYCLE_RECORD_NOT_FOUND"
    );
  }
);

test(
  "execution routing resolves malformed lifecycle records to cannot-safely-resume outcome",
  () => {
    const locator = {
      matterId: "matter-lifecycle-execution-routing-malformed",
      outputPackageId: "output-lifecycle-execution-routing-malformed",
      lifecycleRequestId: "execution-routing-request-malformed"
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
    const resolved = resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(
      buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })
    );
    const routing = resolved.executionRouting;

    if (!routing || routing.outcome !== "CANNOT_SAFELY_RESUME_RECORD") {
      throw new Error("Expected CANNOT_SAFELY_RESUME_RECORD execution routing outcome.");
    }

    assert.equal(routing.clearanceInferred, false);
    assert.equal(routing.lifecycleResumeRecordPresent, false);
    assert.equal(routing.lifecycleActionPlanVisible, false);
    assert.equal(routing.lifecycleRoute, "NONE");
    assert.equal(routing.deletionRequestPresent, false);
    assert.equal(routing.deidentificationActionPresent, false);
    assert.equal(routing.resumeRecordKey, key);
    assert.equal(routing.malformedLifecycleRecord, true);
    assert.match(routing.malformedLifecycleRecordErrorMessage, /malformed/i);
    assert.equal(resolved.hydratedCheckpoint, undefined);
  }
);

test(
  "execution routing keeps hold-aware lifecycle state visible",
  () => {
    const holdScope = createPreservationScope({
      id: "execution-routing-hold-scope-4",
      matterId: "matter-lifecycle-execution-routing-4",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-execution-routing-4",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "execution-routing-hold-4",
      matterId: "matter-lifecycle-execution-routing-4",
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
        id: "output-lifecycle-execution-routing-4",
        matterId: "matter-lifecycle-execution-routing-4"
      }),
      holdFlags: [hold],
      lifecycleRequest: {
        id: "execution-routing-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const resolved = resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-execution-routing-4",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );
    const routing = resolved.executionRouting;

    if (!routing || routing.outcome !== "RESUME_AVAILABLE") {
      throw new Error("Expected RESUME_AVAILABLE execution routing outcome.");
    }

    assert.equal(routing.holdAwareLifecycleStatePresent, true);
    assert.equal(routing.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(routing.deletionRequestPresent, false);
    assert.equal(routing.deidentificationActionPresent, true);
  }
);

test(
  "execution routing keeps release-controlled lifecycle state visible",
  () => {
    const holdScope = createPreservationScope({
      id: "execution-routing-hold-scope-5",
      matterId: "matter-lifecycle-execution-routing-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-execution-routing-5",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "execution-routing-hold-5",
      matterId: "matter-lifecycle-execution-routing-5",
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
        id: "output-lifecycle-execution-routing-5",
        matterId: "matter-lifecycle-execution-routing-5"
      }),
      holdFlags: [hold],
      holdCommands: [
        {
          id: "execution-routing-hold-command-5a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:05:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id
        },
        {
          id: "execution-routing-hold-command-5b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-04-28T11:10:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "execution-routing-request-5",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const resolved = resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-execution-routing-5",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    );
    const routing = resolved.executionRouting;

    if (!routing || routing.outcome !== "RESUME_AVAILABLE") {
      throw new Error("Expected RESUME_AVAILABLE execution routing outcome.");
    }

    assert.equal(routing.holdAwareLifecycleStatePresent, false);
    assert.equal(routing.releaseControlledLifecycleStatePresent, true);
    assert.equal(routing.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(routing.deletionRequestPresent, true);
    assert.equal(routing.deidentificationActionPresent, false);
  }
);

test(
  "execution routing preserves deletion versus de-identification distinction",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-routing-6a",
        matterId: "matter-lifecycle-execution-routing-6"
      }),
      lifecycleRequest: {
        id: "execution-routing-request-6a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-routing-6b",
        matterId: "matter-lifecycle-execution-routing-6"
      }),
      lifecycleRequest: {
        id: "execution-routing-request-6b",
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
    const deletionResolved = resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(
      buildHydrateOutputInput({
        matterId: "matter-lifecycle-execution-routing-6",
        outputPackageLifecycleResumeCheckpoint: deletionResumeCheckpoint
      })
    );
    const deidentificationResolved =
      resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint(
        buildHydrateOutputInput({
          matterId: "matter-lifecycle-execution-routing-6",
          outputPackageLifecycleResumeCheckpoint: deidentificationResumeCheckpoint
        })
      );
    const deletionRouting = deletionResolved.executionRouting;
    const deidentificationRouting = deidentificationResolved.executionRouting;

    if (
      !deletionRouting
      || deletionRouting.outcome !== "RESUME_AVAILABLE"
      || !deidentificationRouting
      || deidentificationRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected RESUME_AVAILABLE execution routing outcomes.");
    }

    assert.equal(deletionRouting.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(deletionRouting.deletionRequestPresent, true);
    assert.equal(deletionRouting.deidentificationActionPresent, false);
    assert.equal(deidentificationRouting.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(deidentificationRouting.deletionRequestPresent, false);
    assert.equal(deidentificationRouting.deidentificationActionPresent, true);
  }
);

test(
  "execution routing is additive and leaves output/handoff trust semantics unchanged",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-execution-routing-7",
        matterId: "matter-lifecycle-execution-routing-7"
      }),
      lifecycleRequest: {
        id: "execution-routing-request-7",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-28T13:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputInput = buildHydrateOutputInput({
      matterId: "matter-lifecycle-execution-routing-7",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const handoffInput = buildHydrateHandoffInput({
      matterId: "matter-lifecycle-execution-routing-7",
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
    const resolvedOutputRouting = resolveLauncherCurrentMatterExecutionRoutingFromOutputCheckpoint({
      ...outputInput,
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    }).executionRouting;
    const resolvedHandoffRouting =
      resolveLauncherCurrentMatterExecutionRoutingFromOfficialHandoffCheckpoint({
        ...handoffInput,
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      }).executionRouting;

    if (
      !resolvedOutputRouting
      || resolvedOutputRouting.outcome !== "RESUME_AVAILABLE"
      || !resolvedHandoffRouting
      || resolvedHandoffRouting.outcome !== "RESUME_AVAILABLE"
    ) {
      throw new Error("Expected RESUME_AVAILABLE execution routing outcomes.");
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
