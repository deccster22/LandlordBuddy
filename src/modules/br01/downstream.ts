import {
  GUARDED_INSERTION_POINTS,
  type ReferralFlag,
  type RoutingDecision
} from "../../domain/model.js";
import type { CarryForwardControl } from "../../domain/posture.js";
import type { NoticeReadinessOutcome } from "../notice-readiness/index.js";
import {
  deriveBr01CarryForwardControls
} from "./persistence.js";
import type { Br01RoutingResult } from "./models.js";

export interface Br01DownstreamPosture {
  readinessOutcome?: NoticeReadinessOutcome;
  carryForwardControls: CarryForwardControl[];
  splitMatterReviewRequired: boolean;
  referralStopRequired: boolean;
  routeOutStopRequired: boolean;
}

export interface ResolveBr01DownstreamPostureInput {
  routingResult?: Br01RoutingResult;
  routingDecision?: RoutingDecision;
  referralFlags?: readonly ReferralFlag[];
}

export function deriveBr01DownstreamPosture(
  routingResult: Br01RoutingResult
): Br01DownstreamPosture {
  const readinessOutcome = mapBr01OutcomeToReadinessOutcome(
    routingResult.outcomeFamily
  );
  const carryForwardControls = routingResult.outcomeFamily === "DETERMINISTIC_ROUTE_ALLOWED"
    ? []
    : deriveBr01CarryForwardControls(routingResult);

  return {
    ...(readinessOutcome ? { readinessOutcome } : {}),
    carryForwardControls,
    splitMatterReviewRequired: routingResult.outcomeFamily === "SPLIT_MATTER_REQUIRED",
    referralStopRequired: routingResult.outcomeFamily === "REFERRAL_REQUIRED",
    routeOutStopRequired: routingResult.outcomeFamily === "ROUTE_OUT_REQUIRED"
  };
}

export function deriveBr01DownstreamPostureFromStoredArtifacts(input: {
  routingDecision: RoutingDecision;
  referralFlags?: readonly ReferralFlag[];
}): Br01DownstreamPosture {
  const reasonCodes = parseReasonCodesFromRationale(input.routingDecision.rationale);
  const activeBr01ReferralFlag = selectActiveBr01ReferralFlag(input);
  const routeOutStopRequired = activeBr01ReferralFlag?.reasonCode === "BR01_ROUTE_OUT_REQUIRED"
    || reasonCodes.some((reasonCode) => routeOutReasonCodes.has(reasonCode));
  const splitMatterReviewRequired = reasonCodes.some((reasonCode) => reasonCode.startsWith("SPLIT_MATTER_"));
  const referralStopRequired = !routeOutStopRequired
    && (
      activeBr01ReferralFlag?.reasonCode === "BR01_REFERRAL_REQUIRED"
      || input.routingDecision.severity === "REFERRAL"
    );
  const deterministicContinue = !splitMatterReviewRequired
    && !referralStopRequired
    && !routeOutStopRequired
    && input.routingDecision.severity === "INFO"
    && input.routingDecision.forumPath.path === "VIC_VCAT_RENT_ARREARS"
    && input.routingDecision.forumPath.status === "IN_SCOPE_CONFIRMED";
  const readinessOutcome = deterministicContinue
    ? undefined
    : routeOutStopRequired || referralStopRequired
      ? "REFER_OUT"
      : "REVIEW_REQUIRED";
  const carryForwardControls = deterministicContinue
    ? []
    : [
        buildStoredArtifactControl({
          routingDecision: input.routingDecision,
          reasonCodes,
          ...(activeBr01ReferralFlag
            ? { activeBr01ReferralFlag }
            : {}),
          splitMatterReviewRequired,
          referralStopRequired,
          routeOutStopRequired
        })
      ];

  return {
    ...(readinessOutcome ? { readinessOutcome } : {}),
    carryForwardControls,
    splitMatterReviewRequired,
    referralStopRequired,
    routeOutStopRequired
  };
}

export function resolveBr01DownstreamPosture(
  input: ResolveBr01DownstreamPostureInput
): Br01DownstreamPosture | undefined {
  if (input.routingDecision) {
    return deriveBr01DownstreamPostureFromStoredArtifacts({
      routingDecision: input.routingDecision,
      ...(input.referralFlags ? { referralFlags: input.referralFlags } : {})
    });
  }

  if (input.routingResult) {
    return deriveBr01DownstreamPosture(input.routingResult);
  }

  return undefined;
}

