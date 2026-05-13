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
import type { HydrateOutputCheckpointInput, OutputPackageLifecycleResumeCheckpointInput } from "../src/app/outputHandoffCheckpointHydration.js";
import {
  consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterHandlingActionConsumer.js";
import {
  orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterTransitionOrchestrationEntry.js";
import {
  createInMemoryLauncherCurrentMatterWatchpointEventSink
} from "../src/app/launcherCurrentMatterWatchpointLoggingEmitter.js";
import {
  runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint
} from "../src/app/launcherCurrentMatterWatchpointRegressionDiagnostics.js";
import {
  planLauncherCurrentMatterLifecycleConsumption,
  planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint,
  planLauncherCurrentMatterLifecycleConsumptionFromTransitionOrchestrationDecision
} from "../src/app/launcherCurrentMatterLifecycleConsumptionPlanner.js";
import {
  orchestrateOutputPackageLifecycle
} from "../src/app/outputPackageLifecycleOrchestration.js";
import type { OutputPackageLifecycleOrchestrationRecord } from "../src/app/outputPackageLifecycleOrchestration.js";
import {
  buildOutputPackageLifecycleOrchestrationRecordKey,
  createInMemoryOutputPackageLifecycleOrchestrationRecordStore,
  storeOutputPackageLifecycleOrchestrationRecord
} from "../src/app/outputPackageLifecycleOrchestrationPersistence.js";

function buildOutputPackageInput(
  overrides: Partial<CreateOutputPackageRecordInput> = {}
): CreateOutputPackageRecordInput {
  return {
    id: "output-lifecycle-consumption-planner-1",
    matterId: "matter-lifecycle-consumption-planner-1",
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
    matterId: "matter-lifecycle-consumption-planner-1",
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
  "planner consumes handling-action, orchestration, and output-checkpoint entrypoints consistently",
  () => {
    const orchestrationRecord = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput(),
      lifecycleRequest: {
        id: "lifecycle-consumption-planner-request-1",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-13T09:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestrationRecord);
    const outputCheckpoint = buildHydrateOutputInput({
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const handlingAction =
      consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
        outputCheckpoint
      });
    const orchestrationDecision =
      orchestrateLauncherCurrentMatterTransitionEntryFromOutputCheckpoint({
        outputCheckpoint
      });
    const directPlan = planLauncherCurrentMatterLifecycleConsumption({
      handlingAction
    });
    const fromOrchestrationPlan =
      planLauncherCurrentMatterLifecycleConsumptionFromTransitionOrchestrationDecision({
        orchestrationDecision
      });
    const fromCheckpointPlan =
      planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
        outputCheckpoint
      });

    assert.deepEqual(fromOrchestrationPlan, directPlan);
    assert.deepEqual(fromCheckpointPlan, directPlan);
  }
);

test(
  "lifecycle-context continuation planning is internal-only and non-certifying",
  () => {
    const orchestrationRecord = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-consumption-planner-2",
        matterId: "matter-lifecycle-consumption-planner-2"
      }),
      lifecycleRequest: {
        id: "lifecycle-consumption-planner-request-2",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-13T09:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestrationRecord);
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-consumption-planner-2",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(plan.plannerKind, "SCRC_01_INTERNAL_LIFECYCLE_CONSUMPTION_PLANNER");
    assert.equal(plan.sourceContract, "P4C-CX-APP-CONSUME-02");
    assert.equal(plan.planningOutcome, "PLAN_INTERNAL_CONTINUE_WITH_LIFECYCLE_CONTEXT");
    assert.equal(plan.proceedWithInternalPlanning, true);
    assert.equal(plan.lifecycleContextPreservationPlanning, true);
    assert.equal(plan.continuationEligibilityPlanning, true);
    assert.equal(plan.failSafeInterruptionPlanning, false);
    assert.equal(plan.noRecordNonClearancePlanning, false);
    assert.equal(plan.explicitNoRoutingSignalPlanning, false);
    assert.equal(plan.clearanceInferred, false);
    assert.equal(plan.lifecycleRoute, "DELETION_REQUEST");
  }
);

