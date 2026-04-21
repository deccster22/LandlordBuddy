import test from "node:test";
import assert from "node:assert/strict";

import {
  type ReferralFlag,
  type RoutingDecision,
  createOfficialHandoffStateRecord,
  createOutputModeState
} from "../src/domain/model.js";
import {
  buildBr01RoutingArtifacts,
  deriveBr01DownstreamPostureFromStoredArtifacts,
  resolveBr01Routing
} from "../src/modules/br01/index.js";
import {
  createOutputPackageRecord,
  generateOutputPackageShell
} from "../src/modules/output/index.js";

function buildBaseInput(overrides: Partial<{
  matterId: string;
  mode: "PREP_PACK_COPY_READY" | "OFFICIAL_HANDOFF_GUIDANCE";
  br01RoutingDecision: RoutingDecision;
  br01ReferralFlags: ReferralFlag[];
  br01RoutingResult: ReturnType<typeof resolveBr01Routing>;
}>) {
  const matterId = overrides.matterId ?? "matter-br01-downstream";
  const mode = overrides.mode ?? "PREP_PACK_COPY_READY";
  const routingResult = overrides.br01RoutingResult ?? resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    }
  });
  const forumPath = overrides.br01RoutingDecision?.forumPath ?? routingResult.forumPath;

  return {
    matterId,
    forumPath,
    outputMode: createOutputModeState(mode),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    ...(overrides.br01RoutingDecision
      ? { br01RoutingDecision: overrides.br01RoutingDecision }
      : {}),
    ...(overrides.br01ReferralFlags
      ? { br01ReferralFlags: overrides.br01ReferralFlags }
      : {}),
    ...(overrides.br01RoutingResult
      ? { br01RoutingResult: overrides.br01RoutingResult }
      : { br01RoutingResult: routingResult })
  };
}

function buildPersistedArtifacts(input: {
  matterId: string;
  routingResult: ReturnType<typeof resolveBr01Routing>;
}) {
  return buildBr01RoutingArtifacts({
    matterId: input.matterId,
    routingResult: input.routingResult,
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    decidedAt: "2026-04-20T08:00:00.000Z"
  });
}

test("downstream selection prefers stored RoutingDecision over conflicting request-time BR01 input", () => {
  const splitRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS", "COMPENSATION"]
    }
  });
  const deterministicRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    }
  });
  const artifacts = buildPersistedArtifacts({
    matterId: "matter-stored-split-prefers-artifact",
    routingResult: splitRouting
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    matterId: "matter-stored-split-prefers-artifact",
    mode: "PREP_PACK_COPY_READY",
    br01RoutingDecision: artifacts.routingDecision,
    br01RoutingResult: deterministicRouting
  }));

  assert.equal(shell.kind, "PREP_PACK_COPY_READY");
  assert.ok(shell.blockKeys.includes("guarded-review-flags"));
  assert.ok(shell.blockKeys.includes("review-hold-points"));
  assert.ok(!shell.blockKeys.includes("referral-stop"));
  assert.ok(shell.trustBinding.reviewStateKeys.includes("review-state.slowdown-review-required"));
  assert.ok(
    shell.carryForwardControls.some((control) => (
      control.code === "BR01_SPLIT_MATTER_COMPENSATION"
      && control.severity === "SLOWDOWN"
    ))
  );
});

test("stored referral artifact drives referral-stop downstream behavior", () => {
  const referralRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    riskFlags: {
      familyViolenceSensitive: true
    }
  });
  const artifacts = buildPersistedArtifacts({
    matterId: "matter-stored-referral",
    routingResult: referralRouting
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    matterId: "matter-stored-referral",
    mode: "PREP_PACK_COPY_READY",
    br01RoutingDecision: artifacts.routingDecision,
    ...(artifacts.referralFlag
      ? { br01ReferralFlags: [artifacts.referralFlag] }
      : {})
  }));

  assert.equal(shell.kind, "PREP_PACK_COPY_READY");
  assert.ok(shell.blockKeys.includes("referral-stop"));
  assert.ok(!shell.blockKeys.includes("copy-ready-facts"));
  assert.ok(shell.trustBinding.reviewStateKeys.includes("review-state.refer-out"));
  assert.equal(shell.rendererState.ownership.nextAction.kind, "REFER_OUTSIDE_STANDARD_PATH");
  assert.ok(
    shell.carryForwardControls.some((control) => (
      control.code === "BR01_REFERRAL_REQUIRED"
      && control.severity === "REFERRAL"
    ))
  );
});

