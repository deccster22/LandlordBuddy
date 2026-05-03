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
  createInMemoryLauncherCurrentMatterWatchpointEventSink
} from "../src/app/launcherCurrentMatterWatchpointLoggingEmitter.js";
import {
  consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterHandlingActionConsumer.js";
import {
  consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterWatchpointWiredCaller.js";
import {
  diagnoseLauncherCurrentMatterWatchpointEvents,
  runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterWatchpointRegressionDiagnostics.js";
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
    id: "output-lifecycle-watchpoint-diagnostics-1",
    matterId: "matter-lifecycle-watchpoint-diagnostics-1",
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
    matterId: "matter-lifecycle-watchpoint-diagnostics-1",
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
  "diagnostics run through the existing one-path sink-injected wired caller and preserve handling output parity",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "watchpoint-diagnostics-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-04T13:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const outputCheckpoint = buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const unusedSink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const diagnosticResult =
      runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
        outputCheckpoint,
        watchpointSink: sink,
        watchpointObservedAt: "2026-05-04T13:01:00.000Z"
      });
    const directResult =
      consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint({
        outputCheckpoint,
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink(),
        watchpointObservedAt: "2026-05-04T13:01:00.000Z"
      });
    const baselineHandlingAction =
      consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
        outputCheckpoint
      });

    assert.equal(diagnosticResult.diagnostics.passed, true);
    assert.equal(diagnosticResult.diagnostics.sinkCaptureParity, true);
    assert.equal(
      diagnosticResult.diagnostics.observedEventTypes.includes(
        "WATCH_LIFECYCLE_RESUME_STATE_OBSERVED"
      ),
      true
    );
    assert.equal(unusedSink.readEvents().length, 0);
    assert.deepEqual(diagnosticResult.handlingAction, directResult.handlingAction);
    assert.deepEqual(
      diagnosticResult.emittedWatchpointEvents,
      directResult.emittedWatchpointEvents
    );
    assert.deepEqual(diagnosticResult.handlingAction, baselineHandlingAction);
  }
);

test(
  "diagnostics require explicit injected in-memory sink and do not create a default/global sink",
  () => {
    assert.throws(
      () =>
        runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
          outputCheckpoint: buildHydrateOutputInput(),
          watchpointSink: undefined as unknown as ReturnType<
            typeof createInMemoryLauncherCurrentMatterWatchpointEventSink
          >
        }),
      /explicit injected in-memory watchpoint sink/i
    );
  }
);

test(
  "no-record non-clearance and cannot-safely-resume diagnostics remain explicit and fail-safe",
  () => {
    const missingStore = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const missingResult =
      runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          outputPackageLifecycleResumeCheckpoint: {
            store: missingStore,
            locator: {
              matterId: "matter-lifecycle-watchpoint-diagnostics-missing",
              outputPackageId: "output-lifecycle-watchpoint-diagnostics-missing",
              lifecycleRequestId: "watchpoint-diagnostics-request-missing"
            }
          }
        }),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      });
    const missingNoRecordEvent = missingResult.emittedWatchpointEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_NO_RECORD_OBSERVED"
    );

    assert.equal(missingResult.diagnostics.passed, true);
    assert.ok(missingNoRecordEvent);
    assert.equal(missingNoRecordEvent.clearanceInferred, false);
    assert.equal(missingNoRecordEvent.protectedStateFlags.noRecordFlag, true);

    const malformedLocator = {
      matterId: "matter-lifecycle-watchpoint-diagnostics-malformed",
      outputPackageId: "output-lifecycle-watchpoint-diagnostics-malformed",
      lifecycleRequestId: "watchpoint-diagnostics-request-malformed"
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
      runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
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

    assert.equal(malformedResult.diagnostics.passed, true);
    assert.ok(cannotResumeEvent);
    assert.equal(cannotResumeEvent.protectedStateFlags.cannotSafelyResumeFlag, true);
    assert.equal(cannotResumeEvent.clearanceInferred, false);
  }
);

test(
  "explicit no-signal diagnostics remain non-default and preserve lifecycle/non-lifecycle separation",
  () => {
    const noSignalResult =
      runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput(),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      });
    const noSignalEvent = noSignalResult.emittedWatchpointEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED"
    );

    assert.equal(noSignalResult.diagnostics.passed, true);
    assert.ok(noSignalEvent);
    assert.equal(noSignalEvent.protectedStateFlags.noRoutingSignalFlag, true);
    assert.equal(
      noSignalEvent.protectedStateFlags.lifecycleNonLifecycleSeparationFlag,
      true
    );
  }
);

