import test from "node:test";
import assert from "node:assert/strict";

import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState,
  validateMatterSeparation,
  type CarryForwardControl,
  type Matter
} from "../src/domain/model.js";
import { buildOfficialHandoffGuidanceShell } from "../src/modules/handoff/index.js";
import {
  generateOutputPackageShell,
  selectOutputShell,
  type OfficialHandoffGuidancePackageShell,
  type OutputSelectionInput,
  type PrepPackOutputPackageShell,
  type PrintableOutputPackageShell
} from "../src/modules/output/index.js";
import {
  validateUnpaidRentNoticeReadiness,
  type UnpaidRentNoticeReadinessInput
} from "../src/modules/notice-readiness/index.js";
import {
  listTouchpointsForForumPath,
  lookupTouchpointMetadata,
  touchpointClassifications
} from "../src/modules/touchpoints/index.js";

function buildMatter(overrides: Partial<Matter> = {}): Matter {
  return {
    id: "matter-1",
    tenancyId: "tenancy-1",
    propertyId: "property-1",
    status: "NOTICE_PREPARATION",
    workflowState: "NOTICE_DRAFTING_READY",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PRINTABLE_OUTPUT"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    arrearsStatus: {
      asAt: "2026-04-02T10:00:00Z",
      outstandingAmount: { amountMinor: 125000, currency: "AUD" },
      overdueChargeIds: ["charge-1"],
      unappliedPaymentIds: [],
      calculationConfidence: "DETERMINISTIC",
      warnings: []
    },
    priorNoticeIds: [],
    evidenceItemIds: [],
    paymentPlanIds: [],
    referralFlagIds: [],
    routingDecisionIds: [],
    auditLogIds: [],
    sourceReferenceIds: [],
    ...overrides
  };
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

function buildOutputPackageInput(
  overrides: Partial<OutputSelectionInput> = {}
): OutputSelectionInput {
  return {
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PRINTABLE_OUTPUT"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    ...overrides
  };
}

function expectPrintablePackage(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): PrintableOutputPackageShell {
  if (outputPackage.kind !== "PRINTABLE_OUTPUT") {
    throw new Error("Expected PRINTABLE_OUTPUT package shell.");
  }

  return outputPackage;
}

function expectPrepPack(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): PrepPackOutputPackageShell {
  if (outputPackage.kind !== "PREP_PACK_COPY_READY") {
    throw new Error("Expected PREP_PACK_COPY_READY package shell.");
  }

  return outputPackage;
}

function expectOfficialHandoffGuidance(
  outputPackage: ReturnType<typeof generateOutputPackageShell>
): OfficialHandoffGuidancePackageShell {
  if (outputPackage.kind !== "OFFICIAL_HANDOFF_GUIDANCE") {
    throw new Error("Expected OFFICIAL_HANDOFF_GUIDANCE package shell.");
  }

  return outputPackage;
}

test("matter separation rejects a flattened or misplaced state object", () => {
  const matter = buildMatter({
    forumPath: createOutputModeState("PRINTABLE_OUTPUT") as unknown as Matter["forumPath"]
  });

  const issues = validateMatterSeparation(matter);

  assert.ok(issues.some((issue) => issue.includes("forumPath.path")));
});

test("touchpoint registry exposes all placeholder classifications for the Victoria arrears path", () => {
  const touchpoints = listTouchpointsForForumPath("VIC_VCAT_RENT_ARREARS");
  const classifications = new Set(touchpoints.map((touchpoint) => touchpoint.classification));

  assert.equal(touchpoints.length, 4);
  assert.deepEqual([...classifications].sort(), [...touchpointClassifications].sort());
  assert.equal(
    lookupTouchpointMetadata("vic-arrears-authenticated-handoff")?.classification,
    "HANDOFF_ONLY_AUTHENTICATED"
  );
});

test("output shells stay distinct and never imply official submission", () => {
  const forumPath = createForumPathState({
    path: "VIC_VCAT_RENT_ARREARS"
  });
  const officialHandoff = createOfficialHandoffStateRecord("READY_TO_HAND_OFF");

  const printable = generateOutputPackageShell({
    matterId: "matter-1",
    forumPath,
    outputMode: createOutputModeState("PRINTABLE_OUTPUT"),
    officialHandoff
  });
  const prepPack = generateOutputPackageShell({
    matterId: "matter-1",
    forumPath,
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff
  });
  const handoffGuidance = generateOutputPackageShell({
    matterId: "matter-1",
    forumPath,
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    officialHandoff
  });

  assert.equal(printable.kind, "PRINTABLE_OUTPUT");
  assert.equal(prepPack.kind, "PREP_PACK_COPY_READY");
  assert.equal(handoffGuidance.kind, "OFFICIAL_HANDOFF_GUIDANCE");
  assert.equal(printable.officialSystemAction, "NOT_INCLUDED");
  assert.equal(prepPack.officialSystemAction, "NOT_INCLUDED");
  assert.equal(handoffGuidance.officialSystemAction, "NOT_INCLUDED");
});

