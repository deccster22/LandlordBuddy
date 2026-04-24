import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState
} from "../src/domain/model.js";
import { buildOfficialHandoffGuidanceShell } from "../src/modules/handoff/index.js";
import {
  generateOutputPackageShell,
  selectOutputShell
} from "../src/modules/output/index.js";
import {
  createTouchpointPostureSnapshot,
  resolveTouchpointControl,
  touchpointClassifications
} from "../src/modules/touchpoints/index.js";

test("BR03 touchpoint control resolves stable public mirror posture", () => {
  const resolution = resolveTouchpointControl({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-public-rule"]
  });

  assert.equal(resolution.touchpoints.length, 1);
  assert.equal(resolution.controlOutputs.stablePublicMirrorAllowed, true);
  assert.equal(resolution.controlOutputs.publicMirrorAllowedWithWarning, false);
  assert.equal(resolution.controlOutputs.deferToLiveOfficialFlow, false);
  assert.equal(resolution.controlOutputs.authenticatedHandoffOnly, false);
  assert.equal(resolution.controlOutputs.stale, false);
  assert.equal(resolution.controlOutputs.liveConfirmationRequired, false);
  assert.equal(resolution.controlOutputs.wrongChannelReroute, false);
  assert.deepEqual(resolution.carryForwardControls, []);
});

test("BR03 touchpoint control resolves mirror-with-warning posture", () => {
  const resolution = resolveTouchpointControl({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-public-form-warning"]
  });

  assert.equal(resolution.controlOutputs.stablePublicMirrorAllowed, false);
  assert.equal(resolution.controlOutputs.publicMirrorAllowedWithWarning, true);
  assert.equal(resolution.controlOutputs.deferToLiveOfficialFlow, false);
  assert.ok(
    resolution.carryForwardControls.some(
      (control) => control.code === "PUBLIC_FORM_WARNING"
        && control.severity === "WARNING"
    )
  );
});

test("BR03 mirror-with-warning posture threads warning-led carry-forward controls into output selection", () => {
  const selection = selectOutputShell({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-public-form-warning"]
  });

  assert.equal(selection.touchpointControlOutputs.publicMirrorAllowedWithWarning, true);
  assert.ok(
    selection.carryForwardControls.some(
      (control) => control.code === "PUBLIC_FORM_WARNING"
        && control.severity === "WARNING"
        && control.touchpointId === "vic-arrears-public-form-warning"
    )
  );
});

test("BR03 touchpoint control resolves defer/authenticated posture as handoff-only", () => {
  const resolution = resolveTouchpointControl({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-authenticated-handoff"]
  });

  assert.equal(resolution.controlOutputs.deferToLiveOfficialFlow, true);
  assert.equal(resolution.controlOutputs.authenticatedHandoffOnly, true);
  assert.equal(
    resolution.resolvedPostures[0]?.postureSnapshot.authenticatedHandoffOnly,
    true
  );
  assert.equal(
    resolution.resolvedPostures[0]?.postureSnapshot.source,
    "TOUCHPOINT_REGISTRY_DEFAULT"
  );
  assert.ok(
    resolution.carryForwardControls.some(
      (control) => control.code === "AUTHENTICATED_TOUCHPOINT_HANDOFF_ONLY"
        && control.severity === "SLOWDOWN"
    )
  );
});

test("BR03 touchpoint control resolves stale freshness posture without collapsing into live confirmation", () => {
  const resolution = resolveTouchpointControl({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-freshness-watch"],
    postureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "STALE"
      })
    ]
  });

  assert.equal(resolution.controlOutputs.stale, true);
  assert.equal(resolution.controlOutputs.liveConfirmationRequired, false);
  assert.equal(resolution.resolvedPostures[0]?.postureSnapshot.source, "TOUCHPOINT_SOURCE_FEED");
  assert.ok(
    resolution.carryForwardControls.some(
      (control) => control.code === "TOUCHPOINT_STALE"
        && control.severity === "WARNING"
    )
  );
});

test("BR03 touchpoint control resolves live-confirmation posture as slowdown control", () => {
  const resolution = resolveTouchpointControl({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-freshness-watch"],
    postureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      })
    ]
  });

  assert.equal(resolution.controlOutputs.stale, false);
  assert.equal(resolution.controlOutputs.liveConfirmationRequired, true);
  assert.ok(
    resolution.carryForwardControls.some(
      (control) => control.code === "TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED"
        && control.severity === "SLOWDOWN"
    )
  );
});

