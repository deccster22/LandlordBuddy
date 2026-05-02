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
  createInMemoryLauncherCurrentMatterWatchpointEventSink,
  emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint,
  assertValidLauncherCurrentMatterWatchpointEvent,
  launcherCurrentMatterWatchpointEventFamilies,
  launcherCurrentMatterWatchpointForbiddenSemanticTokens
} from "../src/app/launcherCurrentMatterWatchpointLoggingEmitter.js";
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
    id: "output-lifecycle-watchpoint-emitter-1",
    matterId: "matter-lifecycle-watchpoint-emitter-1",
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
    matterId: "matter-lifecycle-watchpoint-emitter-1",
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
  "watchpoint emitter emits only allowed internal event families with required schema fields",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "watchpoint-emitter-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-03T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const result = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      }),
      observedAt: "2026-05-03T09:10:00.000Z"
    });

    assert.equal(result.emittedEvents.length >= 3, true);

    for (const event of result.emittedEvents) {
      assert.equal(
        launcherCurrentMatterWatchpointEventFamilies.includes(event.eventType),
        true
      );
      assert.equal(typeof event.eventId, "string");
      assert.equal(typeof event.observedAt, "string");
      assert.equal(event.clearanceInferred, false);
      assert.equal(event.redactionPosture, "MINIMISED_INTERNAL");
      assert.equal(event.lifecycleStateCategory, "LIFECYCLE_CONTEXT_PRESENT");
      assertValidLauncherCurrentMatterWatchpointEvent(event);
    }
  }
);

test(
  "watchpoint event names avoid forbidden semantics",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-emitter-2",
        matterId: "matter-lifecycle-watchpoint-emitter-2"
      }),
      lifecycleRequest: {
        id: "watchpoint-emitter-request-2",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-03T09:20:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const { emittedEvents } = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-watchpoint-emitter-2",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    for (const event of emittedEvents) {
      const loweredEventType = event.eventType.toLowerCase();

      for (const token of launcherCurrentMatterWatchpointForbiddenSemanticTokens) {
        assert.equal(loweredEventType.includes(token), false);
      }
    }
  }
);

test(
  "NO_RECORD watchpoints emit non-clearance flags",
  () => {
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const { emittedEvents } = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator: {
            matterId: "matter-lifecycle-watchpoint-emitter-missing",
            outputPackageId: "output-lifecycle-watchpoint-emitter-missing",
            lifecycleRequestId: "watchpoint-emitter-request-missing"
          }
        }
      })
    });
    const noRecordEvent = emittedEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_NO_RECORD_OBSERVED"
    );

    assert.ok(noRecordEvent);
    assert.equal(noRecordEvent.clearanceInferred, false);
    assert.equal(noRecordEvent.protectedStateFlags.noRecordFlag, true);
    assert.equal(noRecordEvent.protectedStateFlags.cannotSafelyResumeFlag, false);
  }
);

test(
  "malformed lifecycle watchpoints emit cannot-safely-resume fail-safe flags",
  () => {
    const locator = {
      matterId: "matter-lifecycle-watchpoint-emitter-malformed",
      outputPackageId: "output-lifecycle-watchpoint-emitter-malformed",
      lifecycleRequestId: "watchpoint-emitter-request-malformed"
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
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const { emittedEvents } = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })
    });
    const cannotResumeEvent = emittedEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED"
    );

    assert.ok(cannotResumeEvent);
    assert.equal(cannotResumeEvent.clearanceInferred, false);
    assert.equal(cannotResumeEvent.protectedStateFlags.cannotSafelyResumeFlag, true);
    assert.equal(cannotResumeEvent.protectedStateFlags.noRecordFlag, false);
  }
);

test(
  "no-signal watchpoints emit explicit no-routing-signal flags",
  () => {
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const { emittedEvents } = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput()
    });
    const noSignalEvent = emittedEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED"
    );

    assert.ok(noSignalEvent);
    assert.equal(noSignalEvent.clearanceInferred, false);
    assert.equal(noSignalEvent.protectedStateFlags.noRoutingSignalFlag, true);
    assert.equal(noSignalEvent.protectedStateFlags.noRecordFlag, false);
  }
);

