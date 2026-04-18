import test from "node:test";
import assert from "node:assert/strict";

import {
  lookupBr01Scenario,
  resolveBr01Routing,
  type Br01ScenarioCode
} from "../src/modules/br01/index.js";
import { deriveBr01WorkflowGate } from "../src/workflow/arrearsHeroWorkflow.js";

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

test("arrears-only routing remains deterministic and unlocks arrears facts progression", () => {
  const gate = deriveBr01WorkflowGate({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    }
  });

  assert.equal(gate.routingResult.scenarioCode, "ARREARS_ONLY");
  assert.equal(gate.routingResult.outcomeFamily, "DETERMINISTIC_ROUTE_ALLOWED");
  assert.equal(gate.workflowState, "ARREARS_FACTS_READY");
  assert.equal(gate.readyForArrearsFacts, true);
  assert.equal(gate.routingResult.flags.deterministicRouteAllowed, true);
  assert.equal(gate.routingResult.flags.slowdownReviewRequired, false);
});

test("arrears plus repairs slows down for review", () => {
  const gate = deriveBr01WorkflowGate({
    objectiveCapture: {
      selectedObjectives: ["ARREARS", "REPAIRS"]
    }
  });

  assert.equal(gate.routingResult.scenarioCode, "ARREARS_PLUS_REPAIRS");
  assert.equal(gate.routingResult.outcomeFamily, "SLOWDOWN_REVIEW_REQUIRED");
  assert.equal(gate.workflowState, "TRIAGE_SLOWDOWN");
  assert.equal(gate.triageSlowdown, true);
  assert.equal(gate.routingResult.flags.slowdownReviewRequired, true);
});

test("family-violence-sensitive posture is referral-first", () => {
  const gate = deriveBr01WorkflowGate({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    riskFlags: {
      familyViolenceSensitive: true
    }
  });

  assert.equal(gate.routingResult.scenarioCode, "ARREARS_PLUS_FAMILY_VIOLENCE_SENSITIVE");
  assert.equal(gate.routingResult.outcomeFamily, "REFERRAL_REQUIRED");
  assert.equal(gate.workflowState, "REFER_OUT");
  assert.equal(gate.referralRequired, true);
  assert.equal(gate.routingResult.flags.routeOutRequired, false);
});

test("interstate and unsupported forum posture routes out explicitly", () => {
  const result = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS"]
    },
    partyJurisdictionSignals: {
      propertyStateOrTerritory: "NSW",
      anyPartyOutsideVictoria: true,
      forumPathSupported: false
    }
  });

  assert.equal(result.scenarioCode, "INTERSTATE_OR_NON_VICTORIA_ROUTE_OUT");
  assert.equal(result.outcomeFamily, "ROUTE_OUT_REQUIRED");
  assert.equal(result.flags.routeOutRequired, true);
  assert.equal(result.forumPath.path, "OTHER_OR_UNRESOLVED");
  assert.ok(result.reasonCodes.includes("NON_VICTORIA_PROPERTY_ROUTE_OUT"));
  assert.ok(result.reasonCodes.includes("INTERSTATE_PARTY_ROUTE_OUT"));
  assert.ok(result.reasonCodes.includes("UNSUPPORTED_FORUM_ROUTE_OUT"));
});

test("mixed objectives that include compensation stay split-matter and do not flatten repairs", () => {
  const result = resolveBr01Routing({
    objectiveCapture: {
      selectedObjectives: ["ARREARS", "REPAIRS", "COMPENSATION"]
    }
  });

  assert.equal(result.outcomeFamily, "SPLIT_MATTER_REQUIRED");
  assert.equal(result.scenarioCode, "ARREARS_PLUS_COMPENSATION");
  assert.equal(result.flags.splitMatterRequired, true);
  assert.equal(result.flags.slowdownReviewRequired, false);
  assert.ok(result.matchedScenarioCodes.includes("ARREARS_PLUS_REPAIRS"));
  assert.ok(result.matchedScenarioCodes.includes("ARREARS_PLUS_COMPENSATION"));
});
