import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState
} from "../src/domain/model.js";
import { generateOutputPackageShell } from "../src/modules/output/index.js";
import {
  deriveTouchpointConsequenceSurfaceKeys,
  resolveTouchpointControl,
  type TouchpointControlOutputs,
  type TouchpointPostureOverride
} from "../src/modules/touchpoints/index.js";

interface TouchpointMatrixCase {
  name: string;
  touchpointIds: readonly string[];
  postureOverrides?: readonly TouchpointPostureOverride[];
  expectedControlOutputs: TouchpointControlOutputs;
  expectedControlCodes: readonly string[];
}

const touchpointMatrixCases: readonly TouchpointMatrixCase[] = [
  {
    name: "stale + live-confirmation-required",
    touchpointIds: ["vic-arrears-public-rule", "vic-arrears-freshness-watch"],
    postureOverrides: [
      {
        touchpointId: "vic-arrears-public-rule",
        freshnessPosture: "STALE"
      },
      {
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      }
    ],
    expectedControlOutputs: {
      stablePublicMirrorAllowed: true,
      publicMirrorAllowedWithWarning: false,
      deferToLiveOfficialFlow: true,
      authenticatedHandoffOnly: false,
      stale: true,
      liveConfirmationRequired: true,
      wrongChannelReroute: false
    },
    expectedControlCodes: [
      "TOUCHPOINT_STALE",
      "TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED"
    ]
  },
  {
    name: "mirror-with-warning + stale",
    touchpointIds: ["vic-arrears-public-form-warning"],
    postureOverrides: [
      {
        touchpointId: "vic-arrears-public-form-warning",
        freshnessPosture: "STALE"
      }
    ],
    expectedControlOutputs: {
      stablePublicMirrorAllowed: false,
      publicMirrorAllowedWithWarning: true,
      deferToLiveOfficialFlow: false,
      authenticatedHandoffOnly: false,
      stale: true,
      liveConfirmationRequired: false,
      wrongChannelReroute: false
    },
    expectedControlCodes: ["PUBLIC_FORM_WARNING", "TOUCHPOINT_STALE"]
  },
  {
    name: "mirror-with-warning + live-confirmation-required",
    touchpointIds: ["vic-arrears-public-form-warning"],
    postureOverrides: [
      {
        touchpointId: "vic-arrears-public-form-warning",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      }
    ],
    expectedControlOutputs: {
      stablePublicMirrorAllowed: false,
      publicMirrorAllowedWithWarning: true,
      deferToLiveOfficialFlow: false,
      authenticatedHandoffOnly: false,
      stale: false,
      liveConfirmationRequired: true,
      wrongChannelReroute: false
    },
    expectedControlCodes: [
      "PUBLIC_FORM_WARNING",
      "TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED"
    ]
  },
  {
    name: "wrong-channel + stale",
    touchpointIds: ["vic-arrears-public-form-warning"],
    postureOverrides: [
      {
        touchpointId: "vic-arrears-public-form-warning",
        freshnessPosture: "STALE",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      }
    ],
    expectedControlOutputs: {
      stablePublicMirrorAllowed: false,
      publicMirrorAllowedWithWarning: false,
      deferToLiveOfficialFlow: true,
      authenticatedHandoffOnly: false,
      stale: true,
      liveConfirmationRequired: false,
      wrongChannelReroute: true
    },
    expectedControlCodes: [
      "PUBLIC_FORM_WARNING",
      "TOUCHPOINT_STALE",
      "TOUCHPOINT_WRONG_CHANNEL_REROUTE"
    ]
  },
  {
    name: "wrong-channel + live-confirmation-required",
    touchpointIds: ["vic-arrears-public-form-warning"],
    postureOverrides: [
      {
        touchpointId: "vic-arrears-public-form-warning",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      }
    ],
    expectedControlOutputs: {
      stablePublicMirrorAllowed: false,
      publicMirrorAllowedWithWarning: false,
      deferToLiveOfficialFlow: true,
      authenticatedHandoffOnly: false,
      stale: false,
      liveConfirmationRequired: true,
      wrongChannelReroute: true
    },
    expectedControlCodes: [
      "PUBLIC_FORM_WARNING",
      "TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED",
      "TOUCHPOINT_WRONG_CHANNEL_REROUTE"
    ]
  },
  {
    name: "wrong-channel + authenticated-handoff-only",
    touchpointIds: [
      "vic-arrears-public-form-warning",
      "vic-arrears-authenticated-handoff"
    ],
    postureOverrides: [
      {
        touchpointId: "vic-arrears-public-form-warning",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      }
    ],
    expectedControlOutputs: {
      stablePublicMirrorAllowed: false,
      publicMirrorAllowedWithWarning: false,
      deferToLiveOfficialFlow: true,
      authenticatedHandoffOnly: true,
      stale: false,
      liveConfirmationRequired: false,
      wrongChannelReroute: true
    },
    expectedControlCodes: [
      "PUBLIC_FORM_WARNING",
      "AUTHENTICATED_TOUCHPOINT_HANDOFF_ONLY",
      "TOUCHPOINT_WRONG_CHANNEL_REROUTE"
    ]
  },
  {
    name: "authenticated-handoff-only + mirror-with-warning",
    touchpointIds: [
      "vic-arrears-authenticated-handoff",
      "vic-arrears-public-form-warning"
    ],
    expectedControlOutputs: {
      stablePublicMirrorAllowed: false,
      publicMirrorAllowedWithWarning: false,
      deferToLiveOfficialFlow: true,
      authenticatedHandoffOnly: true,
      stale: false,
      liveConfirmationRequired: false,
      wrongChannelReroute: false
    },
    expectedControlCodes: [
      "PUBLIC_FORM_WARNING",
      "AUTHENTICATED_TOUCHPOINT_HANDOFF_ONLY"
    ]
  },
  {
    name: "multiple mixed touchpoints with conflicting posture",
    touchpointIds: [
      "vic-arrears-public-rule",
      "vic-arrears-public-form-warning",
      "vic-arrears-authenticated-handoff",
      "vic-arrears-freshness-watch"
    ],
    postureOverrides: [
      {
        touchpointId: "vic-arrears-public-rule",
        freshnessPosture: "STALE"
      },
      {
        touchpointId: "vic-arrears-public-form-warning",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      },
      {
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      }
    ],
    expectedControlOutputs: {
      stablePublicMirrorAllowed: false,
      publicMirrorAllowedWithWarning: false,
      deferToLiveOfficialFlow: true,
      authenticatedHandoffOnly: true,
      stale: true,
      liveConfirmationRequired: true,
      wrongChannelReroute: true
    },
    expectedControlCodes: [
      "PUBLIC_FORM_WARNING",
      "AUTHENTICATED_TOUCHPOINT_HANDOFF_ONLY",
      "TOUCHPOINT_STALE",
      "TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED",
      "TOUCHPOINT_WRONG_CHANNEL_REROUTE"
    ]
  }
];

