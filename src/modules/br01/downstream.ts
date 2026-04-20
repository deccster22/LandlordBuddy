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