test(
  "no-record non-clearance planning keeps clearanceInferred false",
  () => {
    const store = createInMemoryOutputPackageLifecycleOrchestrationRecordStore();
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator: {
            matterId: "matter-lifecycle-consumption-planner-missing",
            outputPackageId: "output-lifecycle-consumption-planner-missing",
            lifecycleRequestId: "lifecycle-consumption-planner-request-missing"
          }
        }
      })
    });

    assert.equal(plan.planningOutcome, "PLAN_INTERNAL_CONTINUE_NO_RECORD_NON_CLEARANCE");
    assert.equal(plan.clearanceInferred, false);
    assert.equal(plan.noRecordNonClearancePlanning, true);
    assert.equal(plan.proceedWithInternalPlanning, true);
    assert.equal(plan.lifecycleRoute, "NONE");
    assert.equal(plan.lifecycleSlice.executionControl.outcome, "NO_RECORD_NON_CLEARANCE_CONTROL");
  }
);

test(
  "malformed/cannot-safely-resume maps to fail-safe internal planning",
  () => {
    const locator = {
      matterId: "matter-lifecycle-consumption-planner-malformed",
      outputPackageId: "output-lifecycle-consumption-planner-malformed",
      lifecycleRequestId: "lifecycle-consumption-planner-request-malformed"
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
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        outputPackageLifecycleResumeCheckpoint: {
          store,
          locator
        }
      })
    });

    assert.equal(plan.planningOutcome, "PLAN_INTERNAL_HOLD_CANNOT_SAFELY_RESUME");
    assert.equal(plan.proceedWithInternalPlanning, false);
    assert.equal(plan.failSafeInterruptionPlanning, true);
    assert.equal(plan.clearanceInferred, false);
    assert.equal(plan.lifecycleSlice.executionControl.outcome, "CANNOT_SAFELY_RESUME_CONTROL");
  }
);

test(
  "no-signal maps to explicit no-signal internal planning",
  () => {
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput()
    });

    assert.equal(plan.planningOutcome, "PLAN_INTERNAL_EXPLICIT_NO_ROUTING_SIGNAL");
    assert.equal(plan.proceedWithInternalPlanning, false);
    assert.equal(plan.explicitNoRoutingSignalPlanning, true);
    assert.equal(plan.clearanceInferred, false);
    assert.equal(plan.lifecycleSlice.executionControl.outcome, "NO_LIFECYCLE_ROUTING_SIGNAL");
  }
);

test(
  "hold-aware state remains visible in planner output",
  () => {
    const holdScope = createPreservationScope({
      id: "lifecycle-consumption-planner-hold-scope-6",
      matterId: "matter-lifecycle-consumption-planner-6",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-consumption-planner-6",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "lifecycle-consumption-planner-hold-6",
      matterId: "matter-lifecycle-consumption-planner-6",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-13T10:00:00.000Z"
    });
    const orchestrationRecord = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-consumption-planner-6",
        matterId: "matter-lifecycle-consumption-planner-6"
      }),
      holdFlags: [hold],
      lifecycleRequest: {
        id: "lifecycle-consumption-planner-request-6",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-13T10:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestrationRecord);
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-consumption-planner-6",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(plan.holdAwareLifecycleStatePresent, true);
    assert.equal(plan.releaseControlledLifecycleStatePresent, false);
    assert.equal(plan.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(plan.deletionRequestPresent, false);
    assert.equal(plan.deidentificationActionPresent, true);
  }
);

test(
  "release-controlled state remains visible in planner output",
  () => {
    const holdScope = createPreservationScope({
      id: "lifecycle-consumption-planner-hold-scope-7",
      matterId: "matter-lifecycle-consumption-planner-7",
      subjectType: "OUTPUT_PACKAGE",
      subjectId: "output-lifecycle-consumption-planner-7",
      scopeLabel: "Output package scope"
    });
    const hold = createScopedHoldFlag({
      id: "lifecycle-consumption-planner-hold-7",
      matterId: "matter-lifecycle-consumption-planner-7",
      scope: holdScope,
      reason: createHoldReason({
        code: "OUTPUT_PACKAGE_REVIEW",
        label: "Output package review hold",
        summary: "Scoped hold placeholder."
      }),
      status: "ACTIVE",
      appliedAt: "2026-05-13T10:30:00.000Z"
    });
    const orchestrationRecord = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-consumption-planner-7",
        matterId: "matter-lifecycle-consumption-planner-7"
      }),
      holdFlags: [hold],
      holdCommands: [
        {
          id: "lifecycle-consumption-planner-hold-command-7a",
          command: "REQUEST_HOLD_RELEASE",
          requestedAt: "2026-05-13T10:35:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id
        },
        {
          id: "lifecycle-consumption-planner-hold-command-7b",
          command: "CONFIRM_HOLD_RELEASE",
          requestedAt: "2026-05-13T10:40:00.000Z",
          requestedByRole: "PRIVACY_REVIEWER",
          holdFlagId: hold.id,
          releaseApprovedByRole: "PRIVACY_REVIEWER"
        }
      ],
      lifecycleRequest: {
        id: "lifecycle-consumption-planner-request-7",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-13T10:45:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestrationRecord);
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-consumption-planner-7",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      })
    });

    assert.equal(plan.holdAwareLifecycleStatePresent, false);
    assert.equal(plan.releaseControlledLifecycleStatePresent, true);
    assert.equal(plan.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(plan.deletionRequestPresent, true);
    assert.equal(plan.deidentificationActionPresent, false);
  }
);

