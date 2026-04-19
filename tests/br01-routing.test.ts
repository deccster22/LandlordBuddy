import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBr01RoutingArtifacts,
  lookupBr01Scenario,
  resolveBr01Routing,
  type Br01ScenarioCode
} from "../src/modules/br01/index.js";
import {
  createForumPathState,
  createOfficialHandoffStateRecord,
  createOutputModeState
} from "../src/domain/model.js";
import {
  deriveBr01WorkflowGate,
  deriveBr01WorkflowTransition,
  findWorkflowNode
} from "../src/workflow/arrearsHeroWorkflow.js";
import { buildOfficialHandoffGuidanceShell } from "../src/modules/handoff/index.js";

test("BR01 scenario registry includes required arrears-first combinations", () => {
  const requiredScenarios: Br01ScenarioCode[] = [
    "ARREARS_ONLY",
    "ARREARS_PLUS_REPAIRS",
    "ARREARS_PLUS_COMPENSATION",
    "ARREARS_PLUS_DAMAGE",
    "ARREARS_PLUS_BOND_ISSUES",
    "ARREARS_PLUS_QUIET_ENJOYMENT",
    "ARREARS_PLUS_FAMILY_VIOLENCE_SENSITIVE",
    "INTERSTATE_OR_NON_VICTORIA_ROUTE_OUT"
  ];

  for (const scenarioCode of requiredScenarios) {
    assert.ok(lookupBr01Scenario(scenarioCode), `${scenarioCode} should exist in BR01 scenario registry.`);
  }
});

test("arrears-only routing keeps the unaffected continue path", () => {
  const transition = deriveBr01WorkflowTransition({
    fromWorkflowState: "TRIAGE_READY",
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    }
  });
  const triageReady = findWorkflowNode("TRIAGE_READY");

  assert.equal(transition.routingResult.scenarioCode, "ARREARS_ONLY");
  assert.equal(transition.routingResult.outcomeFamily, "DETERMINISTIC_ROUTE_ALLOWED");
  assert.equal(transition.transitionFamily, "CONTINUE");
  assert.equal(transition.insertionPointCode, "BR01_DETERMINISTIC_CONTINUE");
  assert.equal(transition.workflowState, "ARREARS_FACTS_READY");
  assert.equal(transition.continueProgression, true);
  assert.equal(transition.stopProgression, false);
  assert.ok(triageReady?.nextStates.includes("ARREARS_FACTS_READY"));
});

test("split-matter mixed objectives branch into explicit split insertion", () => {
  const transition = deriveBr01WorkflowTransition({
    objectiveCapture: {
      selectedObjectives: ["ARREARS", "COMPENSATION"]
    }
  });

  assert.equal(transition.routingResult.scenarioCode, "ARREARS_PLUS_COMPENSATION");
  assert.equal(transition.routingResult.outcomeFamily, "SPLIT_MATTER_REQUIRED");
  assert.equal(transition.transitionFamily, "SPLIT_MATTER");
  assert.equal(transition.insertionPointCode, "BR01_SPLIT_MATTER_REQUIRED");
  assert.equal(transition.workflowState, "ARREARS_FACTS_GUARDED");
  assert.equal(transition.requiresSplitMatter, true);
  assert.equal(transition.stopProgression, false);
});

test("sensitive referral posture inserts an explicit referral stop", () => {
  const transition = deriveBr01WorkflowTransition({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    riskFlags: {
      familyViolenceSensitive: true
    }
  });
  const artifacts = buildBr01RoutingArtifacts({
    matterId: "matter-referral",
    routingResult: transition.routingResult,
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    decidedAt: "2026-04-19T10:00:00.000Z"
  });

  assert.equal(transition.transitionFamily, "REFERRAL_STOP");
  assert.equal(transition.insertionPointCode, "BR01_REFERRAL_STOP");
  assert.equal(transition.workflowState, "REFER_OUT");
  assert.equal(transition.requiresReferralStop, true);
  assert.equal(transition.stopProgression, true);
  assert.equal(artifacts.referralFlag?.reasonCode, "BR01_REFERRAL_REQUIRED");
});

