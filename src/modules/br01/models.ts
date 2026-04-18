import type { RulePosture } from "../../domain/model.js";
import type { ControlSeverity } from "../../domain/posture.js";
import type { ForumPathState } from "../../domain/preparation.js";

export const br01ClaimObjectives = [
  "ARREARS",
  "REPAIRS",
  "COMPENSATION",
  "DAMAGE",
  "BOND_ISSUES",
  "QUIET_ENJOYMENT",
  "FAMILY_VIOLENCE_SENSITIVE"
] as const;

export type Br01ClaimObjective = (typeof br01ClaimObjectives)[number];

export interface Br01ClaimObjectiveSignals {
  arrears?: boolean;
  repairs?: boolean;
  compensation?: boolean;
  damage?: boolean;
  bondIssues?: boolean;
  quietEnjoyment?: boolean;
  familyViolenceSensitive?: boolean;
}

export interface Br01ClaimObjectiveCaptureInput {
  selectedObjectives?: readonly Br01ClaimObjective[];
  objectiveSignals?: Br01ClaimObjectiveSignals;
}

export interface Br01ClaimObjectiveCapture {
  captureStatus: "CAPTURED" | "MISSING";
  objectives: Br01ClaimObjective[];
  primaryObjective?: Br01ClaimObjective;
  mixedObjectives: Br01ClaimObjective[];
}

export interface Br01PartyJurisdictionSignals {
  propertyStateOrTerritory?: string | null;
  partyStatesOrTerritories?: readonly string[];
  anyPartyOutsideVictoria?: boolean;
  interstateRouteOut?: boolean;
  forumPathSupported?: boolean;
}

export interface Br01RiskFlags {
  familyViolenceSensitive?: boolean;
}

export interface ResolveBr01RoutingInput {
  objectiveCapture?: Br01ClaimObjectiveCaptureInput;
  partyJurisdictionSignals?: Br01PartyJurisdictionSignals;
  riskFlags?: Br01RiskFlags;
}

export const br01RoutingOutcomeFamilies = [
  "DETERMINISTIC_ROUTE_ALLOWED",
  "SLOWDOWN_REVIEW_REQUIRED",
  "SPLIT_MATTER_REQUIRED",
  "REFERRAL_REQUIRED",
  "ROUTE_OUT_REQUIRED"
] as const;

export type Br01RoutingOutcomeFamily = (typeof br01RoutingOutcomeFamilies)[number];

export const br01ScenarioCodes = [
  "OBJECTIVE_CAPTURE_REQUIRED",
  "ARREARS_ONLY",
  "ARREARS_PLUS_REPAIRS",
  "ARREARS_PLUS_COMPENSATION",
  "ARREARS_PLUS_DAMAGE",
  "ARREARS_PLUS_BOND_ISSUES",
  "ARREARS_PLUS_QUIET_ENJOYMENT",
  "ARREARS_PLUS_FAMILY_VIOLENCE_SENSITIVE",
  "ARREARS_MIXED_OBJECTIVES_GUARDED",
  "ARREARS_OBJECTIVE_MISSING_ROUTE_OUT",
  "INTERSTATE_OR_NON_VICTORIA_ROUTE_OUT"
] as const;

export type Br01ScenarioCode = (typeof br01ScenarioCodes)[number];

export const br01RoutingReasonCodes = [
  "OBJECTIVE_CAPTURE_REQUIRED",
  "ARREARS_ONLY_ROUTE_ALLOWED",
  "ARREARS_PLUS_REPAIRS_SLOWDOWN",
  "SPLIT_MATTER_COMPENSATION",
  "SPLIT_MATTER_DAMAGE",
  "SPLIT_MATTER_BOND_ISSUES",
  "SPLIT_MATTER_QUIET_ENJOYMENT",
  "MIXED_OBJECTIVES_GUARDED",
  "FAMILY_VIOLENCE_SENSITIVE_REFERRAL",
  "ARREARS_OBJECTIVE_MISSING",
  "INTERSTATE_PARTY_ROUTE_OUT",
  "NON_VICTORIA_PROPERTY_ROUTE_OUT",
  "UNSUPPORTED_FORUM_ROUTE_OUT"
] as const;

export type Br01RoutingReasonCode = (typeof br01RoutingReasonCodes)[number];

export const br01ScenarioMatchTypes = [
  "EXACT",
  "INCLUDES",
  "SIGNAL_ONLY"
] as const;

export type Br01ScenarioMatchType = (typeof br01ScenarioMatchTypes)[number];

export interface Br01ScenarioRegistryEntry {
  code: Br01ScenarioCode;
  label: string;
  matchType: Br01ScenarioMatchType;
  requiredObjectives: readonly Br01ClaimObjective[];
  outcomeFamily: Br01RoutingOutcomeFamily;
  severity: ControlSeverity;
  posture: RulePosture;
  summary: string;
  defaultReasonCodes: readonly Br01RoutingReasonCode[];
  guardedInsertionPoints: readonly string[];
  notes: readonly string[];
}

export interface Br01RoutingOutcomeFlags {
  deterministicRouteAllowed: boolean;
  slowdownReviewRequired: boolean;
  splitMatterRequired: boolean;
  referralRequired: boolean;
  routeOutRequired: boolean;
}

export interface Br01RoutingResult {
  capture: Br01ClaimObjectiveCapture;
  outcomeFamily: Br01RoutingOutcomeFamily;
  scenarioCode: Br01ScenarioCode;
  matchedScenarioCodes: Br01ScenarioCode[];
  severity: ControlSeverity;
  posture: RulePosture;
  summary: string;
  reasonCodes: Br01RoutingReasonCode[];
  forumPath: ForumPathState;
  flags: Br01RoutingOutcomeFlags;
  guardedInsertionPoints: string[];
}
