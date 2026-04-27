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
  type HydrateOfficialHandoffCheckpointInput,
  type HydrateOutputCheckpointInput,
  type OutputPackageLifecycleResumeCheckpointInput
} from "../src/app/outputHandoffCheckpointHydration.js";
import {
  deriveLauncherCurrentMatterLifecycleResumeRoutingSignal
} from "../src/app/launcherCurrentMatterLifecycleResumeAdapter.js";
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
    id: "output-lifecycle-launcher-resume-1",
    matterId: "matter-lifecycle-launcher-resume-1",
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
    matterId: "matter-lifecycle-launcher-resume-1",
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
    matterId: "matter-lifecycle-launcher-resume-1",
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
    sourceEventId: "launcher-resume-event-1",
    sourceKind: "OFFICIAL_HANDOFF_CHECKPOINT",
    capturedAt: "2026-04-27T09:00:00.000Z",
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
  "launcher/current-matter adapter consumes resumed lifecycle checkpoint into neutral routing metadata",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "launcher-resume-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-27T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const hydrated = hydrateOutputCheckpointForComposition(buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    }));
    const routing = hydrated.launcherCurrentMatterLifecycleResumeRouting;
    const resume = hydrated.outputPackageLifecycleResume;

    if (!routing || !resume || resume.status !== "RESUMED") {
      throw new Error("Expected resumed lifecycle routing metadata.");
    }

    const directRouting = deriveLauncherCurrentMatterLifecycleResumeRoutingSignal(resume);

    assert.equal(routing.status, "LIFECYCLE_RESUME_AVAILABLE");
    assert.equal(routing.checkpointStatus, "RESUMED");
    assert.equal(routing.lifecycleResumeRecordPresent, true);
    assert.equal(routing.clearanceInferred, false);
    assert.equal(routing.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(routing.deletionRequestPresent, true);
    assert.equal(routing.deidentificationActionPresent, false);
    assert.equal(routing.holdAwareLifecycleStatePresent, false);
    assert.equal(routing.releaseControlledLifecycleStatePresent, false);
    assert.equal(routing.resumeRecordKey, resume.key);
    assert.deepEqual(routing, directRouting);
  }
);

test(
  "launcher/current-matter adapter maps NO_RECORD as non-clearance routing metadata",
  () => {
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const hydrated = hydrateOutputCheckpointForComposition(buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: {
        store,
        locator: {
          matterId: "matter-lifecycle-launcher-resume-missing",
          outputPackageId: "output-lifecycle-launcher-resume-missing",
          lifecycleRequestId: "launcher-resume-request-missing"
        }
      }
    }));
    const routing = hydrated.launcherCurrentMatterLifecycleResumeRouting;
    const resume = hydrated.outputPackageLifecycleResume;

    if (!routing || !resume || resume.status !== "NO_RECORD") {
      throw new Error("Expected no-record lifecycle routing metadata.");
    }

    assert.equal(routing.status, "LIFECYCLE_RECORD_NOT_FOUND");
    assert.equal(routing.checkpointStatus, "NO_RECORD");
    assert.equal(routing.lifecycleResumeRecordPresent, false);
    assert.equal(routing.clearanceInferred, false);
    assert.equal(routing.lifecycleRoute, "NONE");
    assert.equal(routing.deletionRequestPresent, false);
    assert.equal(routing.deidentificationActionPresent, false);
    assert.equal(routing.holdAwareLifecycleStatePresent, false);
    assert.equal(routing.releaseControlledLifecycleStatePresent, false);
    assert.equal(routing.resumeRecordKey, resume.key);
  }
);

test(
  "launcher/current-matter adapter keeps malformed lifecycle checkpoint payloads fail-loud",
  () => {
    const locator = {
      matterId: "matter-lifecycle-launcher-resume-malformed",
      outputPackageId: "output-lifecycle-launcher-resume-malformed",
      lifecycleRequestId: "launcher-resume-request-malformed"
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
      () => hydrateOutputCheckpointForComposition(buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })),
      /malformed output-package lifecycle orchestration record/i
    );
  }
);

