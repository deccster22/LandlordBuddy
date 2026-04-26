import test from "node:test";
import assert from "node:assert/strict";

import {
  assessBr02ServiceEvent,
  buildBr02EvidenceTimingState,
  createBr02ServiceEventRecord
} from "../src/modules/br02/index.js";
import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState,
  type PaymentRecord,
  type RentCharge
} from "../src/domain/model.js";
import { calculateArrearsStatusShell } from "../src/modules/arrears/index.js";
import {
  generateOutputPackageShell,
  type OfficialHandoffGuidancePackageShell,
  type OutputSelectionInput,
  type PrepPackOutputPackageShell
} from "../src/modules/output/index.js";
import { buildTimelineEngineShell } from "../src/modules/timeline/index.js";
import {
  createTouchpointPostureSnapshot,
  type CreateTouchpointPostureSnapshotInput
} from "../src/modules/touchpoints/index.js";

interface Br02AssessmentInput {
  seed: string;
  staleStateCode: "STALE_WARNING" | "STALE_SLOWDOWN";
  withHearingOverride: boolean;
}

interface L3TimelineMatrixCase {
  name: string;
  br02: Br02AssessmentInput;
  touchpointIds: readonly string[];
  touchpointPostureSnapshotInputs: readonly CreateTouchpointPostureSnapshotInput[];
  expectedTouchpointControls: {
    stale: boolean;
    liveConfirmationRequired: boolean;
    wrongChannelReroute: boolean;
    authenticatedHandoffOnly: boolean;
  };
}

const thresholdRule = {
  version: "P4A-CX-02-shell-v1",
  minimumDaysOverdue: 14,
  minimumOutstandingAmount: { amountMinor: 100000, currency: "AUD" as const }
};

const charge = (overrides: Partial<RentCharge> = {}): RentCharge => ({
  id: "charge-l3-combo",
  tenancyId: "tenancy-l3-combo",
  dueDate: "2026-03-10",
  amount: { amountMinor: 125000, currency: "AUD" },
  periodStartDate: "2026-03-03",
  periodEndDate: "2026-03-09",
  sourceReferenceIds: [],
  ...overrides
});

const matrixCases: readonly L3TimelineMatrixCase[] = [
  {
    name: "timeline-blocked + stale slowdown + wrong-channel reroute",
    br02: {
      seed: "blocked-stale-slowdown-wrong-channel",
      staleStateCode: "STALE_SLOWDOWN",
      withHearingOverride: false
    },
    touchpointIds: ["vic-arrears-freshness-watch"],
    touchpointPostureSnapshotInputs: [
      {
        touchpointId: "vic-arrears-freshness-watch",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      }
    ],
    expectedTouchpointControls: {
      stale: false,
      liveConfirmationRequired: false,
      wrongChannelReroute: true,
      authenticatedHandoffOnly: false
    }
  },
  {
    name: "timeline-blocked + stale warning + live-confirmation-required",
    br02: {
      seed: "blocked-stale-warning-live-confirmation",
      staleStateCode: "STALE_WARNING",
      withHearingOverride: false
    },
    touchpointIds: ["vic-arrears-freshness-watch"],
    touchpointPostureSnapshotInputs: [
      {
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      }
    ],
    expectedTouchpointControls: {
      stale: false,
      liveConfirmationRequired: true,
      wrongChannelReroute: false,
      authenticatedHandoffOnly: false
    }
  },
  {
    name: "timeline-blocked + hearing override + wrong-channel reroute",
    br02: {
      seed: "blocked-hearing-override-wrong-channel",
      staleStateCode: "STALE_SLOWDOWN",
      withHearingOverride: true
    },
    touchpointIds: ["vic-arrears-public-form-warning"],
    touchpointPostureSnapshotInputs: [
      {
        touchpointId: "vic-arrears-public-form-warning",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      }
    ],
    expectedTouchpointControls: {
      stale: false,
      liveConfirmationRequired: false,
      wrongChannelReroute: true,
      authenticatedHandoffOnly: false
    }
  },
  {
    name: "timeline-blocked + hearing override + live-confirmation-required",
    br02: {
      seed: "blocked-hearing-override-live-confirmation",
      staleStateCode: "STALE_WARNING",
      withHearingOverride: true
    },
    touchpointIds: ["vic-arrears-freshness-watch"],
    touchpointPostureSnapshotInputs: [
      {
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      }
    ],
    expectedTouchpointControls: {
      stale: false,
      liveConfirmationRequired: true,
      wrongChannelReroute: false,
      authenticatedHandoffOnly: false
    }
  },
  {
    name: "timeline-blocked + mixed stale/live/wrong-channel precedence collision",
    br02: {
      seed: "blocked-mixed-stale-live-wrong",
      staleStateCode: "STALE_SLOWDOWN",
      withHearingOverride: true
    },
    touchpointIds: [
      "vic-arrears-freshness-watch",
      "vic-arrears-authenticated-handoff",
      "vic-arrears-public-form-warning"
    ],
    touchpointPostureSnapshotInputs: [
      {
        touchpointId: "vic-arrears-freshness-watch",
        freshnessPosture: "STALE"
      },
      {
        touchpointId: "vic-arrears-authenticated-handoff",
        freshnessPosture: "LIVE_CONFIRMATION_REQUIRED"
      },
      {
        touchpointId: "vic-arrears-public-form-warning",
        channelPosture: "WRONG_CHANNEL_REROUTE"
      }
    ],
    expectedTouchpointControls: {
      stale: true,
      liveConfirmationRequired: true,
      wrongChannelReroute: true,
      authenticatedHandoffOnly: true
    }
  }
];

