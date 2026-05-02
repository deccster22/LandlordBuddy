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
import type {
  HydrateOutputCheckpointInput,
  OutputPackageLifecycleResumeCheckpointInput
} from "../src/app/outputHandoffCheckpointHydration.js";
import {
  consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterHandlingActionConsumer.js";
import {
  createInMemoryLauncherCurrentMatterWatchpointEventSink,
  launcherCurrentMatterWatchpointForbiddenSemanticTokens
} from "../src/app/launcherCurrentMatterWatchpointLoggingEmitter.js";
import {
  consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterWatchpointWiredCaller.js";
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
    id: "output-lifecycle-watchpoint-wired-caller-1",
    matterId: "matter-lifecycle-watchpoint-wired-caller-1",
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
    matterId: "matter-lifecycle-watchpoint-wired-caller-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-freshness-watch"],
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
  "sink-injected caller emits expected watchpoint events for lifecycle-context path",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "watchpoint-wired-caller-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-04T09:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const { emittedWatchpointEvents, handlingAction } =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
        }),
        watchpointSink: sink,
        watchpointObservedAt: "2026-05-04T09:01:00.000Z"
      });

    assert.equal(handlingAction.handlingAction, "ACTION_CONTINUE_INTERNAL_WITH_LIFECYCLE_CONTEXT");
    assert.equal(emittedWatchpointEvents.length >= 3, true);
    assert.deepEqual(sink.readEvents(), emittedWatchpointEvents);
    assert.equal(
      emittedWatchpointEvents.some(
        (event) => event.eventType === "WATCH_LIFECYCLE_RESUME_STATE_OBSERVED"
      ),
      true
    );
    assert.equal(
      emittedWatchpointEvents.some(
        (event) => event.eventType === "WATCH_LIFECYCLE_NONLIFECYCLE_SEPARATION_OBSERVED"
      ),
      true
    );
    assert.equal(
      emittedWatchpointEvents.some(
        (event) => event.eventType === "WATCH_LIFECYCLE_ACTION_ROUTE_OBSERVED"
      ),
      true
    );
  }
);

test(
  "sink-injected caller emits no-record, cannot-safely-resume, and explicit no-signal flags",
  () => {
    const missingStore = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const missingSink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const missingResult =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          outputPackageLifecycleResumeCheckpoint: {
            store: missingStore,
            locator: {
              matterId: "matter-lifecycle-watchpoint-wired-caller-missing",
              outputPackageId: "output-lifecycle-watchpoint-wired-caller-missing",
              lifecycleRequestId: "watchpoint-wired-caller-request-missing"
            }
          }
        }),
        watchpointSink: missingSink
      });
    const noRecordEvent = missingResult.emittedWatchpointEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_NO_RECORD_OBSERVED"
    );

    assert.ok(noRecordEvent);
    assert.equal(noRecordEvent.clearanceInferred, false);
    assert.equal(noRecordEvent.protectedStateFlags.noRecordFlag, true);

    const malformedLocator = {
      matterId: "matter-lifecycle-watchpoint-wired-caller-malformed",
      outputPackageId: "output-lifecycle-watchpoint-wired-caller-malformed",
      lifecycleRequestId: "watchpoint-wired-caller-request-malformed"
    };
    const malformedKey = buildOutputPackageLifecycleOrchestrationRecordKey(malformedLocator);
    const malformedStore = createInMemoryOutputPackageLifecycleOrchestrationRecordStore([
      {
        key: malformedKey,
        record: {
          orchestrationVersion: "P4B-CX-BR04-07",
          replay: {
            matterId: malformedLocator.matterId,
            outputPackageId: malformedLocator.outputPackageId
          }
        }
      }
    ]);
    const malformedResult =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          outputPackageLifecycleResumeCheckpoint: {
            store: malformedStore,
            locator: malformedLocator
          }
        }),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      });
    const cannotResumeEvent = malformedResult.emittedWatchpointEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED"
    );

    assert.ok(cannotResumeEvent);
    assert.equal(cannotResumeEvent.clearanceInferred, false);
    assert.equal(cannotResumeEvent.protectedStateFlags.cannotSafelyResumeFlag, true);

    const noSignalResult =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput(),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      });
    const noSignalEvent = noSignalResult.emittedWatchpointEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED"
    );

    assert.ok(noSignalEvent);
    assert.equal(noSignalEvent.clearanceInferred, false);
    assert.equal(noSignalEvent.protectedStateFlags.noRoutingSignalFlag, true);
  }
);