test(
  "launcher/current-matter adapter keeps hold-aware lifecycle state visible in routing metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "launcher-resume-hold-scope-4",
      matterId: "matter-lifecycle-launcher-resume-4",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-launcher-resume-4",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "launcher-resume-hold-4",
      matterId: "matter-lifecycle-launcher-resume-4",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-04-27T10:00:00.000Z"
    });
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-launcher-resume-4",
        matterId: "matter-lifecycle-launcher-resume-4"
      }),
      holdFlags: [hold],
      lifecycleRequest: {
        id: "launcher-resume-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-27T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const hydrated = hydrateOutputCheckpointForComposition(buildHydrateOutputInput({
      matterId: "matter-lifecycle-launcher-resume-4",
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    }));
    const routing = hydrated.launcherCurrentMatterLifecycleResumeRouting;

    if (!routing) {
      throw new Error("Expected lifecycle routing metadata.");
    }

    assert.equal(routing.status, "LIFECYCLE_RESUME_AVAILABLE");
    assert.equal(routing.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(routing.holdAwareLifecycleStatePresent, true);
    assert.equal(routing.deletionRequestPresent, false);
    assert.equal(routing.deidentificationActionPresent, true);
  }
);

test(
  "launcher/current-matter adapter keeps release-controlled lifecycle state visible in routing metadata",
  () => {
    const holdScope = createPreservationScope({
      id: "launcher-resume-hold-scope-5",
      matterId: "matter-lifecycle-launcher-resume-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-launcher-resume-5",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "launcher-resume-hold-5",
      matterId: "matter-lifecycle-launcher-resume-5",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-04-27T11:00:00.000Z"
    });
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-launcher-resume-5",
        matterId: "matter-lifecycle-launcher-resume-5"
      }),
      holdFlags: [hold],
      holdCommands: [
        {
          id: "launcher-resume-hold-command-5a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-04-27T11:05:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id
        },
        {
          id: "launcher-resume-hold-command-5b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-04-27T11:10:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "launcher-resume-request-5",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-27T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const hydrated = hydrateOutputCheckpointForComposition(buildHydrateOutputInput({
      matterId: "matter-lifecycle-launcher-resume-5",
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    }));
    const routing = hydrated.launcherCurrentMatterLifecycleResumeRouting;

    if (!routing) {
      throw new Error("Expected lifecycle routing metadata.");
    }

    assert.equal(routing.status, "LIFECYCLE_RESUME_AVAILABLE");
    assert.equal(routing.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(routing.holdAwareLifecycleStatePresent, false);
    assert.equal(routing.releaseControlledLifecycleStatePresent, true);
    assert.equal(routing.deletionRequestPresent, true);
    assert.equal(routing.deidentificationActionPresent, false);
  }
);

test(
  "launcher/current-matter adapter keeps deletion and de-identification routes distinguishable",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-launcher-resume-6a",
        matterId: "matter-lifecycle-launcher-resume-6"
      }),
      lifecycleRequest: {
        id: "launcher-resume-request-6a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-27T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-launcher-resume-6b",
        matterId: "matter-lifecycle-launcher-resume-6"
      }),
      lifecycleRequest: {
        id: "launcher-resume-request-6b",
        requestedAction: "REQUEST_DEIDENTIFICATION",
        requestedAt: "2026-04-27T12:05:00.000Z",
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
    const deletionHydrated = hydrateOutputCheckpointForComposition(buildHydrateOutputInput({
      matterId: "matter-lifecycle-launcher-resume-6",
      outputPackageLifecycleResumeCheckpoint: deletionResumeCheckpoint
    }));
    const deidentificationHydrated = hydrateOutputCheckpointForComposition(buildHydrateOutputInput({
      matterId: "matter-lifecycle-launcher-resume-6",
      outputPackageLifecycleResumeCheckpoint: deidentificationResumeCheckpoint
    }));
    const deletionRouting = deletionHydrated.launcherCurrentMatterLifecycleResumeRouting;
    const deidentificationRouting = deidentificationHydrated.launcherCurrentMatterLifecycleResumeRouting;

    if (!deletionRouting || !deidentificationRouting) {
      throw new Error("Expected lifecycle routing metadata for both routes.");
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
  "launcher/current-matter routing metadata is additive and does not change output/handoff trust semantics",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-launcher-resume-7",
        matterId: "matter-lifecycle-launcher-resume-7"
      }),
      lifecycleRequest: {
        id: "launcher-resume-request-7",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-04-27T13:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputInput = buildHydrateOutputInput({
      matterId: "matter-lifecycle-launcher-resume-7",
      touchpointIds: ["vic-arrears-public-form-warning"],
      out04TouchpointSourceEvents: [
        createSourceEvent({
          wrongChannelSignal: true
        })
      ]
    });
    const handoffInput = buildHydrateHandoffInput({
      matterId: "matter-lifecycle-launcher-resume-7",
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
    assert.equal(
      resumedOutput.launcherCurrentMatterLifecycleResumeRouting?.status,
      "LIFECYCLE_RESUME_AVAILABLE"
    );
    assert.equal(
      resumedHandoff.launcherCurrentMatterLifecycleResumeRouting?.status,
      "LIFECYCLE_RESUME_AVAILABLE"
    );
  }
);