const commonOutputInput = {
  matterId: "matter-1",
  forumPath: createForumPathState({
    path: "VIC_VCAT_RENT_ARREARS"
  }),
  officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF")
} as const;

test("BR03 matrix keeps mixed-touchpoint precedence explicit at resolver level", () => {
  for (const matrixCase of touchpointMatrixCases) {
    const resolution = resolveTouchpointControl({
      forumPath: "VIC_VCAT_RENT_ARREARS",
      touchpointIds: matrixCase.touchpointIds,
      ...(matrixCase.postureOverrides
        ? { postureOverrides: matrixCase.postureOverrides }
        : {})
    });

    assert.deepEqual(
      resolution.controlOutputs,
      matrixCase.expectedControlOutputs,
      `${matrixCase.name} should preserve expected BR03 precedence outputs`
    );
    assertHasControlCodes({
      caseName: matrixCase.name,
      actualCodes: resolution.carryForwardControls.map((control) => control.code),
      expectedCodes: matrixCase.expectedControlCodes
    });
  }
});

test("BR03 matrix keeps prep-pack, handoff, renderer, and carry-forward posture aligned", () => {
  for (const matrixCase of touchpointMatrixCases) {
    const prepPack = generateOutputPackageShell({
      ...commonOutputInput,
      outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
      touchpointIds: matrixCase.touchpointIds,
      ...(matrixCase.postureOverrides
        ? { touchpointPostureOverrides: matrixCase.postureOverrides }
        : {})
    });

    if (prepPack.kind !== "PREP_PACK_COPY_READY") {
      throw new Error("Expected PREP_PACK_COPY_READY output shell.");
    }

    assert.deepEqual(
      prepPack.touchpointControlOutputs,
      matrixCase.expectedControlOutputs,
      `${matrixCase.name} prep-pack outputs should match resolver precedence`
    );
    assertHasControlCodes({
      caseName: matrixCase.name,
      actualCodes: prepPack.carryForwardControls.map((control) => control.code),
      expectedCodes: matrixCase.expectedControlCodes
    });
    assertExpectedTouchpointSurfaceKeys({
      caseName: matrixCase.name,
      surfaceKeys: prepPack.blockKeys,
      expectedControlOutputs: matrixCase.expectedControlOutputs
    });
    assertExpectedReviewStateKeys({
      caseName: matrixCase.name,
      reviewStateKeys: prepPack.trustBinding.reviewStateKeys,
      expectedControlOutputs: matrixCase.expectedControlOutputs
    });

    if (matrixCase.expectedControlOutputs.wrongChannelReroute) {
      assert.ok(prepPack.blockKeys.includes("referral-stop"));
      assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"));
      assert.equal(prepPack.trustBinding.reviewHandoffState.handoff.posture, "REFERRAL_STOP");
      assert.equal(prepPack.rendererState.progression.referredOut, true);
      assert.equal(prepPack.rendererState.ownership.nextAction.kind, "REFER_OUTSIDE_STANDARD_PATH");
    }

    const handoff = generateOutputPackageShell({
      ...commonOutputInput,
      outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
      touchpointIds: matrixCase.touchpointIds,
      ...(matrixCase.postureOverrides
        ? { touchpointPostureOverrides: matrixCase.postureOverrides }
        : {})
    });

    if (handoff.kind !== "OFFICIAL_HANDOFF_GUIDANCE") {
      throw new Error("Expected OFFICIAL_HANDOFF_GUIDANCE output shell.");
    }

    assert.deepEqual(
      handoff.touchpointControlOutputs,
      matrixCase.expectedControlOutputs,
      `${matrixCase.name} handoff outputs should match resolver precedence`
    );
    assertHasControlCodes({
      caseName: matrixCase.name,
      actualCodes: handoff.guidance.carryForwardControls.map((control) => control.code),
      expectedCodes: matrixCase.expectedControlCodes
    });
    assertExpectedTouchpointSurfaceKeys({
      caseName: matrixCase.name,
      surfaceKeys: handoff.guidance.guidanceBlockKeys,
      expectedControlOutputs: matrixCase.expectedControlOutputs
    });
    assertExpectedReviewStateKeys({
      caseName: matrixCase.name,
      reviewStateKeys: handoff.guidance.trustBinding.reviewStateKeys,
      expectedControlOutputs: matrixCase.expectedControlOutputs
    });

    if (matrixCase.expectedControlOutputs.wrongChannelReroute) {
      assert.ok(handoff.guidance.guidanceBlockKeys.includes("referral-stop"));
      assert.equal(handoff.guidance.trustBinding.reviewHandoffState.handoff.posture, "REFERRAL_STOP");
      assert.equal(handoff.rendererState.progression.referredOut, true);
      assert.equal(handoff.rendererState.ownership.nextAction.kind, "REFER_OUTSIDE_STANDARD_PATH");
    }
  }
});