test("BR03 touchpoint control resolves wrong-channel posture as reroute referral", () => {
  const resolution = resolveTouchpointControl({
    forumPath: "VIC_VCAT_RENT_ARREARS",
    touchpointIds: ["vic-arrears-public-form-warning"],
    postureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-public-form-warning",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      })
    ]
  });

  assert.equal(resolution.controlOutputs.wrongChannelReroute, true);
  assert.equal(resolution.controlOutputs.deferToLiveOfficialFlow, true);
  assert.equal(resolution.controlOutputs.stablePublicMirrorAllowed, false);
  assert.equal(resolution.controlOutputs.publicMirrorAllowedWithWarning, false);
  assert.equal(
    resolution.resolvedPostures[0]?.postureSnapshot.source,
    "TOUCHPOINT_SOURCE_FEED"
  );
  assert.ok(
    resolution.carryForwardControls.some(
      (control) => control.code === "TOUCHPOINT_WRONG_CHANNEL_REROUTE"
        && control.severity === "REFERRAL"
    )
  );
});

test("BR03 control outputs drive handoff guidance stale, live confirmation, and wrong-channel reroute blocks", () => {
  const commonInput = {
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-freshness-watch"]
  } as const;

  const staleGuidance = buildOfficialHandoffGuidanceShell({
    ...commonInput,
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "STALE"
      })
    ]
  });
  const liveGuidance = buildOfficialHandoffGuidanceShell({
    ...commonInput,
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      })
    ]
  });
  const wrongChannelGuidance = buildOfficialHandoffGuidanceShell({
    ...commonInput,
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      })
    ]
  });

  assert.ok(staleGuidance.guidanceBlockKeys.includes("touchpoint-stale"));
  assert.ok(!staleGuidance.guidanceBlockKeys.includes("live-confirmation-required"));
  assert.ok(liveGuidance.guidanceBlockKeys.includes("live-confirmation-required"));
  assert.ok(liveGuidance.guidanceBlockKeys.includes("slowdown-review"));
  assert.equal(
    liveGuidance.trustBinding.reviewHandoffState.handoff.posture,
    "GUARDED_REVIEW_REQUIRED"
  );
  assert.ok(wrongChannelGuidance.guidanceBlockKeys.includes("wrong-channel-reroute"));
  assert.ok(wrongChannelGuidance.guidanceBlockKeys.includes("referral-stop"));
  assert.equal(
    wrongChannelGuidance.trustBinding.reviewHandoffState.handoff.posture,
    "REFERRAL_STOP"
  );
});

test("BR03 stale and live-confirmation posture stay distinct in prep-pack downstream output blocks", () => {
  const commonInput = {
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-freshness-watch"]
  } as const;

  const stalePrepPack = generateOutputPackageShell({
    ...commonInput,
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "STALE"
      })
    ]
  });
  const livePrepPack = generateOutputPackageShell({
    ...commonInput,
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      })
    ]
  });

  if (stalePrepPack.kind !== "PREP_PACK_COPY_READY" || livePrepPack.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY output shells.");
  }

  assert.ok(stalePrepPack.blockKeys.includes("touchpoint-stale"));
  assert.ok(!stalePrepPack.blockKeys.includes("live-confirmation-required"));
  assert.ok(stalePrepPack.trustBinding.reviewStateKeys.includes("review-state.touchpoint-stale"));
  assert.ok(!stalePrepPack.trustBinding.reviewStateKeys.includes("review-state.live-confirmation-required"));

  assert.ok(livePrepPack.blockKeys.includes("live-confirmation-required"));
  assert.ok(!livePrepPack.blockKeys.includes("touchpoint-stale"));
  assert.ok(livePrepPack.trustBinding.reviewStateKeys.includes("review-state.live-confirmation-required"));
  assert.ok(!livePrepPack.trustBinding.reviewStateKeys.includes("review-state.touchpoint-stale"));
});