test("interstate and unsupported forum posture inserts explicit route-out stop", () => {
  const transition = deriveBr01WorkflowTransition({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    partyJurisdictionSignals: {
      propertyStateOrTerritory: "NSW",
      anyPartyOutsideVictoria: true,
      forumPathSupported: false
    }
  });
  const artifacts = buildBr01RoutingArtifacts({
    matterId: "matter-route-out",
    routingResult: transition.routingResult,
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    decidedAt: "2026-04-19T11:00:00.000Z"
  });

  assert.equal(transition.routingResult.scenarioCode, "INTERSTATE_OR_NON_VICTORIA_ROUTE_OUT");
  assert.equal(transition.routingResult.outcomeFamily, "ROUTE_OUT_REQUIRED");
  assert.equal(transition.transitionFamily, "ROUTE_OUT_STOP");
  assert.equal(transition.insertionPointCode, "BR01_ROUTE_OUT_STOP");
  assert.equal(transition.workflowState, "STOPPED_PENDING_EXTERNAL_INPUT");
  assert.equal(transition.requiresRouteOutStop, true);
  assert.equal(transition.stopProgression, true);
  assert.equal(artifacts.routingDecision.forumPath.path, "OTHER_OR_UNRESOLVED");
  assert.equal(artifacts.referralFlag?.reasonCode, "BR01_ROUTE_OUT_REQUIRED");
});

test("BR01 route-out posture preserves frozen trust-surface semantics", () => {
  const routingResult = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    partyJurisdictionSignals: {
      interstateRouteOut: true
    }
  });
  const artifacts = buildBr01RoutingArtifacts({
    matterId: "matter-trust",
    routingResult,
    outputMode: createOutputModeState("OFFICIAL_HANDOFF_GUIDANCE"),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    decidedAt: "2026-04-19T12:00:00.000Z"
  });
  const guidance = buildOfficialHandoffGuidanceShell({
    matterId: "matter-trust",
    forumPath: createForumPathState({
      path: "OTHER_OR_UNRESOLVED",
      status: "GUARDED_OR_UNRESOLVED",
      guardedReason: routingResult.summary
    }),
    officialHandoff: createOfficialHandoffStateRecord("READY_TO_HAND_OFF"),
    readinessOutcome: "REFER_OUT",
    carryForwardControls: artifacts.carryForwardControls
  });

  assert.ok(guidance.guidanceBlockKeys.includes("referral-stop"));
  assert.ok(guidance.trustBinding.reviewStateKeys.includes("review-state.refer-out"));
  assert.ok(guidance.trustBinding.trustCueKeys.includes("trust-cue.referral-stop"));
  assert.equal(guidance.rendererState.ownership.nextAction.kind, "REFER_OUTSIDE_STANDARD_PATH");
  assert.deepEqual(guidance.boundaryCodes, [
    "PREP_AND_HANDOFF_ONLY",
    "NO_PRODUCT_SUBMISSION",
    "NO_PORTAL_MIMICRY"
  ]);
});

test("BR01 gate preserves explicit split, referral, and route-out distinction", () => {
  const splitGate = deriveBr01WorkflowGate({
    objectiveCapture: { selectedObjectives: ["ARREARS", "DAMAGE"] }
  });
  const referralGate = deriveBr01WorkflowGate({
    objectiveCapture: { selectedObjectives: ["ARREARS"] },
    riskFlags: { familyViolenceSensitive: true }
  });
  const routeOutGate = deriveBr01WorkflowGate({
    objectiveCapture: { selectedObjectives: ["ARREARS"] },
    partyJurisdictionSignals: { interstateRouteOut: true }
  });

  assert.equal(splitGate.transitionFamily, "SPLIT_MATTER");
  assert.equal(splitGate.splitMatterRequired, true);
  assert.equal(splitGate.referralStop, false);
  assert.equal(splitGate.routeOutStop, false);

  assert.equal(referralGate.transitionFamily, "REFERRAL_STOP");
  assert.equal(referralGate.referralStop, true);
  assert.equal(referralGate.routeOutStop, false);

  assert.equal(routeOutGate.transitionFamily, "ROUTE_OUT_STOP");
  assert.equal(routeOutGate.routeOutStop, true);
  assert.equal(routeOutGate.referralStop, false);
});
