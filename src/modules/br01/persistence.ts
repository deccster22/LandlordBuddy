import type {
  DateTimeString,
  EntityId,
  ReferralFlag,
  RoutingDecision
} from "../../domain/model.js";
import type {
  OfficialHandoffStateRecord,
  OutputModeState
} from "../../domain/preparation.js";
import type { CarryForwardControl } from "../../domain/posture.js";
import type { Br01RoutingResult } from "./models.js";

export interface BuildBr01RoutingArtifactsInput {
  matterId: EntityId;
  routingResult: Br01RoutingResult;
  outputMode: OutputModeState;
  officialHandoff: OfficialHandoffStateRecord;
  decidedAt: DateTimeString;
  routingDecisionId?: EntityId;
  referralFlagId?: EntityId;
}

export interface Br01RoutingArtifacts {
  routingDecision: RoutingDecision;
  referralFlag?: ReferralFlag;
  carryForwardControls: CarryForwardControl[];
}

export function buildBr01RoutingArtifacts(
  input: BuildBr01RoutingArtifactsInput
): Br01RoutingArtifacts {
  const routingDecision = createBr01RoutingDecision(input);
  const referralFlag = createBr01ReferralFlag(input);

  return {
    routingDecision,
    ...(referralFlag ? { referralFlag } : {}),
    carryForwardControls: deriveBr01CarryForwardControls(input.routingResult)
  };
}

export function createBr01RoutingDecision(
  input: BuildBr01RoutingArtifactsInput
): RoutingDecision {
  const rationaleSuffix = input.routingResult.reasonCodes.length > 0
    ? ` (reasons: ${input.routingResult.reasonCodes.join(", ")})`
    : "";
  const guardedReason = input.routingResult.posture === "DETERMINISTIC"
    ? undefined
    : input.routingResult.summary;

  return {
    id: input.routingDecisionId ?? `${input.matterId}:br01:routing-decision`,
    matterId: input.matterId,
    forumPath: input.routingResult.forumPath,
    outputMode: input.outputMode,
    officialHandoff: input.officialHandoff,
    severity: input.routingResult.severity,
    rationale: `${input.routingResult.summary}${rationaleSuffix}`,
    ...(guardedReason ? { guardedReason } : {}),
    decidedAt: input.decidedAt
  };
}

export function createBr01ReferralFlag(
  input: BuildBr01RoutingArtifactsInput
): ReferralFlag | undefined {
  const reasonCode = mapOutcomeToReferralReasonCode(input.routingResult.outcomeFamily);

  if (!reasonCode) {
    return undefined;
  }

  return {
    id: input.referralFlagId ?? `${input.matterId}:br01:referral-flag`,
    matterId: input.matterId,
    severity: "REFERRAL",
    reasonCode,
    summary: input.routingResult.summary,
    openedAt: input.decidedAt
  };
}

export function deriveBr01CarryForwardControls(
  routingResult: Br01RoutingResult
): CarryForwardControl[] {
  return [
    {
      code: `BR01_${routingResult.scenarioCode}`,
      severity: routingResult.severity,
      summary: routingResult.summary,
      visibleSourceType: routingResult.posture === "DETERMINISTIC"
        ? "STABLE_RULE"
        : "UNRESOLVED_ITEM",
      deterministic: routingResult.posture === "DETERMINISTIC",
      ...(routingResult.guardedInsertionPoints[0]
        ? { guardedInsertionPoint: routingResult.guardedInsertionPoints[0] }
        : {})
    }
  ];
}

function mapOutcomeToReferralReasonCode(
  outcomeFamily: Br01RoutingResult["outcomeFamily"]
): ReferralFlag["reasonCode"] | undefined {
  switch (outcomeFamily) {
    case "REFERRAL_REQUIRED":
      return "BR01_REFERRAL_REQUIRED";
    case "ROUTE_OUT_REQUIRED":
      return "BR01_ROUTE_OUT_REQUIRED";
    default:
      return undefined;
  }
}
