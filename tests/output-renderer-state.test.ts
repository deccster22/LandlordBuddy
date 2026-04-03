import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState,
  type PaymentRecord,
  type RentCharge
} from "../src/domain/model.js";
import { calculateArrearsStatusShell } from "../src/modules/arrears/index.js";
import { buildOfficialHandoffGuidanceShell } from "../src/modules/handoff/index.js";
import {
  generateOutputPackageShell,
  type PrepPackOutputPackageShell
} from "../src/modules/output/index.js";
import {
  validateUnpaidRentNoticeReadiness,
  type UnpaidRentNoticeReadinessInput
} from "../src/modules/notice-readiness/index.js";
import { buildTimelineEngineShell } from "../src/modules/timeline/index.js";

const thresholdRule = {
  version: "P4A-CX-02-shell-v1",
  minimumDaysOverdue: 14,
  minimumOutstandingAmount: { amountMinor: 100000, currency: "AUD" as const }
};

const charge = (overrides: Partial<RentCharge> = {}): RentCharge => ({
  id: "charge-1",
  tenancyId: "tenancy-1",
  dueDate: "2026-03-10",
  amount: { amountMinor: 125000, currency: "AUD" },
  periodStartDate: "2026-03-03",
  periodEndDate: "2026-03-09",
  sourceReferenceIds: [],
  ...overrides
});

const payment = (overrides: Partial<PaymentRecord> = {}): PaymentRecord => ({
  id: "payment-1",
  tenancyId: "tenancy-1",
  receivedAt: "2026-03-12T09:00:00.000Z",
  amount: { amountMinor: 25000, currency: "AUD" },
  sourceReferenceIds: [],
  ...overrides
});

function buildTimeline(overrides: {
  charges?: RentCharge[];
  payments?: PaymentRecord[];
  asAt?: string;
} = {}) {
  const arrears = calculateArrearsStatusShell({
    charges: overrides.charges ?? [charge()],
    payments: overrides.payments ?? [],
    thresholdRule,
    asAt: overrides.asAt ?? "2026-04-02T10:00:00.000Z"
  });

  return buildTimelineEngineShell({ arrears });
}

function buildNoticeReadinessInput(): UnpaidRentNoticeReadinessInput {
  return {
    arrearsThresholdStatus: "threshold_met",
    arrearsAmount: 1850,
    paidToDate: "2026-03-20",
    noticeNumber: "NTV-204",
    serviceMethod: "EMAIL",
    interstateRouteOut: false,
    guarded: {
      serviceProofSufficiency: "cleared",
      documentaryEvidenceCompleteness: "cleared",
      handServiceReview: "not_applicable",
      mixedClaimRoutingInteraction: "cleared"
    }
  };
}

function buildPrepPack(
  overrides: Parameters<typeof generateOutputPackageShell>[0] = {
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF")
  }
): PrepPackOutputPackageShell {
  const outputPackage = generateOutputPackageShell(overrides);

  if (outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY package shell.");
  }

  return outputPackage;
}

test("renderer state keeps non-ready readiness outcomes distinct and reserves READY_FOR_REVIEW for ready readiness", () => {
  const ready = buildPrepPack({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    noticeReadiness: validateUnpaidRentNoticeReadiness(buildNoticeReadinessInput())
  });

  const blockedInput = buildNoticeReadinessInput();
  blockedInput.arrearsAmount = null;
  const blocked = buildPrepPack({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    noticeReadiness: validateUnpaidRentNoticeReadiness(blockedInput)
  });

  const reviewRequiredInput = buildNoticeReadinessInput();
  reviewRequiredInput.guarded = {
    ...reviewRequiredInput.guarded,
    serviceProofSufficiency: "guarded"
  };
  const reviewRequired = buildPrepPack({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    noticeReadiness: validateUnpaidRentNoticeReadiness(reviewRequiredInput)
  });

  const referOutInput = buildNoticeReadinessInput();
  referOutInput.interstateRouteOut = true;
  const referOut = buildPrepPack({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    noticeReadiness: validateUnpaidRentNoticeReadiness(referOutInput)
  });

  const notEvaluated = buildPrepPack();

  assert.equal(ready.rendererState.primaryState, "READY_FOR_REVIEW");
  assert.equal(blocked.rendererState.primaryState, "BLOCKED");
  assert.equal(reviewRequired.rendererState.primaryState, "REVIEW_REQUIRED");
  assert.equal(referOut.rendererState.primaryState, "REFER_OUT");
  assert.equal(notEvaluated.rendererState.primaryState, "NOT_EVALUATED");

  for (const rendererState of [
    blocked.rendererState,
    reviewRequired.rendererState,
    referOut.rendererState,
    notEvaluated.rendererState
  ]) {
    assert.notEqual(rendererState.primaryState, "READY_FOR_REVIEW");
  }
});