test("output selection carries guarded metadata forward from touchpoints and caller inputs", () => {
  const carryForwardControl: CarryForwardControl = {
    code: "SERVICE_PROOF_GUARDED",
    severity: "SLOWDOWN",
    summary: "Service proof remains guarded pending review.",
    visibleSourceType: "UNRESOLVED_ITEM",
    deterministic: false,
    guardedInsertionPoint: "Service-proof sufficiency remains guarded."
  };

  const selection = selectOutputShell({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    officialHandoff: createOfficialHandoffStateRecord("PREPARING_HANDOFF"),
    carryForwardControls: [carryForwardControl],
    touchpointIds: [
      "vic-arrears-authenticated-handoff",
      "vic-arrears-freshness-watch"
    ]
  });

  assert.ok(selection.carryForwardControls.some((control) => control.code === "SERVICE_PROOF_GUARDED"));
  assert.ok(
    selection.carryForwardControls.some(
      (control) => control.code === "AUTHENTICATED_TOUCHPOINT_HANDOFF_ONLY"
    )
  );
  assert.ok(
    selection.carryForwardControls.some(
      (control) => control.code === "FRESHNESS_SENSITIVE_SURFACE"
    )
  );
});

test("official handoff guidance shell preserves boundary codes and guarded referrals", () => {
  const carryForwardControl: CarryForwardControl = {
    code: "MIXED_CLAIM_GUARDED",
    severity: "REFERRAL",
    summary: "Mixed-claim routing remains guarded.",
    visibleSourceType: "UNRESOLVED_ITEM",
    deterministic: false
  };

  const guidance = buildOfficialHandoffGuidanceShell({
    matterId: "matter-1",
    forumPath: createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS"
    }),
    officialHandoff: createOfficialHandoffStateRecord("HANDED_OFF"),
    carryForwardControls: [carryForwardControl],
    touchpointIds: [
      "vic-arrears-authenticated-handoff",
      "vic-arrears-freshness-watch"
    ]
  });

  assert.deepEqual(guidance.boundaryCodes, [
    "PREP_AND_HANDOFF_ONLY",
    "NO_PRODUCT_SUBMISSION",
    "NO_PORTAL_MIMICRY"
  ]);
  assert.ok(guidance.guidanceBlockKeys.includes("authenticated-surface-handoff"));
  assert.ok(guidance.guidanceBlockKeys.includes("freshness-check"));
  assert.ok(guidance.guidanceBlockKeys.includes("referral-stop"));
  assert.ok(guidance.carryForwardControls.some((control) => control.code === "MIXED_CLAIM_GUARDED"));
});

test("ready-for-review packages surface readiness summary while keeping warning-only review flags visible", () => {
  const readinessInput = buildNoticeReadinessInput();
  readinessInput.guarded = {
    ...readinessInput.guarded,
    documentaryEvidenceCompleteness: "guarded"
  };

  const noticeReadiness = validateUnpaidRentNoticeReadiness(readinessInput);
  const printable = expectPrintablePackage(generateOutputPackageShell(buildOutputPackageInput({
    outputMode: createOutputModeState("PRINTABLE_OUTPUT"),
    noticeReadiness
  })));
  const prepPack = expectPrepPack(generateOutputPackageShell(buildOutputPackageInput({
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    noticeReadiness
  })));

  assert.equal(noticeReadiness.outcome, "READY_FOR_REVIEW");
  assert.ok(printable.sectionKeys.includes("readiness-summary"));
  assert.ok(printable.sectionKeys.includes("guarded-review-flags"));
  assert.ok(!printable.sectionKeys.includes("blocker-summary"));
  assert.ok(!printable.sectionKeys.includes("referral-stop"));
  assert.ok(prepPack.blockKeys.includes("readiness-summary"));
  assert.ok(prepPack.blockKeys.includes("copy-ready-facts"));
  assert.ok(prepPack.blockKeys.includes("guarded-review-flags"));
  assert.ok(!prepPack.blockKeys.includes("referral-stop"));
  assert.ok(
    prepPack.carryForwardControls.some(
      (control) => control.code === "DOCUMENTARY_EVIDENCE_GUARDED"
        && control.severity === "WARNING"
    )
  );
});