test("BR03 wrong-channel reroute forces prep-pack referral posture and suppresses copy-ready fallback", () => {
  const outputPackage = generateOutputPackageShell({
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

  if (outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY output shell.");
  }

  assert.ok(outputPackage.blockKeys.includes("wrong-channel-reroute"));
  assert.ok(outputPackage.blockKeys.includes("referral-stop"));
  assert.ok(!outputPackage.blockKeys.includes("copy-ready-facts"));
  assert.equal(outputPackage.touchpointControlOutputs.wrongChannelReroute, true);
  assert.equal(outputPackage.touchpointControlOutputs.deferToLiveOfficialFlow, true);
  assert.equal(
    outputPackage.trustBinding.reviewHandoffState.handoff.posture,
    "REFERRAL_STOP"
  );
  assert.equal(
    outputPackage.trustBinding.reviewHandoffState.ownership.nextAction.kind,
    "REFER_OUTSIDE_STANDARD_PATH"
  );
  assert.equal(outputPackage.rendererState.progression.referredOut, true);
});

test("BR03 wrong-channel reroute and authenticated handoff-only posture remain explicit through output guidance packaging", () => {
  const outputPackage = generateOutputPackageShell({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: [
      "vic-arrears-authenticated-handoff",
      "vic-arrears-freshness-watch"
    ],
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-freshness-watch",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      })
    ]
  });

  if (outputPackage.kind !== "OFFICIAL_HANDOFF_GUIDANCE") {
    throw new Error("Expected OFFICIAL_HANDOFF_GUIDANCE output shell.");
  }

  assert.equal(outputPackage.touchpointControlOutputs.authenticatedHandoffOnly, true);
  assert.equal(outputPackage.touchpointControlOutputs.wrongChannelReroute, true);
  assert.ok(outputPackage.guidance.guidanceBlockKeys.includes("authenticated-surface-handoff"));
  assert.ok(outputPackage.guidance.guidanceBlockKeys.includes("wrong-channel-reroute"));
  assert.ok(outputPackage.guidance.guidanceBlockKeys.includes("referral-stop"));
  assert.ok(
    outputPackage.guidance.carryForwardControls.some(
      (control) => control.code === "AUTHENTICATED_TOUCHPOINT_HANDOFF_ONLY"
        && control.severity === "SLOWDOWN"
    )
  );
});

test("BR03 source-fed snapshots keep downstream prep-pack semantics aligned with registry-default posture", () => {
  const baseOutputPackage = generateOutputPackageShell({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-authenticated-handoff"]
  });
  const sourceFedOutputPackage = generateOutputPackageShell({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-authenticated-handoff"],
    touchpointPostureSnapshots: [
      createTouchpointPostureSnapshot({
        touchpointId: "vic-arrears-authenticated-handoff"
      })
    ]
  });

  if (
    baseOutputPackage.kind !== "PREP_PACK_COPY_READY"
    || sourceFedOutputPackage.kind !== "PREP_PACK_COPY_READY"
  ) {
    throw new Error("Expected PREP_PACK_COPY_READY output shells.");
  }

  assert.deepEqual(
    sourceFedOutputPackage.touchpointControlOutputs,
    baseOutputPackage.touchpointControlOutputs
  );
  assert.deepEqual(sourceFedOutputPackage.blockKeys, baseOutputPackage.blockKeys);
  assert.equal(
    sourceFedOutputPackage.trustBinding.reviewHandoffState.handoff.posture,
    baseOutputPackage.trustBinding.reviewHandoffState.handoff.posture
  );
});

test("BR03 touchpoint registry classifications stay in the first-wave mirror/warn/defer set", () => {
  const resolution = resolveTouchpointControl({
    forumPath: "VIC_VCAT_RENT_ARREARS"
  });
  const seenClassifications = new Set(
    resolution.touchpoints.map((touchpoint) => touchpoint.classification)
  );

  assert.deepEqual([...seenClassifications].sort(), [...touchpointClassifications].sort());
});

test("BR03 touchpoint controls do not drift frozen Lane 2 boundary and trust surfaces", () => {
  const guidance = buildOfficialHandoffGuidanceShell({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    touchpointIds: ["vic-arrears-authenticated-handoff"]
  });

  assert.deepEqual(guidance.boundaryCodes, [
    "PREP_AND_HANDOFF_ONLY",
    "NO_PRODUCT_SUBMISSION",
    "NO_PORTAL_MIMICRY"
  ]);
  assert.ok(
    guidance.trustBinding.boundaryStatementKeys.includes("boundary.prep-and-handoff-only")
  );
  assert.ok(
    guidance.trustBinding.boundaryStatementKeys.includes("boundary.no-product-submission")
  );
  assert.ok(
    guidance.trustBinding.boundaryStatementKeys.includes("boundary.no-portal-mimicry")
  );
});
