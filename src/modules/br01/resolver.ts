import { createForumPathState } from "../../domain/preparation.js";
import { br01ScenarioRegistry } from "./registry.js";
import {
  br01ClaimObjectives,
  type Br01ClaimObjective,
  type Br01ClaimObjectiveCapture,
  type Br01ClaimObjectiveCaptureInput,
  type Br01ClaimObjectiveSignals,
  type Br01PartyJurisdictionSignals,
  type Br01RoutingOutcomeFamily,
  type Br01RoutingReasonCode,
  type Br01RoutingResult,
  type Br01ScenarioCode,
  type Br01ScenarioRegistryEntry,
  type ResolveBr01RoutingInput
} from "./models.js";

const objectiveBySignal: Record<keyof Br01ClaimObjectiveSignals, Br01ClaimObjective> = {
  arrears: "ARREARS",
  repairs: "REPAIRS",
  compensation: "COMPENSATION",
  damage: "DAMAGE",
  bondIssues: "BOND_ISSUES",
  quietEnjoyment: "QUIET_ENJOYMENT",
  familyViolenceSensitive: "FAMILY_VIOLENCE_SENSITIVE"
};

const outcomePriority: Record<Br01RoutingOutcomeFamily, number> = {
  DETERMINISTIC_ROUTE_ALLOWED: 0,
  SLOWDOWN_REVIEW_REQUIRED: 1,
  SPLIT_MATTER_REQUIRED: 2,
  REFERRAL_REQUIRED: 3,
  ROUTE_OUT_REQUIRED: 4
};

const scenarioOrder = new Map(
  br01ScenarioRegistry.map((entry, index) => [entry.code, index] as const)
);

export function lookupBr01Scenario(
  code: Br01ScenarioCode
): Br01ScenarioRegistryEntry | undefined {
  return br01ScenarioRegistry.find((entry) => entry.code === code);
}

export function captureBr01ClaimObjectives(
  input: Br01ClaimObjectiveCaptureInput = {}
): Br01ClaimObjectiveCapture {
  const capturedObjectives = new Set<Br01ClaimObjective>();

  for (const objective of input.selectedObjectives ?? []) {
    capturedObjectives.add(objective);
  }

  const objectiveSignals = input.objectiveSignals ?? {};

  for (const signalKey of Object.keys(objectiveBySignal) as Array<keyof Br01ClaimObjectiveSignals>) {
    if (objectiveSignals[signalKey] === true) {
      capturedObjectives.add(objectiveBySignal[signalKey]);
    }
  }

  const objectives = br01ClaimObjectives.filter((objective) => capturedObjectives.has(objective));

  if (objectives.length === 0) {
    return {
      captureStatus: "MISSING",
      objectives: [],
      mixedObjectives: []
    };
  }

  const fallbackPrimaryObjective = objectives[0];

  if (!fallbackPrimaryObjective) {
    throw new Error("BR01 objective capture expected at least one objective.");
  }

  const primaryObjective = objectives.includes("ARREARS")
    ? "ARREARS"
    : fallbackPrimaryObjective;

  return {
    captureStatus: "CAPTURED",
    objectives,
    primaryObjective,
    mixedObjectives: objectives.filter((objective) => objective !== primaryObjective)
  };
}

export function resolveBr01Routing(
  input: ResolveBr01RoutingInput = {}
): Br01RoutingResult {
  const capture = captureBr01ClaimObjectives(input.objectiveCapture);

  if (capture.captureStatus === "MISSING") {
    return buildRoutingResult({
      capture,
      scenarioCode: "OBJECTIVE_CAPTURE_REQUIRED"
    });
  }

  if (!capture.objectives.includes("ARREARS")) {
    return buildRoutingResult({
      capture,
      scenarioCode: "ARREARS_OBJECTIVE_MISSING_ROUTE_OUT"
    });
  }

  const routeOutReasonCodes = collectRouteOutReasonCodes(input.partyJurisdictionSignals);

  if (routeOutReasonCodes.length > 0) {
    return buildRoutingResult({
      capture,
      scenarioCode: "INTERSTATE_OR_NON_VICTORIA_ROUTE_OUT",
      reasonCodes: routeOutReasonCodes
    });
  }

  if (isFamilyViolenceSensitive(capture, input)) {
    return buildRoutingResult({
      capture,
      scenarioCode: "ARREARS_PLUS_FAMILY_VIOLENCE_SENSITIVE"
    });
  }

  const matchedObjectiveScenarios = findObjectiveScenarioMatches(capture.objectives);

  if (matchedObjectiveScenarios.length === 0) {
    return buildRoutingResult({
      capture,
      scenarioCode: "ARREARS_MIXED_OBJECTIVES_GUARDED"
    });
  }

  const selectedScenario = choosePreferredScenario(matchedObjectiveScenarios);

  return buildRoutingResult({
    capture,
    scenarioCode: selectedScenario.code,
    matchedScenarioCodes: matchedObjectiveScenarios.map((scenario) => scenario.code)
  });
}

function buildRoutingResult(input: {
  capture: Br01ClaimObjectiveCapture;
  scenarioCode: Br01ScenarioCode;
  reasonCodes?: readonly Br01RoutingReasonCode[];
  matchedScenarioCodes?: readonly Br01ScenarioCode[];
}): Br01RoutingResult {
  const scenario = requireScenario(input.scenarioCode);
  const reasonCodes = uniqueValues([
    ...scenario.defaultReasonCodes,
    ...(input.reasonCodes ?? [])
  ]);

  return {
    capture: input.capture,
    outcomeFamily: scenario.outcomeFamily,
    scenarioCode: scenario.code,
    matchedScenarioCodes: [...(input.matchedScenarioCodes ?? [scenario.code])],
    severity: scenario.severity,
    posture: scenario.posture,
    summary: scenario.summary,
    reasonCodes,
    forumPath: buildForumPathForOutcomeFamily(scenario),
    flags: mapOutcomeFamilyToFlags(scenario.outcomeFamily),
    guardedInsertionPoints: uniqueValues([...scenario.guardedInsertionPoints])
  };
}