test(
  "hold-aware/release-controlled and deletion/de-identification route diagnostics preserve distinctions",
  () => {
    const holdScope = createPreservationScope({
      id: "watchpoint-diagnostics-hold-scope-5a",
      matterId: "matter-lifecycle-watchpoint-diagnostics-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-watchpoint-diagnostics-5a",
      scopeLabel: "Output package scope"
    });
    const holdFlag = createScopedHoldFlag({
      id: "watchpoint-diagnostics-hold-5a",
      matterId: "matter-lifecycle-watchpoint-diagnostics-5",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-04T14:00:00.000Z"
    });
    const holdAwareOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-diagnostics-5a",
        matterId: "matter-lifecycle-watchpoint-diagnostics-5"
      }),
      holdFlags: [holdFlag],
      lifecycleRequest: {
        id: "watchpoint-diagnostics-request-5a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-04T14:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const releaseScope = createPreservationScope({
      id: "watchpoint-diagnostics-hold-scope-5b",
      matterId: "matter-lifecycle-watchpoint-diagnostics-5",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-watchpoint-diagnostics-5b",
      scopeLabel: "Output package scope"
    });
    const releaseHoldFlag = createScopedHoldFlag({
      id: "watchpoint-diagnostics-hold-5b",
      matterId: "matter-lifecycle-watchpoint-diagnostics-5",
      scope: releaseScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-04T14:10:00.000Z"
    });
    const releaseOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-diagnostics-5b",
        matterId: "matter-lifecycle-watchpoint-diagnostics-5"
      }),
      holdFlags: [releaseHoldFlag],
      holdCommands: [
        {
          id: "watchpoint-diagnostics-hold-command-5a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-05-04T14:15:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: releaseHoldFlag.id
        },
        {
          id: "watchpoint-diagnostics-hold-command-5b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-05-04T14:20:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: releaseHoldFlag.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "watchpoint-diagnostics-request-5b",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-04T14:25:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-diagnostics-5c",
        matterId: "matter-lifecycle-watchpoint-diagnostics-5"
      }),
      lifecycleRequest: {
        id: "watchpoint-diagnostics-request-5c",
        requestedAction: "REQUEST_DEIDENTIFICATION",
        requestedAt: "2026-05-04T14:30:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint: holdAwareCheckpoint } =
      persistLifecycleOrchestrationRecord(holdAwareOrchestration);
    const { resumeCheckpoint: releaseCheckpoint } =
      persistLifecycleOrchestrationRecord(releaseOrchestration);
    const { resumeCheckpoint: deidentificationCheckpoint } =
      persistLifecycleOrchestrationRecord(deidentificationOrchestration);

    const holdAwareResult =
      runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-watchpoint-diagnostics-5",
          outputPackageLifecycleResumeCheckpoint: holdAwareCheckpoint
        }),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      });
    const releaseResult =
      runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-watchpoint-diagnostics-5",
          outputPackageLifecycleResumeCheckpoint: releaseCheckpoint
        }),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      });
    const deidentificationResult =
      runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-watchpoint-diagnostics-5",
          outputPackageLifecycleResumeCheckpoint: deidentificationCheckpoint
        }),
        nonLifecycleTransitionInput: {
          progressionHoldRequested: true,
          unresolvedBlockerCodes: ["NON_LIFECYCLE_BLOCKER_B"]
        },
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      });

    assert.equal(holdAwareResult.diagnostics.passed, true);
    assert.equal(releaseResult.diagnostics.passed, true);
    assert.equal(deidentificationResult.diagnostics.passed, true);
    assert.equal(
      holdAwareResult.diagnostics.expectationsApplied.requireHoldAwareState,
      true
    );
    assert.equal(
      releaseResult.diagnostics.expectationsApplied.requireReleaseControlledState,
      true
    );
    assert.equal(
      deidentificationResult.diagnostics.observedLifecycleRouteKinds.includes(
        "DEIDENTIFICATION_ACTION"
      ),
      true
    );
    assert.equal(
      releaseResult.diagnostics.observedLifecycleRouteKinds.includes(
        "DELETION_REQUEST"
      ),
      true
    );
  }
);

test(
  "forbidden event-name semantics and forbidden payload fields are flagged by diagnostics",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-diagnostics-6",
        matterId: "matter-lifecycle-watchpoint-diagnostics-6"
      }),
      lifecycleRequest: {
        id: "watchpoint-diagnostics-request-6",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-04T15:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const baselineEvents =
      runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-watchpoint-diagnostics-6",
          outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
        }),
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      }).emittedWatchpointEvents;
    const invalidSemanticEvent = {
      ...baselineEvents[0],
      eventType: "WATCH_LIFECYCLE_SUCCESS_OBSERVED"
    };
    const invalidPayloadEvent = {
      ...baselineEvents[0],
      tenantName: "sensitive-person-name"
    };
    const flagged =
      diagnoseLauncherCurrentMatterWatchpointEvents({
        events: [invalidSemanticEvent, invalidPayloadEvent],
        expectations: {
          requireLifecycleResumeObserved: false,
          requireLifecycleNonLifecycleSeparation: false
        }
      });

    assert.equal(flagged.passed, false);
    assert.equal(
      flagged.findings.some((finding) => finding.includes("forbidden semantic token success")),
      true
    );
    assert.equal(
      flagged.findings.some((finding) => finding.includes("forbidden payload field tenantName")),
      true
    );
  }
);