test(
  "hold-aware and release-controlled flags are preserved in watchpoint metadata",
  () => {
    const holdAwareScope = createPreservationScope({
      id: "watchpoint-emitter-hold-scope-6a",
      matterId: "matter-lifecycle-watchpoint-emitter-6",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-watchpoint-emitter-6a",
      scopeLabel: "Output package scope"
    });
    const holdAwareFlag = createScopedHoldFlag({
      id: "watchpoint-emitter-hold-6a",
      matterId: "matter-lifecycle-watchpoint-emitter-6",
      scope: holdAwareScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-03T10:00:00.000Z"
    });
    const holdAwareOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-emitter-6a",
        matterId: "matter-lifecycle-watchpoint-emitter-6"
      }),
      holdFlags: [holdAwareFlag],
      lifecycleRequest: {
        id: "watchpoint-emitter-request-6a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-03T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const releaseScope = createPreservationScope({
      id: "watchpoint-emitter-hold-scope-6b",
      matterId: "matter-lifecycle-watchpoint-emitter-6",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-watchpoint-emitter-6b",
      scopeLabel: "Output package scope"
    });
    const releaseHoldFlag = createScopedHoldFlag({
      id: "watchpoint-emitter-hold-6b",
      matterId: "matter-lifecycle-watchpoint-emitter-6",
      scope: releaseScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-03T10:06:00.000Z"
    });
    const releaseControlledOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-emitter-6b",
        matterId: "matter-lifecycle-watchpoint-emitter-6"
      }),
      holdFlags: [releaseHoldFlag],
      holdCommands: [
        {
          id: "watchpoint-emitter-hold-command-6a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-05-03T10:10:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: releaseHoldFlag.id
        },
        {
          id: "watchpoint-emitter-hold-command-6b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-05-03T10:15:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: releaseHoldFlag.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "watchpoint-emitter-request-6b",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-03T10:20:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint: holdAwareCheckpoint } =
      persistLifecycleOrchestrationRecord(holdAwareOrchestration);
    const { resumeCheckpoint: releaseControlledCheckpoint } =
      persistLifecycleOrchestrationRecord(releaseControlledOrchestration);
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const holdAwareResult = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-watchpoint-emitter-6",
        outputPackageLifecycleResumeCheckpoint: holdAwareCheckpoint
      })
    });
    const releaseControlledResult = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-watchpoint-emitter-6",
        outputPackageLifecycleResumeCheckpoint: releaseControlledCheckpoint
      })
    });

    const holdAwareEvent = holdAwareResult.emittedEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED"
    );
    const releaseControlledEvent = releaseControlledResult.emittedEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED"
    );

    assert.ok(holdAwareEvent);
    assert.ok(releaseControlledEvent);
    assert.equal(holdAwareEvent.protectedStateFlags.holdAwareFlag, true);
    assert.equal(holdAwareEvent.protectedStateFlags.releaseControlledFlag, false);
    assert.equal(releaseControlledEvent.protectedStateFlags.holdAwareFlag, false);
    assert.equal(releaseControlledEvent.protectedStateFlags.releaseControlledFlag, true);
  }
);

test(
  "deletion and de-identification route kinds remain distinguishable in watchpoint metadata",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-emitter-7a",
        matterId: "matter-lifecycle-watchpoint-emitter-7"
      }),
      lifecycleRequest: {
        id: "watchpoint-emitter-request-7a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-03T11:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-emitter-7b",
        matterId: "matter-lifecycle-watchpoint-emitter-7"
      }),
      lifecycleRequest: {
        id: "watchpoint-emitter-request-7b",
        requestedAction: "REQUEST_DEIDENTIFICATION",
        requestedAt: "2026-05-03T11:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint: deletionCheckpoint } =
      persistLifecycleOrchestrationRecord(deletionOrchestration);
    const { resumeCheckpoint: deidentificationCheckpoint } =
      persistLifecycleOrchestrationRecord(deidentificationOrchestration);
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const deletionEvents = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-watchpoint-emitter-7",
        outputPackageLifecycleResumeCheckpoint: deletionCheckpoint
      })
    }).emittedEvents;
    const deidentificationEvents = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-watchpoint-emitter-7",
        outputPackageLifecycleResumeCheckpoint: deidentificationCheckpoint
      })
    }).emittedEvents;

    const deletionRouteEvent = deletionEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_ACTION_ROUTE_OBSERVED"
    );
    const deidentificationRouteEvent = deidentificationEvents.find(
      (event) => event.eventType === "WATCH_LIFECYCLE_ACTION_ROUTE_OBSERVED"
    );

    assert.ok(deletionRouteEvent);
    assert.ok(deidentificationRouteEvent);
    assert.equal(deletionRouteEvent.protectedStateFlags.lifecycleRouteKind, "DELETION_REQUEST");
    assert.equal(
      deidentificationRouteEvent.protectedStateFlags.lifecycleRouteKind,
      "DEIDENTIFICATION_ACTION"
    );
  }
);

