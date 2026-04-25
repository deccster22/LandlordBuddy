import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState
} from "../src/domain/model.js";
import { buildOfficialHandoffGuidanceShell } from "../src/modules/handoff/index.js";
import { generateOutputPackageShell } from "../src/modules/output/index.js";
import { createTouchpointPostureSnapshot } from "../src/modules/touchpoints/index.js";
import {
  composeOfficialHandoffGuidanceFromHydratedCheckpoint,
  composeOutputPackageFromHydratedCheckpoint,
  hydrateOutputCheckpointForComposition,
  type HydrateOfficialHandoffCheckpointInput,
  type HydrateOutputCheckpointInput
} from "../src/app/outputHandoffCheckpointHydration.js";
import type { Br03TouchpointPostureSourceEvent } from "../src/app/br03TouchpointSnapshotProducer.js";

function createSourceEvent(
  overrides: Partial<Br03TouchpointPostureSourceEvent> = {}
): Br03TouchpointPostureSourceEvent {
  return {
    touchpointId: "vic-arrears-freshness-watch",
    sourceEventId: "checkpoint-event-1",
    sourceKind: "OUTPUT_REVIEW_CHECKPOINT",
    capturedAt: "2026-04-25T09:00:00.000Z",
    ...overrides
  };
}

function buildOutputInput(
  overrides: Partial<HydrateOutputCheckpointInput> = {}
): HydrateOutputCheckpointInput {
  return {
    matterId: "matter-hydration-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-freshness-watch"],
    ...overrides
  };
}

function buildHandoffInput(
  overrides: Partial<HydrateOfficialHandoffCheckpointInput> = {}
): HydrateOfficialHandoffCheckpointInput {
  return {
    matterId: "matter-hydration-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-freshness-watch"],
    ...overrides
  };
}

test("BR03 hydration consumes persisted stale source events into output and handoff composition", () => {
  const outputResult = composeOutputPackageFromHydratedCheckpoint(buildOutputInput({
    out04TouchpointSourceEvents: [
      createSourceEvent({
        freshnessSignal: "STALE"
      })
    ]
  }));
  const handoffResult = composeOfficialHandoffGuidanceFromHydratedCheckpoint(buildHandoffInput({
    out04TouchpointSourceEvents: [
      createSourceEvent({
        freshnessSignal: "STALE"
      })
    ]
  }));

  if (outputResult.outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY output shell.");
  }

  assert.equal(outputResult.outputPackage.touchpointControlOutputs.stale, true);
  assert.equal(outputResult.outputPackage.touchpointControlOutputs.liveConfirmationRequired, false);
  assert.ok(outputResult.outputPackage.blockKeys.includes("touchpoint-stale"));
  assert.ok(!outputResult.outputPackage.blockKeys.includes("live-confirmation-required"));
  assert.ok(handoffResult.guidance.guidanceBlockKeys.includes("touchpoint-stale"));
  assert.ok(!handoffResult.guidance.guidanceBlockKeys.includes("live-confirmation-required"));
  assert.deepEqual(
    outputResult.touchpointSnapshotProduction.appliedSourceEventIds,
    ["checkpoint-event-1"]
  );
});

test("BR03 hydration consumes persisted live-confirmation-required source events into output and handoff composition", () => {
  const outputResult = composeOutputPackageFromHydratedCheckpoint(buildOutputInput({
    out04TouchpointSourceEvents: [
      createSourceEvent({
        freshnessSignal: "STALE",
        liveConfirmationRequiredSignal: true
      })
    ]
  }));
  const handoffResult = composeOfficialHandoffGuidanceFromHydratedCheckpoint(buildHandoffInput({
    out04TouchpointSourceEvents: [
      createSourceEvent({
        freshnessSignal: "STALE",
        liveConfirmationRequiredSignal: true
      })
    ]
  }));

  if (outputResult.outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY output shell.");
  }

  assert.equal(outputResult.outputPackage.touchpointControlOutputs.stale, false);
  assert.equal(outputResult.outputPackage.touchpointControlOutputs.liveConfirmationRequired, true);
  assert.ok(outputResult.outputPackage.blockKeys.includes("live-confirmation-required"));
  assert.ok(!outputResult.outputPackage.blockKeys.includes("touchpoint-stale"));
  assert.ok(handoffResult.guidance.guidanceBlockKeys.includes("live-confirmation-required"));
  assert.ok(handoffResult.guidance.guidanceBlockKeys.includes("slowdown-review"));
});