test(
  "deletion and de-identification route distinction remains visible",
  () => {
    const deletionOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-consumption-planner-8a",
        matterId: "matter-lifecycle-consumption-planner-8"
      }),
      lifecycleRequest: {
        id: "lifecycle-consumption-planner-request-8a",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-13T11:00:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const deidentificationOrchestration = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-consumption-planner-8b",
        matterId: "matter-lifecycle-consumption-planner-8"
      }),
      lifecycleRequest: {
        id: "lifecycle-consumption-planner-request-8b",
        requestedAction: "REQUEST_DEIDENTIFICATION",
        requestedAt: "2026-05-13T11:05:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint: deletionResumeCheckpoint } =
      persistLifecycleOrchestrationRecord(deletionOrchestration);
    const { resumeCheckpoint: deidentificationResumeCheckpoint } =
      persistLifecycleOrchestrationRecord(deidentificationOrchestration);
    const deletionPlan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-consumption-planner-8",
        outputPackageLifecycleResumeCheckpoint: deletionResumeCheckpoint
      })
    });
    const deidentificationPlan =
      planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
        outputCheckpoint: buildHydrateOutputInput({
          matterId: "matter-lifecycle-consumption-planner-8",
          outputPackageLifecycleResumeCheckpoint: deidentificationResumeCheckpoint
        })
      });

    assert.equal(deletionPlan.lifecycleRoute, "DELETION_REQUEST");
    assert.equal(deletionPlan.deletionRequestPresent, true);
    assert.equal(deletionPlan.deidentificationActionPresent, false);
    assert.equal(deidentificationPlan.lifecycleRoute, "DEIDENTIFICATION_ACTION");
    assert.equal(deidentificationPlan.deletionRequestPresent, false);
    assert.equal(deidentificationPlan.deidentificationActionPresent, true);
  }
);

test(
  "lifecycle and non-lifecycle slices remain separately inspectable",
  () => {
    const orchestrationRecord = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-consumption-planner-9",
        matterId: "matter-lifecycle-consumption-planner-9"
      }),
      lifecycleRequest: {
        id: "lifecycle-consumption-planner-request-9",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-13T11:10:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestrationRecord);
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput({
        matterId: "matter-lifecycle-consumption-planner-9",
        outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
      }),
      nonLifecycleTransitionInput: {
        progressionHoldRequested: true,
        unresolvedBlockerCodes: ["NON_LIFECYCLE_BLOCKER_A"],
        transitionHintCode: "RECHECK_CONTEXT"
      }
    });

    assert.equal(plan.lifecycleSlice.transitionSelection.target, "TRANSITION_CONTINUE_WITH_LIFECYCLE_CONTEXT");
    assert.equal(
      plan.nonLifecycleSlice.transitionState.posture,
      "NON_LIFECYCLE_HOLD_REQUESTED"
    );
    assert.equal(plan.nonLifecycleSlice.holdRequested, true);
    assert.equal(plan.lifecycleSlice.executionDirective.nonLifecycleHoldRequested, true);
    assert.equal(
      plan.nonLifecycleSlice.transitionState.transitionHintCode,
      "RECHECK_CONTEXT"
    );
  }
);

test(
  "planner keeps clearance not inferred and avoids generic success collapse",
  () => {
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput()
    });

    assert.equal(plan.clearanceInferred, false);
    assert.equal(
      plan.forbiddenConversions.includes("FORBID_SUCCESS_STATE_LABEL"),
      true
    );
    assert.equal(plan.planningOutcome.includes("SUCCESS"), false);
  }
);