function payment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: "payment-l3-combo",
    tenancyId: "tenancy-l3-combo",
    receivedAt: "2026-03-12T09:00:00.000Z",
    amount: { amountMinor: 25000, currency: "AUD" },
    sourceReferenceIds: [],
    ...overrides
  };
}

function buildTimelineBlockedShell() {
  const arrears = calculateArrearsStatusShell({
    charges: [charge({
      dueDate: "2026-03-27",
      periodStartDate: "2026-03-20",
      periodEndDate: "2026-03-26"
    })],
    payments: [payment()],
    thresholdRule,
    asAt: "2026-04-02T10:00:00.000Z"
  });

  return buildTimelineEngineShell({ arrears });
}

function buildBr02Assessment(input: Br02AssessmentInput) {
  const serviceEvent = createBr02ServiceEventRecord({
    id: `service-${input.seed}`,
    matterId: `matter-${input.seed}`,
    renterPartyId: `renter-${input.seed}`,
    serviceMethod: "REGISTERED_POST",
    occurredAt: "2026-04-06T10:00:00.000Z"
  });
  const evidenceTimingState = buildBr02EvidenceTimingState({
    id: `timing-${input.seed}`,
    matterId: `matter-${input.seed}`,
    renterPartyId: `renter-${input.seed}`,
    serviceEventId: serviceEvent.id,
    staleStateCode: input.staleStateCode,
    ...(input.withHearingOverride
      ? {
          hearingSpecificOverride: {
            code: `HEARING-${input.seed.toUpperCase()}`,
            label: "Hearing override",
            relativeTo: "HEARING_NOTICE" as const,
            offsetDays: 1,
            dayCountKind: "CALENDAR" as const
          }
        }
      : {})
  });

  return assessBr02ServiceEvent({
    thresholdState: "THRESHOLD_MET",
    serviceEvent,
    evidenceTimingState,
    ...(input.withHearingOverride
      ? { hearingNoticeAt: "2026-04-07T10:00:00.000Z" }
      : {})
  });
}

function buildOutputSelectionInput(
  overrides: Partial<OutputSelectionInput> = {}
): OutputSelectionInput {
  return {
    matterId: "matter-l3-combinatorial",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    ...overrides
  };
}

function expectPrepPack(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): PrepPackOutputPackageShell {
  if (outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY output shell.");
  }

  return outputPackage;
}

function expectHandoffGuidance(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): OfficialHandoffGuidancePackageShell {
  if (outputPackage.kind !== "OFFICIAL_HANDOFF_GUIDANCE") {
    throw new Error("Expected OFFICIAL_HANDOFF_GUIDANCE output shell.");
  }

  return outputPackage;
}