test("stored route-out artifact stays distinct from referral during downstream hydration", () => {
  const routeOutRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    partyJurisdictionSignals: {
      propertyStateOrTerritory: "NSW",
      anyPartyOutsideVictoria: true,
      forumPathSupported: false
    }
  });
  const artifacts = buildPersistedArtifacts({
    matterId: "matter-stored-route-out",
    routingResult: routeOutRouting
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    matterId: "matter-stored-route-out",
    mode: "OFFICIAL_HANDOFF_GUIDANCE",
    br01RoutingDecision: artifacts.routingDecision,
    ...(artifacts.referralFlag
      ? { br01ReferralFlags: [artifacts.referralFlag] }
      : {})
  }));

  assert.equal(shell.kind, "OFFICIAL_HANDOFF_GUIDANCE");
  assert.ok(shell.guidance.guidanceBlockKeys.includes("referral-stop"));
  assert.ok(shell.guidance.trustBinding.reviewStateKeys.includes("review-state.refer-out"));
  assert.equal(
    shell.guidance.rendererState.ownership.productPreparation.status,
    "STOPPED_REFER_OUT"
  );
  assert.ok(
    shell.guidance.carryForwardControls.some((control) => (
      control.code === "BR01_ROUTE_OUT_REQUIRED"
      && control.severity === "REFERRAL"
    ))
  );
  assert.ok(
    !shell.guidance.carryForwardControls.some((control) => (
      control.code === "BR01_REFERRAL_REQUIRED"
    ))
  );
});

test("stored split-matter artifact drives review posture and aggregate output record hydration", () => {
  const splitRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS", "COMPENSATION"]
    }
  });
  const artifacts = buildPersistedArtifacts({
    matterId: "matter-stored-split",
    routingResult: splitRouting
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    matterId: "matter-stored-split",
    mode: "PREP_PACK_COPY_READY",
    br01RoutingDecision: artifacts.routingDecision
  }));
  const record = createOutputPackageRecord({
    ...buildBaseInput({
      matterId: "matter-stored-split",
      mode: "PREP_PACK_COPY_READY",
      br01RoutingDecision: artifacts.routingDecision
    }),
    id: "output-package-stored-split"
  });

  assert.equal(shell.kind, "PREP_PACK_COPY_READY");
  assert.ok(shell.blockKeys.includes("guarded-review-flags"));
  assert.ok(shell.blockKeys.includes("review-hold-points"));
  assert.ok(!shell.blockKeys.includes("referral-stop"));
  assert.ok(
    shell.trustBinding.reviewStateKeys.includes("review-state.slowdown-review-required")
  );
  assert.equal(shell.rendererState.ownership.nextAction.kind, "COMPLETE_GUARDED_REVIEW");
  assert.ok(
    shell.carryForwardControls.some((control) => (
      control.code === "BR01_SPLIT_MATTER_COMPENSATION"
      && control.severity === "SLOWDOWN"
    ))
  );
  assert.ok(
    record.carryForwardControls.some((control) => (
      control.code === "BR01_SPLIT_MATTER_COMPENSATION"
      && control.severity === "SLOWDOWN"
    ))
  );
});