function assertExpectedTouchpointSurfaceKeys(input: {
  caseName: string;
  surfaceKeys: readonly string[];
  expectedControlOutputs: TouchpointControlOutputs;
}): void {
  const expectedSurfaceKeys = deriveTouchpointConsequenceSurfaceKeys(input.expectedControlOutputs);

  for (const expectedSurfaceKey of expectedSurfaceKeys) {
    assert.ok(
      input.surfaceKeys.includes(expectedSurfaceKey),
      `${input.caseName} should include surface key ${expectedSurfaceKey}`
    );
  }
}

function assertExpectedReviewStateKeys(input: {
  caseName: string;
  reviewStateKeys: readonly string[];
  expectedControlOutputs: TouchpointControlOutputs;
}): void {
  const expectsStale = input.expectedControlOutputs.stale;
  const expectsLive = input.expectedControlOutputs.liveConfirmationRequired;
  const expectsWrongChannel = input.expectedControlOutputs.wrongChannelReroute;

  if (expectsStale) {
    assert.ok(
      input.reviewStateKeys.includes("review-state.touchpoint-stale"),
      `${input.caseName} should include review-state.touchpoint-stale`
    );
  }

  if (!expectsStale) {
    assert.ok(
      !input.reviewStateKeys.includes("review-state.touchpoint-stale"),
      `${input.caseName} should not include review-state.touchpoint-stale`
    );
  }

  if (expectsLive) {
    assert.ok(
      input.reviewStateKeys.includes("review-state.live-confirmation-required"),
      `${input.caseName} should include review-state.live-confirmation-required`
    );
  }

  if (!expectsLive) {
    assert.ok(
      !input.reviewStateKeys.includes("review-state.live-confirmation-required"),
      `${input.caseName} should not include review-state.live-confirmation-required`
    );
  }

  if (expectsWrongChannel) {
    assert.ok(
      input.reviewStateKeys.includes("review-state.wrong-channel-reroute"),
      `${input.caseName} should include review-state.wrong-channel-reroute`
    );
  }
}

function assertHasControlCodes(input: {
  caseName: string;
  actualCodes: readonly string[];
  expectedCodes: readonly string[];
}): void {
  for (const expectedCode of input.expectedCodes) {
    assert.ok(
      input.actualCodes.includes(expectedCode),
      `${input.caseName} should include carry-forward code ${expectedCode}`
    );
  }
}