test("L3-04 matrix keeps timeline-blocked sequencing fail-closed under mixed BR02 and BR03 controls", () => {
  const timeline = buildTimelineBlockedShell();

  for (const matrixCase of matrixCases) {
    const assessment = buildBr02Assessment(matrixCase.br02);
    const touchpointPostureSnapshots = matrixCase.touchpointPostureSnapshotInputs.map(
      (snapshotInput) => createTouchpointPostureSnapshot(snapshotInput)
    );
    const commonSelectionInput = buildOutputSelectionInput({
      timeline,
      ...assessment.runtimeBridgeThreading.downstreamInputs,
      touchpointIds: matrixCase.touchpointIds,
      touchpointPostureSnapshots
    });
    const prepPack = expectPrepPack(generateOutputPackageShell({
      ...commonSelectionInput,
      outputMode: createOutputModeState("PREP_PACK_COPY_READY")
    }));
    const handoff = expectHandoffGuidance(generateOutputPackageShell({
      ...commonSelectionInput,
      outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE")
    }));

    assert.equal(assessment.runtimeBridgeThreading.runtimeBridgeThreaded, true, matrixCase.name);
    assert.equal(prepPack.rendererState.primaryState, "REVIEW_REQUIRED", matrixCase.name);
    assert.notEqual(prepPack.rendererState.primaryState, "READY_FOR_REVIEW", matrixCase.name);
    assert.equal(prepPack.rendererState.progression.blockedBySequencing, true, matrixCase.name);
    assert.equal(prepPack.rendererState.progression.blockedByReadiness, false, matrixCase.name);
    assert.equal(
      prepPack.rendererState.ownership.officialExecution.productExecution,
      "NOT_EXECUTED_BY_PRODUCT",
      matrixCase.name
    );
    assert.ok(prepPack.blockKeys.includes("sequencing-blocked"), matrixCase.name);
    assert.ok(prepPack.blockKeys.includes("dependency-hold-points"), matrixCase.name);
    assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"), matrixCase.name);
    assert.ok(handoff.guidance.guidanceBlockKeys.includes("sequencing-blocked"), matrixCase.name);
    assert.ok(handoff.guidance.guidanceBlockKeys.includes("dependency-hold-points"), matrixCase.name);
    assert.equal(handoff.rendererState.progression.blockedBySequencing, true, matrixCase.name);
    assert.equal(handoff.rendererState.primaryState, "REVIEW_REQUIRED", matrixCase.name);

    const expectedBr02StaleControl = matrixCase.br02.staleStateCode === "STALE_SLOWDOWN"
      ? { code: "STALE_GENERIC_TIMING_SURFACE", severity: "SLOWDOWN" as const }
      : { code: "GENERIC_EVIDENCE_TIMING_STALE_WARNING", severity: "WARNING" as const };

    assert.ok(
      prepPack.carryForwardControls.some((control) => (
        control.code === expectedBr02StaleControl.code
        && control.severity === expectedBr02StaleControl.severity
      )),
      matrixCase.name
    );

    if (matrixCase.br02.withHearingOverride) {
      const hearingOverrideSeverity = matrixCase.br02.staleStateCode === "STALE_SLOWDOWN"
        ? "SLOWDOWN"
        : "WARNING";

      assert.equal(
        assessment.evidenceDeadline?.controllingDeadlineSource,
        "HEARING_OVERRIDE",
        matrixCase.name
      );
      assert.ok(
        prepPack.carryForwardControls.some((control) => (
          control.code === "HEARING_SPECIFIC_OVERRIDE_PRIORITY"
          && control.severity === hearingOverrideSeverity
        )),
        matrixCase.name
      );
    }

    assert.equal(
      prepPack.touchpointControlOutputs.stale,
      matrixCase.expectedTouchpointControls.stale,
      matrixCase.name
    );
    assert.equal(
      prepPack.touchpointControlOutputs.liveConfirmationRequired,
      matrixCase.expectedTouchpointControls.liveConfirmationRequired,
      matrixCase.name
    );
    assert.equal(
      prepPack.touchpointControlOutputs.wrongChannelReroute,
      matrixCase.expectedTouchpointControls.wrongChannelReroute,
      matrixCase.name
    );
    assert.equal(
      prepPack.touchpointControlOutputs.authenticatedHandoffOnly,
      matrixCase.expectedTouchpointControls.authenticatedHandoffOnly,
      matrixCase.name
    );

    assert.equal(
      prepPack.blockKeys.includes("touchpoint-stale"),
      matrixCase.expectedTouchpointControls.stale,
      matrixCase.name
    );
    assert.equal(
      prepPack.blockKeys.includes("live-confirmation-required"),
      matrixCase.expectedTouchpointControls.liveConfirmationRequired,
      matrixCase.name
    );
    assert.equal(
      prepPack.blockKeys.includes("wrong-channel-reroute"),
      matrixCase.expectedTouchpointControls.wrongChannelReroute,
      matrixCase.name
    );

    if (matrixCase.expectedTouchpointControls.wrongChannelReroute) {
      assert.ok(prepPack.blockKeys.includes("referral-stop"), matrixCase.name);
      assert.ok(handoff.guidance.guidanceBlockKeys.includes("referral-stop"), matrixCase.name);
      assert.equal(prepPack.rendererState.handoff.posture, "REFERRAL_STOP", matrixCase.name);
      assert.equal(
        prepPack.rendererState.ownership.nextAction.kind,
        "REFER_OUTSIDE_STANDARD_PATH",
        matrixCase.name
      );
      assert.equal(prepPack.rendererState.progression.referredOut, true, matrixCase.name);
      assert.equal(prepPack.rendererState.ownership.officialExecution.required, false, matrixCase.name);
      assert.ok(
        prepPack.trustBinding.reviewStateKeys.includes("review-state.wrong-channel-reroute"),
        matrixCase.name
      );
    } else {
      assert.ok(!prepPack.blockKeys.includes("referral-stop"), matrixCase.name);
      assert.ok(!handoff.guidance.guidanceBlockKeys.includes("referral-stop"), matrixCase.name);
      assert.equal(prepPack.rendererState.handoff.posture, "BLOCKED_UPSTREAM", matrixCase.name);
      assert.equal(
        prepPack.rendererState.ownership.nextAction.kind,
        "RESOLVE_BLOCKER",
        matrixCase.name
      );
      assert.equal(prepPack.rendererState.progression.referredOut, false, matrixCase.name);
    }

    if (matrixCase.expectedTouchpointControls.liveConfirmationRequired) {
      assert.ok(
        prepPack.trustBinding.reviewStateKeys.includes("review-state.live-confirmation-required"),
        matrixCase.name
      );
    } else {
      assert.ok(
        !prepPack.trustBinding.reviewStateKeys.includes("review-state.live-confirmation-required"),
        matrixCase.name
      );
    }
  }
});