test(
  "watchpoint diagnostics are consumed only as internal QA context",
  () => {
    const orchestrationRecord = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-consumption-planner-10",
        matterId: "matter-lifecycle-consumption-planner-10"
      }),
      lifecycleRequest: {
        id: "lifecycle-consumption-planner-request-10",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-13T11:15:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestrationRecord);
    const outputCheckpoint = buildHydrateOutputInput({
      matterId: "matter-lifecycle-consumption-planner-10",
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const diagnosticsResult =
      runLauncherCurrentMatterWatchpointRegressionDiagnosticsFromOutputCheckpoint({
        outputCheckpoint,
        watchpointSink: createInMemoryLauncherCurrentMatterWatchpointEventSink()
      });
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint,
      watchpointDiagnosticsSummary: diagnosticsResult.diagnostics
    });

    assert.ok(plan.qaDiagnosticsContext);
    assert.equal(plan.qaDiagnosticsContext.source, "WATCHPOINT_DIAGNOSTICS_INTERNAL_QA_CONTEXT");
    assert.equal(
      plan.qaDiagnosticsContext.findingsCount,
      diagnosticsResult.diagnostics.findings.length
    );
    assert.equal(plan.watchpointExpansionAuthorized, false);
    assert.equal("statusLabel" in plan, false);
    assert.equal("analyticsCopy" in plan, false);
  }
);

test(
  "planner output introduces no UI/copy/status-label/CTA/rendered fields",
  () => {
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput()
    });
    const forbiddenUiFields = [
      "title",
      "message",
      "copy",
      "body",
      "statusLabel",
      "ctaLabel",
      "primaryCtaLabel",
      "secondaryCtaLabel",
      "screenRoute",
      "renderedPanel"
    ];

    for (const field of forbiddenUiFields) {
      assert.equal(field in plan, false);
      assert.equal(field in plan.lifecycleSlice, false);
      assert.equal(field in plan.nonLifecycleSlice, false);
      assert.equal(field in plan.lineage, false);
    }
  }
);

test(
  "planner output introduces no analytics/admin/support/export/user-visible fields and no sink-topology expansion fields",
  () => {
    const plan = planLauncherCurrentMatterLifecycleConsumptionFromOutputCheckpoint({
      outputCheckpoint: buildHydrateOutputInput()
    });
    const forbiddenFields = [
      "analyticsLabel",
      "adminLabel",
      "supportLabel",
      "exportLabel",
      "exportedLog",
      "userVisibleLog",
      "watchpointSink",
      "globalLogger",
      "persistentSink",
      "secondCallerPath"
    ];

    for (const field of forbiddenFields) {
      assert.equal(field in plan, false);
    }

    assert.equal(plan.analyticsAdminSupportExportAuthorized, false);
    assert.equal(plan.watchpointExpansionAuthorized, false);
  }
);

test(
  "planner is additive and leaves existing route/directive/handling outputs unchanged",
  () => {
    const orchestrationRecord = orchestrateOutputPackageLifecycle({
      outputPackageInput: buildOutputPackageInput({
        id: "output-lifecycle-consumption-planner-11",
        matterId: "matter-lifecycle-consumption-planner-11"
      }),
      lifecycleRequest: {
        id: "lifecycle-consumption-planner-request-11",
        requestedAction: "REQUEST_DELETION",
        requestedAt: "2026-05-13T11:20:00.000Z",
        requestedByRole: "PRIVACY_REVIEWER"
      }
    });
    const { resumeCheckpoint } = persistLifecycleOrchestrationRecord(orchestrationRecord);
    const outputCheckpoint = buildHydrateOutputInput({
      matterId: "matter-lifecycle-consumption-planner-11",
      outputPackageLifecycleResumeCheckpoint: resumeCheckpoint
    });
    const handlingActionBefore =
      consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
        outputCheckpoint
      });
    const baselineClone = JSON.parse(JSON.stringify(handlingActionBefore));

    const plan = planLauncherCurrentMatterLifecycleConsumption({
      handlingAction: handlingActionBefore
    });
    const handlingActionAfter =
      consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint({
        outputCheckpoint
      });

    assert.equal(plan.planningOutcome, "PLAN_INTERNAL_CONTINUE_WITH_LIFECYCLE_CONTEXT");
    assert.deepEqual(handlingActionBefore, baselineClone);
    assert.deepEqual(handlingActionAfter, baselineClone);
  }
);