test("stored deterministic artifact does not drift frozen trust/copy surfaces", () => {
  const deterministicRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    }
  });
  const artifacts = buildPersistedArtifacts({
    matterId: "matter-stored-deterministic",
    routingResult: deterministicRouting
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    matterId: "matter-stored-deterministic",
    mode: "PREP_PACK_COPY_READY",
    br01RoutingDecision: artifacts.routingDecision
  }));

  assert.equal(shell.kind, "PREP_PACK_COPY_READY");
  assert.ok(shell.blockKeys.includes("copy-ready-facts"));
  assert.ok(!shell.blockKeys.includes("referral-stop"));
  assert.ok(
    !shell.carryForwardControls.some((control) => control.code.startsWith("BR01_"))
  );
  assert.ok(shell.trustBinding.boundaryStatementKeys.includes("boundary.no-product-submission"));
  assert.ok(shell.trustBinding.trustCueKeys.includes("trust-cue.prep-pack-structure-only"));
});

test("request-time BR01 fallback remains available when stored artifacts are absent", () => {
  const referralRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    riskFlags: {
      familyViolenceSensitive: true
    }
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    matterId: "matter-br01-fallback-request-time",
    mode: "PREP_PACK_COPY_READY",
    br01RoutingResult: referralRouting
  }));

  assert.equal(shell.kind, "PREP_PACK_COPY_READY");
  assert.ok(shell.blockKeys.includes("referral-stop"));
  assert.ok(
    shell.carryForwardControls.some((control) => (
      control.code === "BR01_ARREARS_PLUS_FAMILY_VIOLENCE_SENSITIVE"
      && control.severity === "REFERRAL"
    ))
  );
});

test("stored rationale reason suffix keeps route-out posture explicit even without a referral flag artifact", () => {
  const routingResult = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    partyJurisdictionSignals: {
      anyPartyOutsideVictoria: true
    }
  });
  const artifacts = buildPersistedArtifacts({
    matterId: "matter-stored-route-out-reason-suffix",
    routingResult
  });
  const { guardedReason: _ignored, ...routingDecisionWithoutGuardedReason } = artifacts.routingDecision;
  const posture = deriveBr01DownstreamPostureFromStoredArtifacts({
    routingDecision: routingDecisionWithoutGuardedReason
  });
  const carryForwardControl = posture.carryForwardControls[0];

  assert.equal(posture.routeOutStopRequired, true);
  assert.equal(posture.referralStopRequired, false);
  assert.equal(posture.readinessOutcome, "REFER_OUT");
  assert.ok(carryForwardControl);
  assert.equal(carryForwardControl?.code, "BR01_INTERSTATE_PARTY_ROUTE_OUT");
  assert.equal(carryForwardControl?.severity, "REFERRAL");
  assert.equal(carryForwardControl?.summary, routingResult.summary);
});

test("stored rationale without parseable reason suffix falls back to guarded-review control safely", () => {
  const deterministicRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    }
  });
  const artifacts = buildPersistedArtifacts({
    matterId: "matter-stored-reason-fallback",
    routingResult: deterministicRouting
  });
  const { guardedReason: _ignored, ...routingDecisionWithoutGuardedReason } = artifacts.routingDecision;
  const posture = deriveBr01DownstreamPostureFromStoredArtifacts({
    routingDecision: {
      ...routingDecisionWithoutGuardedReason,
      severity: "SLOWDOWN",
      rationale: "Stored guarded review from migrated artifact (reasons: )"
    }
  });
  const carryForwardControl = posture.carryForwardControls[0];

  assert.equal(posture.routeOutStopRequired, false);
  assert.equal(posture.referralStopRequired, false);
  assert.equal(posture.splitMatterReviewRequired, false);
  assert.equal(posture.readinessOutcome, "REVIEW_REQUIRED");
  assert.ok(carryForwardControl);
  assert.equal(carryForwardControl?.code, "BR01_GUARDED_REVIEW_REQUIRED");
  assert.equal(carryForwardControl?.severity, "SLOWDOWN");
  assert.equal(carryForwardControl?.summary, "Stored guarded review from migrated artifact");
});