test(
  "lifecycle/non-lifecycle separation flag is preserved in watchpoint metadata",
  () => {
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const { emittedEvents } = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput(),
      nonLifecycleTransitionInput: {
        progressionHoldRequested: true,
        unresolvedBlockerCodes: ["NON_LIFECYCLE_BLOCKER_A"]
      }
    });

    for (const event of emittedEvents) {
      assert.equal(
        event.protectedStateFlags.lifecycleNonLifecycleSeparationFlag,
        true
      );
    }
  }
);

test(
  "watchpoint payloads remain minimised and exclude sensitive personal/content/credential/address/payment fields",
  () => {
    const orchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-watchpoint-emitter-9",
        matterId: "matter-lifecycle-watchpoint-emitter-9"
      }),
      lifecycleRequest: {
        id: "watchpoint-emitter-request-9",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-03T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestration);
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const { emittedEvents } = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-watchpoint-emitter-9",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    const forbiddenFields = [
      "tenantName",
      "tenantEmail",
      "tenantPhone",
      "renterName",
      "legalFacts",
      "documentContents",
      "officialCredential",
      "officialIdentifier",
      "portalCredential",
      "addressLine1",
      "paymentAmount",
      "paymentReference"
    ];

    for (const event of emittedEvents) {
      for (const field of forbiddenFields) {
        assert.equal(Object.prototype.hasOwnProperty.call(event, field), false);
      }
    }

    const flattenedPayload = JSON.stringify(emittedEvents).toLowerCase();
    const forbiddenFragments = [
      "tenantname",
      "tenantemail",
      "tenantphone",
      "legalfacts",
      "documentcontents",
      "officialcredential",
      "portalcredential",
      "addressline1",
      "paymentamount",
      "paymentreference"
    ];

    for (const fragment of forbiddenFragments) {
      assert.equal(flattenedPayload.includes(fragment), false);
    }
  }
);

test(
  "watchpoint payload introduces no UI/copy/status-label/CTA/public-analytics fields",
  () => {
    const sink = createInMemoryLauncherCurrentMatterWatchpointEventSink();
    const { emittedEvents } = emitLauncherCurrentMatterWatchpointEventsFromOutputCheckpoint({
      sink,
      outputCheckpoint: buildHydrateOutputInput()
    });

    const forbiddenUiAnalyticsFields = [
      "title",
      "message",
      "copy",
      "body",
      "statusLabel",
      "ctaLabel",
      "primaryCtaLabel",
      "secondaryCtaLabel",
      "publicEventName",
      "analyticsCopy"
    ];

    for (const event of emittedEvents) {
      for (const field of forbiddenUiAnalyticsFields) {
        assert.equal(Object.prototype.hasOwnProperty.call(event, field), false);
      }
    }
  }
);

test(
  "schema guard rejects malformed event payloads and forbidden event semantics",
  () => {
    assert.throws(
      () => assertValidLauncherCurrentMatterWatchpointEvent({
        eventType: "WATCH_READY_SUCCESS",
        eventId: "bad-event-1",
        observedAt: "2026-05-03T12:00:00.000Z",
        sourceSeam: "launcherCurrentMatterHandlingActionConsumer",
        sourceTaskLineage: ["P4B-CX-APP-ALIGN-04"],
        lifecycleStateCategory: "LIFECYCLE_CONTEXT_PRESENT",
        protectedStateFlags: {
          cannotSafelyResumeFlag: false,
          noRecordFlag: false,
          noRoutingSignalFlag: false,
          holdAwareFlag: false,
          releaseControlledFlag: false,
          lifecycleNonLifecycleSeparationFlag: true,
          lifecycleRouteKind: "NONE"
        },
        clearanceInferred: false,
        redactionPosture: "MINIMISED_INTERNAL"
      }),
      /eventType/i
    );
  }
);