function mapBr01OutcomeToReadinessOutcome(
  outcomeFamily: Br01RoutingResult["outcomeFamily"]
): NoticeReadinessOutcome | undefined {
  switch (outcomeFamily) {
    case "DETERMINISTIC_ROUTE_ALLOWED":
      return undefined;
    case "SLOWDOWN_REVIEW_REQUIRED":
    case "SPLIT_MATTER_REQUIRED":
      return "REVIEW_REQUIRED";
    case "REFERRAL_REQUIRED":
    case "ROUTE_OUT_REQUIRED":
      return "REFER_OUT";
  }
}

function selectActiveBr01ReferralFlag(input: {
  routingDecision: RoutingDecision;
  referralFlags?: readonly ReferralFlag[];
}): ReferralFlag | undefined {
  const candidates = (input.referralFlags ?? [])
    .filter((flag) => (
      flag.matterId === input.routingDecision.matterId
      && flag.resolvedAt === undefined
      && (flag.reasonCode === "BR01_REFERRAL_REQUIRED" || flag.reasonCode === "BR01_ROUTE_OUT_REQUIRED")
    ))
    .sort((left, right) => right.openedAt.localeCompare(left.openedAt));

  return candidates[0];
}

function parseReasonCodesFromRationale(rationale: string): string[] {
  const reasonCodeSection = /\(reasons:\s*([^)]+)\)\s*$/u.exec(rationale)?.[1];

  if (!reasonCodeSection) {
    return [];
  }

  return reasonCodeSection
    .split(",")
    .map((reasonCode) => reasonCode.trim())
    .filter((reasonCode) => reasonCode.length > 0);
}

function buildStoredArtifactControl(input: {
  routingDecision: RoutingDecision;
  reasonCodes: string[];
  activeBr01ReferralFlag?: ReferralFlag;
  splitMatterReviewRequired: boolean;
  referralStopRequired: boolean;
  routeOutStopRequired: boolean;
}): CarryForwardControl {
  const baseSummary = input.routingDecision.guardedReason
    ?? stripReasonSuffix(input.routingDecision.rationale);
  const referralReasonCode = input.activeBr01ReferralFlag?.reasonCode;
  const firstSplitReasonCode = input.reasonCodes.find((reasonCode) => reasonCode.startsWith("SPLIT_MATTER_"));
  const fallbackReasonCode = input.reasonCodes[0];
  const controlCodeCore = referralReasonCode
    ?? firstSplitReasonCode
    ?? fallbackReasonCode
    ?? (input.routeOutStopRequired
      ? "ROUTE_OUT_REQUIRED"
      : input.referralStopRequired
        ? "REFERRAL_REQUIRED"
        : input.splitMatterReviewRequired
          ? "SPLIT_MATTER_REQUIRED"
          : "GUARDED_REVIEW_REQUIRED");
  const controlSeverity = input.routeOutStopRequired || input.referralStopRequired
    ? "REFERRAL"
    : "SLOWDOWN";

  return {
    code: normalizeStoredControlCode(controlCodeCore),
    severity: controlSeverity,
    summary: baseSummary,
    visibleSourceType: "UNRESOLVED_ITEM",
    deterministic: false,
    guardedInsertionPoint: GUARDED_INSERTION_POINTS.mixedClaimRouting
  };
}

function normalizeStoredControlCode(controlCodeCore: string): string {
  return controlCodeCore.startsWith("BR01_")
    ? controlCodeCore
    : `BR01_${controlCodeCore}`;
}

function stripReasonSuffix(rationale: string): string {
  return rationale.replace(/\s*\(reasons:\s*[^)]*\)\s*$/u, "");
}

const routeOutReasonCodes = new Set([
  "ARREARS_OBJECTIVE_MISSING",
  "INTERSTATE_PARTY_ROUTE_OUT",
  "NON_VICTORIA_PROPERTY_ROUTE_OUT",
  "UNSUPPORTED_FORUM_ROUTE_OUT"
]);