test(
  "sink-injected caller preserves hold/release flags, route distinctions, and lifecycle/non-lifecycle separation",
  () => {
    const holdScope = createPreservationScope({
      id: "watchpoint-wired-caller-hold-scope-3a",
      matterId: "matter-lifecycle-watchpoint-wired-caller-3",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-watchpoint-wired-caller-3a",
      scopeLabel: "Output package scope"
    });
    const holdFlag = createScopedHoldFlag({
      id: "watchpoint-wired-caller-hold-3a",
      matterId: "matter-lifecycle-watchpoint-wired-caller-3",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-04T10:00:00.000Z"
    });
    const holdAwareOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-wired-caller-3a",
        matterId: "matter-lifecycle-watchpoint-wired-caller-3"
      }),
      holdFlags: [holdFlag],
      lifecycleRequest: {
        id: "watchpoint-wired-caller-request-3a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-04T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const releaseScope = createPreservationScope({
      id: "watchpoint-wired-caller-hold-scope-3b",
      matterId: "matter-lifecycle-watchpoint-wired-caller-3",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-watchpoint-wired-caller-3b",
      scopeLabel: "Output package scope"
    });
    const releaseHoldFlag = createScopedHoldFlag({
      id: "watchpoint-wired-caller-hold-3b",
      matterId: "matter-lifecycle-watchpoint-wired-caller-3",
      scope: releaseScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-04T10:10:00.000Z"
    });
    const releaseOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-wired-caller-3b",
        matterId: "matter-lifecycle-watchpoint-wired-caller-3"
      }),
      holdFlags: [releaseHoldFlag],
      holdCommands: [
        {
          id: "watchpoint-wired-caller-hold-command-3a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-05-04T10:15:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: releaseHoldFlag.id
        },
        {
          id: "watchpoint-wired-caller-hold-command-3b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-05-04T10:20:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: releaseHoldFlag.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "watchpoint-wired-caller-request-3b",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-04T10:25:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-wired-caller-3c",
        matterId: "matter-lifecycle-watchpoint-wired-caller-3"
      }),
      lifecycleRequest: {
        id: "watchpoint-wired-caller-request-3c",
        requestedAction: "REQUEST_DEIDENTIFICATION",
        requestedAt: "2026-05-04T10:30:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint: holdAwareCheckpoint } =
      persistLifecycleOrchestrationRecord(holdAwareOrchestration);
    const { resumeCheckpoint: releaseCheckpoint } =
      persistLifecycleOrchestrationRecord(releaseOrchestration);
    const { resumeCheckpoint: deidentificationCheckpoint } =
      persistLifecycleOrchestrationRecord(deidentificationOrchestration);

    const holdAwareEvents =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-watchpoint-wired-caller-3",
          outputPackageLifecycleResumeCheckpoint: holdAwareCheckpoint
        }),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      }).emittedWatchpointEvents;
    const releaseEvents =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-watchpoint-wired-caller-3",
          outputPackageLifecycleResumeCheckpoint: releaseCheckpoint
        }),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      }).emittedWatchpointEvents;
    const deidentificationEvents =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-watchpoint-wired-caller-3",
          outputPackageLifecycleResumeCheckpoint: deidentificationCheckpoint
        }),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink(),
        nonLifecycleTransitionInput: {
          progressionHoldRequested: true,
          unresolvedBlockerCodes: ["NON_LIFECYCLE_BLOCKER_A"]
        }
      }).emittedWatchpointEvents;

    const holdEvent = holdAwareEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED"
    );
    const releaseEvent = releaseEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED"
    );
    const deidentificationRouteEvent = deidentificationEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_ACTION_ROUTE_OBSERVED"
    );

    assert.ok(holdEvent);
    assert.ok(releaseEvent);
    assert.ok(deidentificationRouteEvent);
    assert.equal(holdEvent.protectedStateFlags.holdAwareFlag, true);
    assert.equal(holdEvent.protectedStateFlags.releaseControlledFlag, false);
    assert.equal(releaseEvent.protectedStateFlags.holdAwareFlag, false);
    assert.equal(releaseEvent.protectedStateFlags.releaseControlledFlag, true);
    assert.equal(
      deidentificationRouteEvent.protectedStateFlags.lifecycleRouteKind,
      "DEIDENTIFICATION_ACTION"
    );
    assert.equal(
      deidentificationRouteEvent.protectedStateFlags.lifecycleNonLifecycleSeparationFlag,
      true
    );
  }
);

test(
  "no sink means no emission and caller output remains unchanged",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-wired-caller-4",
        matterId: "matter-lifecycle-watchpoint-wired-caller-4"
      }),
      lifecycleRequest: {
        id: "watchpoint-wired-caller-request-4",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-04T11:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputCheckpoint = buildHydrateOutputInput({
      matterId: "matter-lifecycle-watchpoint-wired-caller-4",
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const baseline = consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
      outputCheckpoint
    });
    const withOptionalNoSink =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint
      });

    assert.deepEqual(withOptionalNoSink.handlingAction, baseline);
    assert.deepEqual(withOptionalNoSink.emittedWatchpointEvents, []);
  }
);

test(
  "wiring keeps event names neutral and payload minimised without UI/analytics/sensitive fields",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-wired-caller-5",
        matterId: "matter-lifecycle-watchpoint-wired-caller-5"
      }),
      lifecycleRequest: {
        id: "watchpoint-wired-caller-request-5",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-04T12:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const { emittedWatchpointEvents } =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-watchpoint-wired-caller-5",
          outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
        }),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      });

    const forbiddenTopLevelFields = [
      "tenantName",
      "tenantEmail",
      "tenantPhone",
      "renterName",
      "legalFacts",
      "documentContents",
      "officialCredential",
      "officialIdentifier",
      "addressLine1",
      "paymentAmount",
      "statusLabel",
      "ctaLabel",
      "publicEventName",
      "analyticsCopy"
    ];

    for (const event of emittedWatchpointEvents) {
      for (const field of forbiddenTopLevelFields) {
        assert.equal(Object.prototype.hasOwnProperty.call(event, field), false);
      }

      const loweredEventType = event.eventType.toLowerCase();

      for (const token of launcherCurrentMatterWatchpointForbiddenSemanticTokens) {
        assert.equal(loweredEventType.includes(token), false);
      }
    }
  }
);