test("BR03 hydration consumes persisted wrong-channel source events into output and handoff reroute composition", () => {
  const outputResult = composeOutputPackageFromHydratedCheckpoint(buildOutputInput({
    touchpointIds: ["vic-arrears-public-form-warning"],
    out04TouchpointSourceEvents: [
      createSourceEvent({
        touchpointId: "vic-arrears-public-form-warning",
        sourceEventId: "checkpoint-event-2",
        sourceKind: "CHANNEL_CONTEXT_NOTE",
        wrongChannelSignal: true
      })
    ]
  }));
  const handoffResult = composeOfficialHandoffGuidanceFromHydratedCheckpoint(buildHandoffInput({
    touchpointIds: ["vic-arrears-public-form-warning"],
    out04TouchpointSourceEvents: [
      createSourceEvent({
        touchpointId: "vic-arrears-public-form-warning",
        sourceEventId: "checkpoint-event-2",
        sourceKind: "CHANNEL_CONTEXT_NOTE",
        wrongChannelSignal: true
      })
    ]
  }));

  if (outputResult.outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY output shell.");
  }

  assert.equal(outputResult.outputPackage.touchpointControlOutputs.wrongChannelReroute, true);
  assert.ok(outputResult.outputPackage.blockKeys.includes("wrong-channel-reroute"));
  assert.ok(outputResult.outputPackage.blockKeys.includes("referral-stop"));
  assert.equal(
    outputResult.outputPackage.trustBinding.reviewHandoffState.handoff.posture,
    "REFERRAL_STOP"
  );
  assert.ok(handoffResult.guidance.guidanceBlockKeys.includes("wrong-channel-reroute"));
  assert.ok(handoffResult.guidance.guidanceBlockKeys.includes("referral-stop"));
  assert.equal(handoffResult.guidance.trustBinding.reviewHandoffState.handoff.posture, "REFERRAL_STOP");
});

test("BR03 hydration keeps authenticated-handoff-only posture even when persisted source event suggests downgrade", () => {
  const outputResult = composeOutputPackageFromHydratedCheckpoint(buildOutputInput({
    touchpointIds: ["vic-arrears-authenticated-handoff"],
    out04TouchpointSourceEvents: [
      createSourceEvent({
        touchpointId: "vic-arrears-authenticated-handoff",
        sourceEventId: "checkpoint-event-3",
        sourceKind: "AUTHENTICATED_SURFACE_NOTE",
        authenticatedHandoffOnlySignal: false
      })
    ]
  }));
  const handoffResult = composeOfficialHandoffGuidanceFromHydratedCheckpoint(buildHandoffInput({
    touchpointIds: ["vic-arrears-authenticated-handoff"],
    out04TouchpointSourceEvents: [
      createSourceEvent({
        touchpointId: "vic-arrears-authenticated-handoff",
        sourceEventId: "checkpoint-event-3",
        sourceKind: "AUTHENTICATED_SURFACE_NOTE",
        authenticatedHandoffOnlySignal: false
      })
    ]
  }));

  if (outputResult.outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY output shell.");
  }

  assert.equal(outputResult.outputPackage.touchpointControlOutputs.authenticatedHandoffOnly, true);
  assert.ok(outputResult.outputPackage.blockKeys.includes("authenticated-surface-handoff"));
  assert.ok(handoffResult.guidance.guidanceBlockKeys.includes("authenticated-surface-handoff"));
  assert.equal(
    outputResult.touchpointSnapshotProduction.snapshots[0]?.authenticatedHandoffOnly,
    true
  );
});

