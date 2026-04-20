import test from "node:test";
import assert from "node:assert/strict";

import {
  createOfficialHandoffStateRecord,
  createOutputModeState
} from "../src/domain/model.js";
import { resolveBr01Routing } from "../src/modules/br01/index.js";
import { generateOutputPackageShell } from "../src/modules/output/index.js";

function buildBaseInput(overrides: Partial<{
  mode: "PREP_PACK_COPY_READY" | "OFFICIAL_HANDOFF_GUIDANCE";
  br01RoutingResult: ReturnType<typeof resolveBr01Routing>;
}>) {
  const mode = overrides.mode ?? "PREP_PACK_COPY_READY";
  const routingResult = overrides.br01RoutingResult ?? resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    }
  });

  return {
    matterId: "matter-br01-downstream",
    forumPath: routingResult.forumPath,
    outputMode: createOutputModeState(mode),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    br01RoutingResult: routingResult
  };
}

test("BR01 referral posture drives downstream referral-stop behavior", () => {
  const referralRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    riskFlags: {
      familyViolenceSensitive: true
    }
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    mode: "PREP_PACK_COPY_READY",
    br01RoutingResult: referralRouting
  }));

  assert.equal(shell.kind, "PREP_PACK_COPY_READY");
  assert.ok(shell.blockKeys.includes("referral-stop"));
  assert.ok(!shell.blockKeys.includes("copy-ready-facts"));
  assert.ok(shell.trustBinding.reviewStateKeys.includes("review-state.refer-out"));
  assert.equal(shell.rendererState.ownership.nextAction.kind, "REFER_OUTSIDE_STANDARD_PATH");
  assert.ok(
    shell.carryForwardControls.some((control) => (
      control.code === "BR01_ARREARS_PLUS_FAMILY_VIOLENCE_SENSITIVE"
      && control.severity === "REFERRAL"
    ))
  );
});

test("BR01 route-out posture remains explicit in downstream handoff guidance", () => {
  const routeOutRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    partyJurisdictionSignals: {
      propertyStateOrTerritory: "NSW",
      forumPathSupported: false
    }
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    mode: "OFFICIAL_HANDOFF_GUIDANCE",
    br01RoutingResult: routeOutRouting
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
      control.code === "BR01_INTERSTATE_OR_NON_VICTORIA_ROUTE_OUT"
      && control.severity === "REFERRAL"
    ))
  );
});

test("BR01 split-matter posture drives downstream review behavior without referral flattening", () => {
  const splitRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS", "COMPENSATION"]
    }
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    mode: "PREP_PACK_COPY_READY",
    br01RoutingResult: splitRouting
  }));

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
      control.code === "BR01_ARREARS_PLUS_COMPENSATION"
      && control.severity === "SLOWDOWN"
    ))
  );
});

test("BR01 deterministic arrears-only posture does not drift frozen copy/trust surfaces", () => {
  const deterministicRouting = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    }
  });
  const shell = generateOutputPackageShell(buildBaseInput({
    mode: "PREP_PACK_COPY_READY",
    br01RoutingResult: deterministicRouting
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