function buildForumPathForOutcomeFamily(
  scenario: Br01ScenarioRegistryEntry
): Br01RoutingResult["forumPath"] {
  if (scenario.outcomeFamily === "DETERMINISTIC_ROUTE_ALLOWED") {
    return createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS",
      status: "IN_SCOPE_CONFIRMED"
    });
  }

  if (
    scenario.outcomeFamily === "SLOWDOWN_REVIEW_REQUIRED"
    || scenario.outcomeFamily === "SPLIT_MATTER_REQUIRED"
  ) {
    return createForumPathState({
      path: "VIC_VCAT_RENT_ARREARS",
      status: "GUARDED_OR_UNRESOLVED",
      guardedReason: scenario.summary
    });
  }

  return createForumPathState({
    path: "OTHER_OR_UNRESOLVED",
    status: "GUARDED_OR_UNRESOLVED",
    guardedReason: scenario.summary
  });
}

function mapOutcomeFamilyToFlags(
  outcomeFamily: Br01RoutingOutcomeFamily
): Br01RoutingResult["flags"] {
  return {
    deterministicRouteAllowed: outcomeFamily === "DETERMINISTIC_ROUTE_ALLOWED",
    slowdownReviewRequired: outcomeFamily === "SLOWDOWN_REVIEW_REQUIRED",
    splitMatterRequired: outcomeFamily === "SPLIT_MATTER_REQUIRED",
    referralRequired: outcomeFamily === "REFERRAL_REQUIRED",
    routeOutRequired: outcomeFamily === "ROUTE_OUT_REQUIRED"
  };
}

function collectRouteOutReasonCodes(
  signals: Br01PartyJurisdictionSignals | undefined
): Br01RoutingReasonCode[] {
  if (!signals) {
    return [];
  }

  const reasonCodes: Br01RoutingReasonCode[] = [];
  const propertyState = normalizeStateOrTerritory(signals.propertyStateOrTerritory);

  if (propertyState.length > 0 && propertyState !== "VIC") {
    reasonCodes.push("NON_VICTORIA_PROPERTY_ROUTE_OUT");
  }

  const interstateFromPartyStates = (signals.partyStatesOrTerritories ?? []).some((state) => {
    const normalized = normalizeStateOrTerritory(state);
    return normalized.length > 0 && normalized !== "VIC";
  });

  if (
    signals.interstateRouteOut === true
    || signals.anyPartyOutsideVictoria === true
    || interstateFromPartyStates
  ) {
    reasonCodes.push("INTERSTATE_PARTY_ROUTE_OUT");
  }

  if (signals.forumPathSupported === false) {
    reasonCodes.push("UNSUPPORTED_FORUM_ROUTE_OUT");
  }

  return uniqueValues(reasonCodes);
}

function isFamilyViolenceSensitive(
  capture: Br01ClaimObjectiveCapture,
  input: ResolveBr01RoutingInput
): boolean {
  if (input.riskFlags?.familyViolenceSensitive === true) {
    return true;
  }

  return capture.objectives.includes("FAMILY_VIOLENCE_SENSITIVE");
}

function findObjectiveScenarioMatches(
  objectives: readonly Br01ClaimObjective[]
): Br01ScenarioRegistryEntry[] {
  return br01ScenarioRegistry.filter((entry) => {
    if (entry.matchType === "SIGNAL_ONLY") {
      return false;
    }

    const includesAllRequiredObjectives = entry.requiredObjectives.every((objective) => (
      objectives.includes(objective)
    ));

    if (!includesAllRequiredObjectives) {
      return false;
    }

    if (entry.matchType === "EXACT") {
      return entry.requiredObjectives.length === objectives.length;
    }

    return true;
  });
}

function choosePreferredScenario(
  scenarios: readonly Br01ScenarioRegistryEntry[]
): Br01ScenarioRegistryEntry {
  const ranked = [...scenarios].sort((left, right) => {
    const outcomeDifference = outcomePriority[right.outcomeFamily]
      - outcomePriority[left.outcomeFamily];

    if (outcomeDifference !== 0) {
      return outcomeDifference;
    }

    const specificityDifference = right.requiredObjectives.length
      - left.requiredObjectives.length;

    if (specificityDifference !== 0) {
      return specificityDifference;
    }

    return getScenarioOrder(left.code) - getScenarioOrder(right.code);
  });

  const selectedScenario = ranked[0];

  if (!selectedScenario) {
    throw new Error("BR01 scenario ranking expected at least one scenario.");
  }

  return selectedScenario;
}

function getScenarioOrder(code: Br01ScenarioCode): number {
  return scenarioOrder.get(code) ?? Number.MAX_SAFE_INTEGER;
}

function requireScenario(code: Br01ScenarioCode): Br01ScenarioRegistryEntry {
  const scenario = lookupBr01Scenario(code);

  if (!scenario) {
    throw new Error(`Unknown BR01 scenario code: ${code}`);
  }

  return scenario;
}

function normalizeStateOrTerritory(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toUpperCase();

  if (normalized === "VICTORIA") {
    return "VIC";
  }

  return normalized;
}

function uniqueValues<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}