test("renderer state keeps ownership mapping explicit across readiness and handoff combinations", () => {
  const cases = [
    {
      label: "not evaluated",
      noticeReadiness: undefined,
      expectedProductStatus: "IN_PROGRESS",
      expectedNextActionKind: "ATTACH_REVIEW_STATE",
      expectedExternalRequired: false
    },
    {
      label: "blocked",
      noticeReadiness: (() => {
        const input = buildNoticeReadinessInput();
        input.arrearsAmount = null;
        return validateUnpaidRentNoticeReadiness(input);
      })(),
      expectedProductStatus: "BLOCKED",
      expectedNextActionKind: "RESOLVE_BLOCKER",
      expectedExternalRequired: false
    },
    {
      label: "review required",
      noticeReadiness: (() => {
        const input = buildNoticeReadinessInput();
        input.guarded = {
          ...input.guarded,
          serviceProofSufficiency: "guarded"
        };
        return validateUnpaidRentNoticeReadiness(input);
      })(),
      expectedProductStatus: "IN_PROGRESS",
      expectedNextActionKind: "COMPLETE_GUARDED_REVIEW",
      expectedExternalRequired: false
    },
    {
      label: "ready for review",
      noticeReadiness: validateUnpaidRentNoticeReadiness(buildNoticeReadinessInput()),
      expectedProductStatus: "READY_TO_HAND_OFF",
      expectedNextActionKind: "TAKE_EXTERNAL_OFFICIAL_STEP",
      expectedExternalRequired: true
    },
    {
      label: "refer out",
      noticeReadiness: (() => {
        const input = buildNoticeReadinessInput();
        input.interstateRouteOut = true;
        return validateUnpaidRentNoticeReadiness(input);
      })(),
      expectedProductStatus: "STOPPED_REFER_OUT",
      expectedNextActionKind: "REFER_OUTSIDE_STANDARD_PATH",
      expectedExternalRequired: false
    }
  ] as const;

  for (const scenario of cases) {
    const prepPack = buildPrepPack({
      matterId: `matter-${scenario.label}`,
      forumPath: createForumPathState({
        path: "VIC_VCAT_RENT_ARREARS"
      }),
      outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
      officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
      ...(scenario.noticeReadiness ? { noticeReadiness: scenario.noticeReadiness } : {})
    });

    assert.equal(
      prepPack.rendererState.ownership.productPreparation.role,
      "PRODUCT_PREPARATION",
      scenario.label
    );
    assert.equal(
      prepPack.rendererState.ownership.productPreparation.owner,
      "LANDLORD_BUDDY",
      scenario.label
    );
    assert.equal(
      prepPack.rendererState.ownership.productPreparation.status,
      scenario.expectedProductStatus,
      scenario.label
    );
    assert.equal(
      prepPack.rendererState.ownership.nextAction.role,
      "USER_OR_OPERATOR_ACTION",
      scenario.label
    );
    assert.equal(
      prepPack.rendererState.ownership.nextAction.owner,
      "USER_OR_OPERATOR",
      scenario.label
    );
    assert.equal(
      prepPack.rendererState.ownership.nextAction.kind,
      scenario.expectedNextActionKind,
      scenario.label
    );
    assert.equal(
      prepPack.rendererState.ownership.officialExecution.role,
      "EXTERNAL_OFFICIAL_SYSTEM",
      scenario.label
    );
    assert.equal(
      prepPack.rendererState.ownership.officialExecution.required,
      scenario.expectedExternalRequired,
      scenario.label
    );
    assert.equal(
      prepPack.rendererState.ownership.officialExecution.productExecution,
      "NOT_EXECUTED_BY_PRODUCT",
      scenario.label
    );
  }
});