test("BR03 hydration uses explicit registry-default fallback when persisted source events are missing", () => {
  const hydrated = hydrateOutputCheckpointForComposition(buildOutputInput({
    touchpointIds: ["vic-arrears-freshness-watch"]
  }));
  const outputResult = composeOutputPackageFromHydratedCheckpoint(buildOutputInput({
    touchpointIds: ["vic-arrears-freshness-watch"]
  }));

  if (outputResult.outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY output shell.");
  }

  assert.deepEqual(
    hydrated.touchpointSnapshotProduction.registryDefaultTouchpointIds,
    ["vic-arrears-freshness-watch"]
  );
  assert.equal(
    hydrated.touchpointSnapshotProduction.snapshots[0]?.source,
    "TOUCHPOINT_REGISTRY_DEFAULT"
  );
  assert.ok(
    hydrated.touchpointSnapshotProduction.snapshots[0]?.summary.includes(
      "does not assert live official parity"
    )
  );
  assert.equal(outputResult.outputPackage.touchpointControlOutputs.stale, false);
  assert.equal(outputResult.outputPackage.touchpointControlOutputs.liveConfirmationRequired, false);
});

test("BR03 output/handoff semantics remain stable after checkpoint hydration wiring", () => {
  const hydratedOutputResult = composeOutputPackageFromHydratedCheckpoint(buildOutputInput({
    touchpointIds: ["vic-arrears-public-form-warning"],
    out04TouchpointSourceEvents: [
      createSourceEvent({
        touchpointId: "vic-arrears-public-form-warning",
        sourceEventId: "checkpoint-event-4",
        sourceKind: "OFFICIAL_HANDOFF_CHECKPOINT",
        wrongChannelSignal: true
      })
    ]
  }));
  const hydratedHandoffResult = composeOfficialHandoffGuidanceFromHydratedCheckpoint(buildHandoffInput({
    touchpointIds: ["vic-arrears-public-form-warning"],
    out04TouchpointSourceEvents: [
      createSourceEvent({
        touchpointId: "vic-arrears-public-form-warning",
        sourceEventId: "checkpoint-event-4",
        sourceKind: "OFFICIAL_HANDOFF_CHECKPOINT",
        wrongChannelSignal: true
      })
    ]
  }));
  const directOutput = generateOutputPackageShell({
    matterId: "matter-hydration-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-public-form-warning"],
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-public-form-warning",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      })
    ]
  });
  const directHandoff = buildOfficialHandoffGuidanceShell({
    matterId: "matter-hydration-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-public-form-warning"],
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-public-form-warning",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      })
    ]
  });

  if (
    hydratedOutputResult.outputPackage.kind !== "PREP_PACK_COPY_READY"
    || directOutput.kind !== "PREP_PACK_COPY_READY"
  ) {
    throw new Error("Expected PREP_PACK_COPY_READY output shells.");
  }

  assert.deepEqual(
    hydratedOutputResult.outputPackage.touchpointControlOutputs,
    directOutput.touchpointControlOutputs
  );
  assert.deepEqual(
    hydratedOutputResult.outputPackage.blockKeys,
    directOutput.blockKeys
  );
  assert.equal(
    hydratedOutputResult.outputPackage.trustBinding.reviewHandoffState.handoff.posture,
    directOutput.trustBinding.reviewHandoffState.handoff.posture
  );
  assert.deepEqual(
    hydratedHandoffResult.guidance.guidanceBlockKeys,
    directHandoff.guidanceBlockKeys
  );
  assert.equal(
    hydratedHandoffResult.guidance.trustBinding.reviewHandoffState.handoff.posture,
    directHandoff.trustBinding.reviewHandoffState.handoff.posture
  );
});