test("blocked readiness packages add blocker content without implying progression", () => {
  const readinessInput = buildNoticeReadinessInput();
  readinessInput.arrearsAmount = null;
  readinessInput.guarded = {
    ...readinessInput.guarded,
    documentaryEvidenceCompleteness: "guarded"
  };

  const noticeReadiness = validateUnpaidRentNoticeReadiness(readinessInput);
  const printable = expectPrintablePackage(generateOutputPackageShell(buildOutputPackageInput({
    outputMode: createOutputModeState("PRINTABLE_OUTPUT"),
    noticeReadiness
  })));
  const prepPack = expectPrepPack(generateOutputPackageShell(buildOutputPackageInput({
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    noticeReadiness
  })));

  assert.equal(noticeReadiness.outcome, "BLOCKED");
  assert.ok(printable.sectionKeys.includes("readiness-summary"));
  assert.ok(printable.sectionKeys.includes("blocker-summary"));
  assert.ok(printable.sectionKeys.includes("review-hold-points"));
  assert.ok(printable.sectionKeys.includes("guarded-review-flags"));
  assert.ok(prepPack.blockKeys.includes("readiness-summary"));
  assert.ok(prepPack.blockKeys.includes("blocker-summary"));
  assert.ok(prepPack.blockKeys.includes("review-hold-points"));
  assert.ok(prepPack.blockKeys.includes("guarded-review-flags"));
  assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"));
});

test("review-required readiness carries slowdown posture into prep-pack and handoff guidance", () => {
  const readinessInput = buildNoticeReadinessInput();
  readinessInput.guarded = {
    ...readinessInput.guarded,
    serviceProofSufficiency: "guarded"
  };

  const noticeReadiness = validateUnpaidRentNoticeReadiness(readinessInput);
  const prepPack = expectPrepPack(generateOutputPackageShell(buildOutputPackageInput({
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    noticeReadiness
  })));
  const handoffGuidance = expectOfficialHandoffGuidance(generateOutputPackageShell(buildOutputPackageInput({
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    noticeReadiness
  })));

  assert.equal(noticeReadiness.outcome, "REVIEW_REQUIRED");
  assert.ok(prepPack.blockKeys.includes("readiness-summary"));
  assert.ok(prepPack.blockKeys.includes("review-hold-points"));
  assert.ok(prepPack.blockKeys.includes("guarded-review-flags"));
  assert.ok(prepPack.blockKeys.includes("copy-ready-facts"));
  assert.ok(
    prepPack.carryForwardControls.some(
      (control) => control.code === "SERVICE_PROOF_GUARDED"
        && control.severity === "SLOWDOWN"
    )
  );
  assert.ok(handoffGuidance.guidance.guidanceBlockKeys.includes("slowdown-review"));
  assert.ok(!handoffGuidance.guidance.guidanceBlockKeys.includes("referral-stop"));
});

test("refer-out readiness surfaces referral-stop content in prep-pack and handoff guidance", () => {
  const readinessInput = buildNoticeReadinessInput();
  readinessInput.interstateRouteOut = true;

  const noticeReadiness = validateUnpaidRentNoticeReadiness(readinessInput);
  const prepPack = expectPrepPack(generateOutputPackageShell(buildOutputPackageInput({
    outputMode: createOutputModeState("PREP_PACK_COPY_READY"),
    noticeReadiness
  })));
  const handoffGuidance = expectOfficialHandoffGuidance(generateOutputPackageShell(buildOutputPackageInput({
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    noticeReadiness
  })));

  assert.equal(noticeReadiness.outcome, "REFER_OUT");
  assert.ok(prepPack.blockKeys.includes("readiness-summary"));
  assert.ok(prepPack.blockKeys.includes("review-hold-points"));
  assert.ok(prepPack.blockKeys.includes("referral-stop"));
  assert.ok(!prepPack.blockKeys.includes("copy-ready-facts"));
  assert.ok(
    prepPack.carryForwardControls.some(
      (control) => control.code === "INTERSTATE_ROUTE_OUT"
        && control.severity === "REFERRAL"
    )
  );
  assert.ok(handoffGuidance.guidance.guidanceBlockKeys.includes("referral-stop"));
});