test("renderer state keeps dependency holds and guarded sequencing separate from readiness", () => {
  const prepPack = buildPrepPack({
    matterId: "matter-guarded-timeline",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    noticeReadiness: validateUnpaidRentNoticeReadiness(buildNoticeReadinessInput()),
    timeline: buildTimeline()
  });

  assert.equal(prepPack.rendererState.readiness.outcome, "READY_FOR_REVIEW");
  assert.equal(prepPack.rendererState.readiness.readyForProgression, true);
  assert.equal(prepPack.rendererState.sequencing.guarded, true);
  assert.equal(prepPack.rendererState.sequencing.external, true);
  assert.equal(prepPack.rendererState.sequencing.dependencyHolds, true);
  assert.equal(prepPack.rendererState.progression.blockedByReadiness, false);
  assert.equal(prepPack.rendererState.progression.blockedBySequencing, false);
  assert.equal(prepPack.rendererState.trust.showGuardedWarning, true);
  assert.equal(prepPack.rendererState.trust.showDependencyHold, true);
  assert.equal(prepPack.rendererState.ownership.officialExecution.visible, true);
  assert.equal(prepPack.rendererState.ownership.officialExecution.required, false);
  assert.equal(
    prepPack.rendererState.ownership.officialExecution.productExecution,
    "NOT_EXECUTED_BY_PRODUCT"
  );
});

test("renderer state keeps blocked sequencing separate from readiness state", () => {
  const prepPack = buildPrepPack({
    matterId: "matter-blocked-sequencing",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    noticeReadiness: validateUnpaidRentNoticeReadiness(buildNoticeReadinessInput()),
    timeline: buildTimeline({
      charges: [charge({
        dueDate: "2026-03-27",
        periodStartDate: "2026-03-20",
        periodEndDate: "2026-03-26"
      })]
    })
  });

  assert.equal(prepPack.rendererState.readiness.outcome, "READY_FOR_REVIEW");
  assert.equal(prepPack.rendererState.sequencing.blocked, true);
  assert.equal(prepPack.rendererState.progression.blockedByReadiness, false);
  assert.equal(prepPack.rendererState.progression.blockedBySequencing, true);
  assert.equal(prepPack.rendererState.trust.showBlockedState, true);
});

test("direct handoff guidance shells expose renderer state without implying product execution", () => {
  const guidance = buildOfficialHandoffGuidanceShell({
    matterId: "matter-guidance-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    readinessOutcome: "READY_FOR_REVIEW"
  });

  assert.equal(guidance.rendererState.primaryState, "READY_FOR_REVIEW");
  assert.equal(guidance.rendererState.ownership.nextAction.kind, "TAKE_EXTERNAL_OFFICIAL_STEP");
  assert.equal(guidance.rendererState.ownership.officialExecution.required, true);
  assert.equal(
    guidance.rendererState.ownership.officialExecution.productExecution,
    "NOT_EXECUTED_BY_PRODUCT"
  );
});

test("blocked-invalid sequencing does not rewrite renderer readiness state", () => {
  const arrears = calculateArrearsStatusShell({
    charges: [],
    payments: [payment()],
    asAt: "2026-04-02T10:00:00.000Z"
  });
  const timeline = buildTimelineEngineShell({ arrears });
  const prepPack = buildPrepPack({
    matterId: "matter-blocked-invalid",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    timeline
  });

  assert.equal(prepPack.rendererState.primaryState, "NOT_EVALUATED");
  assert.equal(prepPack.rendererState.sequencing.blocked, true);
  assert.equal(prepPack.rendererState.progression.readinessPending, true);
  assert.equal(prepPack.rendererState.progression.blockedByReadiness, false);
  assert.equal(prepPack.rendererState.progression.blockedBySequencing, true);
});
