import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState
} from "../src/domain/model.js";
import { generateOutputPackageShell } from "../src/modules/output/index.js";
import { createTouchpointPostureSnapshot } from "../src/modules/touchpoints/index.js";
import {
  buildBr03TouchpointPostureSnapshots,
  type Br03TouchpointPostureSourceEvent
} from "../src/app/br03TouchpointSnapshotProducer.js";

function createSourceEvent(
  overrides: Partial<Br03TouchpointPostureSourceEvent> = {}
): Br03TouchpointPostureSourceEvent {
  return {
    touchpointId: "vic-arrears-freshness-watch",
    sourceEventId: "event-1",
    sourceKind: "OUTPUT_REVIEW_CHECKPOINT",
    capturedAt: "2026-04-24T10:00:00.000Z",
    ...overrides
  };
}

test("BR03 source-event producer maps stale signal into a stale source-fed snapshot", () => {
  const result = buildBr03TouchpointPostureSnapshots({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-freshness-watch"],
    sourceEvents: [
      createSourceEvent({
        freshnessSignal: "STALE"
      })
    ]
  });

  assert.equal(result.snapshots.length, 1);
  assert.equal(result.snapshots[0]?.freshnessPosture, "STALE");
  assert.equal(result.snapshots[0]?.source, "TOUCHPOINT_SOURCE_FEED");
  assert.deepEqual(result.appliedSourceEventIds, ["event-1"]);
  assert.deepEqual(result.registryDefaultTouchpointIds, []);
});

test("BR03 source-event producer maps live-confirmation-required signal without collapsing into stale", () => {
  const result = buildBr03TouchpointPostureSnapshots({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-freshness-watch"],
    sourceEvents: [
      createSourceEvent({
        freshnessSignal: "STALE",
        liveConfirmationRequiredSignal: true
      })
    ]
  });

  assert.equal(result.snapshots.length, 1);
  assert.equal(result.snapshots[0]?.freshnessPosture, "LIVE_CONFIRMATION_REQUIRED");
  assert.notEqual(result.snapshots[0]?.freshnessPosture, "STALE");
});

test("BR03 source-event producer maps wrong-channel signal into reroute channel posture", () => {
  const result = buildBr03TouchpointPostureSnapshots({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-public-form-warning"],
    sourceEvents: [
      createSourceEvent({
        touchpointId: "vic-arrears-public-form-warning",
        sourceEventId: "event-2",
        sourceKind: "CHANNEL_CONTEXT_NOTE",
        wrongChannelSignal: true,
        observedChannelOrPath: "legacy-form-path",
        expectedChannelOrPath: "vcat-current-flow"
      })
    ]
  });

  assert.equal(result.snapshots.length, 1);
  assert.equal(result.snapshots[0]?.channelPosture, "WRONG_CHANNEL_REROUTE");
  assert.equal(result.snapshots[0]?.source, "TOUCHPOINT_SOURCE_FEED");
  assert.ok(result.snapshots[0]?.summary.includes("legacy-form-path"));
  assert.ok(result.snapshots[0]?.summary.includes("vcat-current-flow"));
});

test("BR03 source-event producer keeps authenticated touchpoint handoff-only from persisted source events", () => {
  const result = buildBr03TouchpointPostureSnapshots({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-authenticated-handoff"],
    sourceEvents: [
      createSourceEvent({
        touchpointId: "vic-arrears-authenticated-handoff",
        sourceEventId: "event-3",
        sourceKind: "AUTHENTICATED_SURFACE_NOTE",
        authenticatedHandoffOnlySignal: false
      })
    ]
  });

  assert.equal(result.snapshots.length, 1);
  assert.equal(result.snapshots[0]?.authenticatedHandoffOnly, true);
  assert.equal(result.snapshots[0]?.source, "TOUCHPOINT_SOURCE_FEED");
});

test("BR03 source-event producer emits explicit registry-default fallback when no source event exists", () => {
  const result = buildBr03TouchpointPostureSnapshots({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-freshness-watch"]
  });

  assert.equal(result.snapshots.length, 1);
  assert.equal(result.snapshots[0]?.source, "TOUCHPOINT_REGISTRY_DEFAULT");
  assert.ok(
    result.snapshots[0]?.summary.includes(
      "does not assert live official parity"
    )
  );
  assert.deepEqual(result.appliedSourceEventIds, []);
  assert.deepEqual(result.registryDefaultTouchpointIds, ["vic-arrears-freshness-watch"]);
});

test("BR03 downstream semantics stay stable when snapshots are produced upstream from source events", () => {
  const sourceProduced = buildBr03TouchpointPostureSnapshots({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-public-form-warning"],
    sourceEvents: [
      createSourceEvent({
        touchpointId: "vic-arrears-public-form-warning",
        sourceEventId: "event-4",
        sourceKind: "OFFICIAL_HANDOFF_CHECKPOINT",
        wrongChannelSignal: true
      })
    ]
  });
  const outputFromProducer = generateOutputPackageShell({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-public-form-warning"],
    touchpointPostureSnapshots: sourceProduced.snapshots
  });
  const outputFromDirectSnapshot = generateOutputPackageShell({
    matterId: "matter-1",
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

  if (
    outputFromProducer.kind !== "PREP_PACK_COPY_READY"
    || outputFromDirectSnapshot.kind !== "PREP_PACK_COPY_READY"
  ) {
    throw new Error("Expected PREP_PACK_COPY_READY output shells.");
  }

  assert.deepEqual(
    outputFromProducer.touchpointControlOutputs,
    outputFromDirectSnapshot.touchpointControlOutputs
  );
  assert.deepEqual(outputFromProducer.blockKeys, outputFromDirectSnapshot.blockKeys);
  assert.equal(outputFromProducer.blockKeys.includes("wrong-channel-reroute"), true);
  assert.equal(outputFromProducer.blockKeys.includes("referral-stop"), true);
  assert.equal(
    outputFromProducer.trustBinding.reviewHandoffState.handoff.posture,
    outputFromDirectSnapshot.trustBinding.reviewHandoffState.handoff.posture
  );
});
